import { NextResponse } from 'next/server';
import { authenticateApiRequest } from '@/lib/server/api-auth';
import { checkRateLimit } from '@/lib/server/rate-limit';
import { safeServerFetch } from '@/lib/server/safe-fetch';
import { JsonBodyError, readJsonBody } from '@/lib/server/json-body';
import { emitAuditLog } from '@/lib/server/audit-log';

type Payload = {
  recommendedSchool: string;
  recommendedProgram: string;
  programDuration?: string;
  englishTestRequirement?: string;
  approximateCost?: string;
  destinationCountry?: string;
};

const MAX_BRIEF_INFO_REQUEST_BYTES = 12 * 1024;

function buildPrompt(payload: Payload, style?: string) {
  const extra = [
    payload.programDuration ? `Program duration: ${payload.programDuration}` : null,
    payload.englishTestRequirement ? `English test requirement: ${payload.englishTestRequirement}` : null,
    payload.approximateCost ? `Approximate cost: ${payload.approximateCost}` : null,
    payload.destinationCountry ? `Destination: ${payload.destinationCountry}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const styleInstruction = style
    ? `Style: ${style}. Vary phrasing and sentence order; prefer synonyms and different openings across requests.`
    : 'Vary phrasing and sentence order; prefer synonyms and different openings across requests.';

  return `You are an education consultant writing a brief, helpful description for a student.\nWrite 1 short paragraph (single paragraph) about the recommended school and program.\nRequirements:\n- Minimum 170 characters (to satisfy a 150-char UI requirement).\n- Professional, clear, friendly tone unless otherwise specified.\n- Avoid making up specific factual claims (rankings, exact tuition) unless provided in the input.\n- Focus on general benefits: program fit, learning outcomes, student support, and why it matches the student's path.\n- ${styleInstruction}\n\nRecommended School: ${payload.recommendedSchool}\nRecommended Program: ${payload.recommendedProgram}${extra ? `\n${extra}` : ''}`;
}

async function callOpenAI(prompt: string, maxOutputTokens = 280): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }
  const model = process.env.OPENAI_MODEL || 'gpt-5-mini';

  const response = await safeServerFetch(
    'https://api.openai.com/v1/responses',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [{ role: 'user', content: prompt }],
        max_output_tokens: maxOutputTokens,
        reasoning: { effort: 'low' },
        text: { verbosity: 'low' },
      }),
    },
    { timeoutMs: 10_000, retries: 1, retryDelayMs: 200 },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.warn('[Brief Info API] OpenAI upstream error', response.status, body.slice(0, 500));
    throw new Error('AI service unavailable.');
  }

  const data = await response.json();
  const outputText = (() => {
    if (typeof data?.output_text === 'string') return data.output_text;
    const parts = Array.isArray(data?.output)
      ? data.output.flatMap((item: { content?: Array<{ text?: unknown; type?: string }> }) =>
          Array.isArray(item.content) ? item.content : [],
        )
      : [];
    return parts
      .map((part: { text?: unknown; type?: string }) => {
        if (typeof part?.text === 'string') return part.text;
        if (part?.type === 'output_text') {
          const textValue = (part?.text as { value?: string })?.value;
          return typeof textValue === 'string' ? textValue : '';
        }
        return '';
      })
      .join('');
  })();

  const text = outputText?.trim() || '';
  if (!text) {
    console.warn('[Brief Info API] Empty OpenAI output.');
  }
  return text;
}

export async function POST(req: Request) {
  try {
    const authResult = await authenticateApiRequest(req);
    if (authResult.response) return authResult.response;
    const actor = authResult.actor;
    if (!actor) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    const actorRoles = [
      actor.isAdmin ? 'admin' : '',
      actor.isStaffByClaim ? 'staff' : '',
      actor.isStaffByEmailFallback ? 'legacy_staff_compat' : '',
    ].filter(Boolean);

    const rate = await checkRateLimit({
      scope: 'api.ai.brief-info',
      identity: `uid:${actor.uid}`,
      limit: 20,
      windowMs: 5 * 60 * 1000,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } },
      );
    }

    let payload: Payload;
    try {
      payload = await readJsonBody<Payload>(req, MAX_BRIEF_INFO_REQUEST_BYTES);
    } catch (error) {
      if (error instanceof JsonBodyError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }
    if (!payload.recommendedSchool?.trim() || !payload.recommendedProgram?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const styles = ['friendly', 'concise', 'formal', 'warm', 'emphatic'];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const prompt = buildPrompt(payload, style);

    let text = await callOpenAI(prompt, 280);
    if (text.replace(/\s+/g, ' ').length < 150) {
      text = await callOpenAI(`${prompt}\n\nExpand the paragraph to be at least 200 characters.`, 280);
    }

    void emitAuditLog({
      event: 'ai.brief-info.generate',
      outcome: 'success',
      actor: {
        uid: actor.uid,
        email: actor.email,
        roles: actorRoles,
        isAdmin: actor.isAdmin,
        isStaff: actor.isStaff,
      },
      target: 'api.ai.brief-info',
      metadata: {
        recommendedSchoolLength: payload.recommendedSchool.length,
        recommendedProgramLength: payload.recommendedProgram.length,
        generatedTextLength: text.length,
      },
    });

    return NextResponse.json({ text });
  } catch (error) {
    console.error('[runtime-alert][api.ai.brief-info]', error);
    void emitAuditLog({
      event: 'ai.brief-info.generate',
      outcome: 'failed',
      target: 'api.ai.brief-info',
      metadata: {
        reason: error instanceof Error ? error.message.slice(0, 240) : String(error).slice(0, 240),
      },
    });
    const isConfigError = String((error as { message?: unknown })?.message || '').includes('OPENAI_API_KEY');
    if (isConfigError) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'AI generation failed.' }, { status: 503 });
  }
}
