type SafeFetchOptions = {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
};

const DEFAULT_TIMEOUT_MS = 7_500;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableFetchError(error: unknown): boolean {
  const message = String((error as { message?: unknown })?.message || '');
  const lower = message.toLowerCase();
  if (lower.includes('timed out') || lower.includes('timeout')) return true;
  if (lower.includes('network')) return true;
  if (lower.includes('fetch failed')) return true;
  return false;
}

export async function safeServerFetch(
  input: RequestInfo | URL,
  init: RequestInit,
  options?: SafeFetchOptions,
): Promise<Response> {
  const timeoutMs = Math.max(250, options?.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const retries = Math.max(0, options?.retries ?? 0);
  const retryDelayMs = Math.max(0, options?.retryDelayMs ?? 150);
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(input, {
        ...init,
        signal: controller.signal,
      });
    } catch (error) {
      lastError = error;
      if (attempt >= retries || !isRetryableFetchError(error)) break;
      await delay(retryDelayMs * (attempt + 1));
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('fetch failed');
}

