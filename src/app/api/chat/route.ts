import { NextResponse } from 'next/server';
import { SEARCH_CONFIG, shouldVerifyRecency } from '@/lib/search/brave-search';
import {
  SYSTEM_PROMPT,
  isSchoolRecommendationQuery,
  findMentionedPartnerSchools,
  searchPartnerSchools,
  formatPartnerSchoolsForPrompt,
  sanitizeToPhilippines,
  isOffTopicQuery,
  getOffTopicResponse,
  loadCorrections,
  saveCorrection,
  formatCorrectionsForPrompt,
} from '@/lib/chat';
import {
  parseRequestBody,
  createRequestId,
  logRequestSummary,
  RequestBodyTooLargeError,
} from '@/lib/chat/api/request';
import { isMediaRequest, isProhibitedTextRequest } from '@/lib/chat/api/guards';
import { buildConversationMessages, callOpenAI } from '@/lib/chat/api/openai';
import { looksLikeCorrection, extractCorrection } from '@/lib/chat/api/corrections-extract';
import { performSearchIfNeeded, redactCompetitorBrands, verifyRecency } from '@/lib/chat/api/search';
import { filterSourcesForAttribution } from '@/lib/chat/source-policy';
import { authenticateApiRequest } from '@/lib/server/api-auth';
import { checkRateLimit } from '@/lib/server/rate-limit';
import {
  formatSourcesSection,
  logNoSearchSummary,
  scrubCompetitorTokens,
  stripSourcesBlock,
} from './route-helpers';
import { emitAuditLog } from '@/lib/server/audit-log';
const MAX_CHAT_REQUEST_BYTES = 32 * 1024;
export async function POST(request: Request) {
  try {
    const requestId = createRequestId();
    const authResult = await authenticateApiRequest(request);
    if (authResult.response) return authResult.response;
    const actor = authResult.actor;
    if (!actor) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    const actorRoles = [
      actor.isAdmin ? 'admin' : '',
      actor.isStaffByClaim ? 'staff' : '',
      actor.isStaffByEmailFallback ? 'legacy_staff_compat' : '',
    ].filter(Boolean);
    let payload;
    try {
      payload = await parseRequestBody(request, MAX_CHAT_REQUEST_BYTES);
    } catch (error) {
      if (error instanceof RequestBodyTooLargeError) {
        logNoSearchSummary(requestId, 0, logRequestSummary);
        return NextResponse.json({ error: 'Request payload is too large.' }, { status: 413 });
      }
      throw error;
    }
    const message = payload.message ?? payload.input ?? payload.text;
    const history = payload.history ?? [];
    const messageLength = typeof message === 'string' ? message.length : 0;
    if (!message || !message.trim()) {
      logNoSearchSummary(requestId, messageLength, logRequestSummary);
      return NextResponse.json(
        { error: 'Message is required.', hint: 'Provide { "message": "..." } in the request body.' },
        { status: 400 }
      );
    }
    const rateLimit = await checkRateLimit({
      scope: 'api.chat',
      identity: `uid:${actor.uid}`,
      limit: 30,
      windowMs: 5 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      logNoSearchSummary(requestId, messageLength, logRequestSummary);
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds ?? 60) } }
      );
    }
    // Refuse media generation requests with a fixed friendly message
    if (isMediaRequest(message)) {
      logNoSearchSummary(requestId, messageLength, logRequestSummary);
      const refusalText = "Sorry - I can't help with that request because I'm not designed to generate images or videos. You can ask me anything about studying abroad, though.";
      return NextResponse.json({ text: refusalText, searchPerformed: false, searchEnabled: SEARCH_CONFIG.enabled });
    }
    // Refuse grammar/proofreading/composition requests with fixed friendly message
    if (isProhibitedTextRequest(message)) {
      logNoSearchSummary(requestId, messageLength, logRequestSummary);
      const refusalText = "Sorry - I can't help with that request because I'm not designed to edit or compose personal texts (emails, statements of purpose, cover letters) or perform proofreading. You can ask me anything about studying abroad, though.";
      return NextResponse.json({ text: refusalText, searchPerformed: false, searchEnabled: SEARCH_CONFIG.enabled });
    }
    // Check for off-topic queries (non-education related)
    if (isOffTopicQuery(message)) {
      console.log('[Chat API] Off-topic query detected, returning polite refusal', { requestId });
      logNoSearchSummary(requestId, messageLength, logRequestSummary);
      return NextResponse.json({
        text: getOffTopicResponse(),
        searchPerformed: false,
        searchEnabled: SEARCH_CONFIG.enabled,
      });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 });
    }
    const corrections = await loadCorrections();
    const correctionsContext = formatCorrectionsForPrompt(corrections);
    // --- Step 1: Always check partner school list first ---
    // Check if user mentions a specific school by name
    const mentionedSchools = await findMentionedPartnerSchools(message);
    // Check if this is a broader recommendation query (country/program/location)
    let recommendedSchools = isSchoolRecommendationQuery(message)
      ? await searchPartnerSchools(message)
      : [];
    // Merge: mentioned schools take priority, then recommendation results (deduplicated)
    const seenNames = new Set(mentionedSchools.map(s => s.university));
    const mergedSchools = [
      ...mentionedSchools,
      ...recommendedSchools.filter(s => !seenNames.has(s.university)),
    ];
    // Build partner school context for the AI
    const partnerSchoolContext = mergedSchools.length > 0
      ? formatPartnerSchoolsForPrompt(mergedSchools)
      : '';
    console.log('[Chat API] Partner schools', {
      requestId,
      total: mergedSchools.length,
      byName: mentionedSchools.length,
      bySearch: recommendedSchools.length,
    });
    // --- Step 2: Brave Search for supplementary web context ---
    const searchResult = await performSearchIfNeeded(message, requestId);
    const searchPerformed = searchResult.performed;
    const numBraveResults = searchResult.results.length;
    // --- Step 3: Build system message with all context ---
    const systemMessage =
      SYSTEM_PROMPT + correctionsContext + partnerSchoolContext + (searchResult.context ? '\n\n' + searchResult.context : '');
    // Build conversation contents
    const model = process.env.OPENAI_MODEL || 'gpt-5-mini';
    const contents = buildConversationMessages(systemMessage, history, message);
    // Call OpenAI API
    const aiResult = await callOpenAI(apiKey, model, contents);
    // Handle API error
    if (aiResult.error) {
      return NextResponse.json(
        {
          error: 'AI service is temporarily unavailable.',
          model,
        },
        { status: aiResult.status && aiResult.status >= 400 && aiResult.status < 500 ? 502 : 503 }
      );
    }
    // --- Step 4: Detect and save corrections (non-blocking) ---
    if (looksLikeCorrection(message, history)) {
      console.log('[Chat API] Correction pattern detected, extracting...');
      extractCorrection(apiKey, model, history, message)
        .then(async (correction) => {
          if (correction) {
            const saved = await saveCorrection(correction);
            console.log(`[Chat API] Correction ${saved ? 'saved' : 'failed to save'}: ${correction.topic}`);
          } else {
            console.log('[Chat API] No actionable correction extracted');
          }
        })
        .catch((err) => console.warn('[Chat API] Correction save error:', err));
    }
    // Sanitize model output before post-processing
    const modelText = stripSourcesBlock(aiResult.text);
    const sanitizedText = sanitizeToPhilippines(modelText);
    let counselorText = redactCompetitorBrands(sanitizedText);
    counselorText = scrubCompetitorTokens(counselorText);
    // Verification step: only run for time-sensitive topics
    let recencyConfirmed = false;
    let recencySearchPerformed = false;
    if (shouldVerifyRecency(message)) {
      const recencyResult = await verifyRecency(message);
      recencyConfirmed = recencyResult.recencyConfirmed;
      recencySearchPerformed = recencyResult.recencySearchPerformed;
    }
    // If not confirmed, prepend a short note so users know to verify with official 2025+ sources
    const baseText = !recencyConfirmed && recencySearchPerformed
      ? `Note: I could not confirm 2025+ sources for this topic; information may reference older policies.\n\n${counselorText}`
      : counselorText;
    const attribution = searchPerformed
      ? filterSourcesForAttribution(searchResult.results, 4)
      : { sources: [], usedPreferred: false, onlyDoNotCite: false };
    const sourcesSection = attribution.sources.length > 0
      ? formatSourcesSection(attribution.sources)
      : '';
    const verificationNote = (!sourcesSection && searchPerformed && attribution.onlyDoNotCite)
      ? 'Verification note: Please confirm time-sensitive details on the official government or institution website.'
      : '';
    let finalText = baseText;
    if (sourcesSection) finalText += sourcesSection;
    if (verificationNote) finalText += `\n\n${verificationNote}`;
    // Final safety scrub for competitor references after all post-processing
    finalText = redactCompetitorBrands(finalText);
    finalText = scrubCompetitorTokens(finalText);
    logRequestSummary({
      requestId,
      messageLength,
      searchPerformed,
      verificationPerformed: recencySearchPerformed,
      numPartnerMatches: mergedSchools.length,
      numBraveResults,
    });
    void emitAuditLog({
      event: 'ai.chat.generate',
      outcome: 'success',
      actor: {
        uid: actor.uid,
        email: actor.email,
        roles: actorRoles,
        isAdmin: actor.isAdmin,
        isStaff: actor.isStaff,
      },
      target: 'api.chat',
      requestId,
      metadata: {
        messageLength,
        searchPerformed,
        recencySearchPerformed,
        recencyConfirmed,
        numPartnerMatches: mergedSchools.length,
        numBraveResults,
      },
    });
    return NextResponse.json({
      text: finalText,
      searchPerformed,
      searchEnabled: SEARCH_CONFIG.enabled,
      recencyConfirmed,
      recencySearchPerformed,
    });
  } catch (error) {
    console.error('[runtime-alert][api.chat]', error);
    void emitAuditLog({
      event: 'ai.chat.generate',
      outcome: 'failed',
      target: 'api.chat',
      metadata: {
        reason: error instanceof Error ? error.message.slice(0, 240) : String(error).slice(0, 240),
      },
    });
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
