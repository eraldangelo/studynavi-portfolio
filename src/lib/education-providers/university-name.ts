export type ParsedUniversityName = {
  title: string;
  details: string[];
};

const LI_PATTERN = /<li[^>]*>([\s\S]*?)<\/li>/gi;
const TAG_PATTERN = /<[^>]*>/g;
const WHITESPACE_PATTERN = /\s+/g;

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'");
}

export function stripHtml(value: string): string {
  return decodeEntities(String(value || '').replace(TAG_PATTERN, ' '))
    .replace(WHITESPACE_PATTERN, ' ')
    .trim();
}

export function parseUniversityName(value: string): ParsedUniversityName {
  const raw = String(value || '');
  const details: string[] = [];
  let match: RegExpExecArray | null = null;

  while ((match = LI_PATTERN.exec(raw)) !== null) {
    const item = stripHtml(match[1] || '');
    if (item) details.push(item);
  }

  const withoutLists = raw.replace(/<ul[\s\S]*?<\/ul>/gi, ' ');
  const title = stripHtml(withoutLists);

  return {
    title: title || stripHtml(raw),
    details,
  };
}

