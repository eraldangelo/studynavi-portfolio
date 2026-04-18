import type { ChatMessage } from '@/lib/chat/types';
import { safeServerFetch } from '@/lib/server/safe-fetch';

/**
 * Correction detection patterns — checks if the user is correcting a previous answer
 */
const CORRECTION_PATTERNS = [
  /\b(?:no|nope|wrong|incorrect|that'?s\s*(?:not|wrong|incorrect)|actually|not\s*(?:true|correct|right)|you'?re\s*wrong|mistake)\b/i,
  /\b(?:it'?s\s*actually|the\s*(?:correct|right|actual)\s*(?:answer|info|information|one)|should\s*be|it\s*should|you\s*said.*but)\b/i,
];

export function looksLikeCorrection(message: string, history: ChatMessage[]): boolean {
  // Need at least one prior assistant message to correct
  if (!history.some(m => m.role === 'assistant')) return false;
  return CORRECTION_PATTERNS.some(p => p.test(message));
}

/**
 * Extract a correction from the conversation using the AI
 */
export async function extractCorrection(
  apiKey: string,
  model: string,
  history: ChatMessage[],
  userMessage: string
): Promise<{ topic: string; wrongAnswer: string; correctedAnswer: string } | null> {
  // Find the last assistant message (the one being corrected)
  const lastAssistant = [...history].reverse().find(m => m.role === 'assistant');
  if (!lastAssistant) return null;

  const extractionPrompt = `You are a data extraction tool. The user corrected an AI assistant's previous answer.

Previous assistant answer:
"${lastAssistant.content.substring(0, 500)}"

User's correction:
"${userMessage}"

Extract the correction as JSON with exactly these fields:
- "topic": a short lowercase slug describing what was corrected (e.g. "abm-intakes", "canada-dependent-visa", "ielts-fee-philippines")
- "wrongAnswer": what the assistant said that was wrong (1 sentence max)
- "correctedAnswer": what the correct information is (1 sentence max)

If this is NOT actually a factual correction (just disagreement, opinion, or unrelated), return exactly: {"skip": true}

Respond with ONLY the JSON, no markdown.`;

  try {
    const response = await safeServerFetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [{ role: 'user', content: extractionPrompt }],
        max_output_tokens: 256,
      }),
    }, { timeoutMs: 10_000, retries: 1, retryDelayMs: 200 });

    if (!response.ok) return null;

    const data = await response.json();
    const text = typeof data?.output_text === 'string' ? data.output_text.trim() : '';
    if (!text) return null;

    // Parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.skip) return null;
    if (!parsed.topic || !parsed.wrongAnswer || !parsed.correctedAnswer) return null;

    return {
      topic: String(parsed.topic).toLowerCase().replace(/\s+/g, '-').substring(0, 80),
      wrongAnswer: String(parsed.wrongAnswer).substring(0, 300),
      correctedAnswer: String(parsed.correctedAnswer).substring(0, 300),
    };
  } catch (err) {
    console.warn('[Corrections] Extraction failed:', err);
    return null;
  }
}
