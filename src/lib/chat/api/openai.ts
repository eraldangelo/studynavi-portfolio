import type { ChatMessage } from '@/lib/chat/types';
import { safeServerFetch } from '@/lib/server/safe-fetch';

/**
 * Build the conversation messages for OpenAI Responses API
 */
export function buildConversationMessages(
  systemMessage: string,
  history: ChatMessage[],
  currentMessage: string
) {
  return [
    { role: 'system', content: systemMessage },
    ...history.map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: item.content,
    })),
    { role: 'user', content: currentMessage },
  ];
}

/**
 * Call the OpenAI Responses API with the prepared conversation
 */
export async function callOpenAI(
  apiKey: string,
  model: string,
  messages: ReturnType<typeof buildConversationMessages>
): Promise<{ text: string; error?: string; status?: number }> {
  const response = await safeServerFetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: messages,
      max_output_tokens: 1024,
      reasoning: { effort: 'low' },
      text: { verbosity: 'low' },
    }),
  }, { timeoutMs: 10_000, retries: 1, retryDelayMs: 200 });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    if (errorBody) {
      console.warn('[Chat API] OpenAI upstream error', response.status, errorBody.slice(0, 500));
    }
    return {
      text: '',
      error: 'upstream_error',
      status: response.status,
    };
  }

  const data = await response.json();
  const outputText = (() => {
    if (typeof data?.output_text === 'string') {
      return data.output_text;
    }

    const parts = Array.isArray(data?.output)
      ? data.output.flatMap(
          (item: { content?: Array<{ text?: unknown; type?: string }> }) =>
            Array.isArray(item.content) ? item.content : []
        )
      : [];

    return parts
      .map((part: { text?: unknown; type?: string }) => {
        if (typeof part?.text === 'string') {
          return part.text;
        }
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
    console.warn('[Chat API] Empty OpenAI output:', JSON.stringify(data).slice(0, 2000));
  }
  const finalText = text || 'Sorry, I had trouble generating a response.';

  return { text: finalText };
}
