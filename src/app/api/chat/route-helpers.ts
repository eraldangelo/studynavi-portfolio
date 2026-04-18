const FORBIDDEN_AGENCY_TOKENS = ['IDP', 'AECC', 'AUG', 'BADA', 'AMS'];

export function scrubCompetitorTokens(text: string): string {
  if (!text) return text;
  const pattern = new RegExp(`\\b(${FORBIDDEN_AGENCY_TOKENS.join('|')})\\b`, 'gi');
  return text.replace(pattern, (match, _token, offset, full) => {
    if (String(match).toLowerCase() === 'aug') {
      const after = String(full).slice(Number(offset) + String(match).length);
      if (/^\s*[\.,]?\s*\d/.test(after)) {
        return match;
      }
    }
    return 'another agency';
  });
}

export function stripSourcesBlock(text: string): string {
  if (!text) return text;
  const lines = text.split('\n');
  const sourcesIndex = lines.findIndex((line) => {
    const trimmed = line.trim();
    return /^\s*sources\s*:?\s*$/i.test(trimmed) || /^\s*sources\s*:/i.test(trimmed);
  });
  if (sourcesIndex === -1) return text;
  return lines.slice(0, sourcesIndex).join('\n').trim();
}

export function formatSourcesSection(sources: { title: string; url: string; hostname: string }[]): string {
  if (sources.length === 0) return '';
  const count = sources.length >= 2 ? Math.min(4, sources.length) : sources.length;
  const selected = sources.slice(0, count);
  const lines = selected.map((source) => {
    const titleRaw = source.title?.trim() || source.hostname;
    const title = scrubCompetitorTokens(titleRaw).trim() || source.hostname;
    return `- ${title} \u2014 ${source.url}`;
  });
  return `\n\nSources:\n${lines.join('\n')}`;
}

export function logNoSearchSummary(
  requestId: string,
  messageLength: number,
  logRequestSummary: (summary: {
    requestId: string;
    messageLength: number;
    searchPerformed: boolean;
    verificationPerformed: boolean;
    numPartnerMatches: number;
    numBraveResults: number;
  }) => void,
) {
  logRequestSummary({
    requestId,
    messageLength,
    searchPerformed: false,
    verificationPerformed: false,
    numPartnerMatches: 0,
    numBraveResults: 0,
  });
}
