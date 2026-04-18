export class JsonBodyError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'JsonBodyError';
    this.status = status;
  }
}

function contentLengthExceedsLimit(request: Request, maxBytes: number): boolean {
  const raw = String(request.headers.get('content-length') || '').trim();
  if (!raw) return false;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return false;
  return parsed > maxBytes;
}

async function readBodyWithLimit(request: Request, maxBytes: number): Promise<string> {
  if (request.bodyUsed) {
    throw new JsonBodyError('Request body has already been consumed.', 400);
  }
  if (contentLengthExceedsLimit(request, maxBytes)) {
    throw new JsonBodyError('Request payload is too large.', 413);
  }

  const reader = request.body?.getReader();
  if (!reader) {
    const text = await request.text();
    const size = Buffer.byteLength(text, 'utf8');
    if (size > maxBytes) {
      throw new JsonBodyError('Request payload is too large.', 413);
    }
    return text;
  }

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      try {
        await reader.cancel();
      } catch {
        // no-op
      }
      throw new JsonBodyError('Request payload is too large.', 413);
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder('utf-8').decode(merged);
}

export async function readJsonBody<T>(request: Request, maxBytes: number): Promise<T> {
  const raw = await readBodyWithLimit(request, maxBytes);
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new JsonBodyError('Request body must be valid JSON.', 400);
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new JsonBodyError('Request body must be valid JSON.', 400);
  }
}

