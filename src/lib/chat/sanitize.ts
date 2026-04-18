/**
 * Output sanitization for chat responses
 * Ensures responses are focused on the Philippine market
 */

/**
 * List of countries that should be filtered out when mentioned as locations
 * (These are NOT study destinations offered by StudyNavi)
 */
const NON_DESTINATION_COUNTRIES = [
  'south korea', 'korea', 'japan', 'china', 'singapore', 'germany', 'france', 
  'south africa', 'malaysia', 'india', 'vietnam', 'thailand', 'indonesia',
  'united states', 'usa', 'u.s.', 'united kingdom', 'u.k.'
];

/**
 * Philippine cities and terms to always preserve
 */
const PHILIPPINE_TERMS = ['philippine', 'manila', 'cebu', 'davao', 'baguio'];

/**
 * Remove sentences that reference other countries directly (e.g., "in South Korea", "requirements in Japan")
 * unless the sentence also mentions the Philippines. This keeps responses focused on the Philippine market.
 * Preserves newlines and bullet formatting.
 */
export function sanitizeToPhilippines(input: string): string {
  if (!input) return input;

  // Split by newlines to preserve formatting
  const lines = input.split('\n');

  let sourcesIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const isSourcesHeader = /^\s*sources\s*:?\s*$/i.test(trimmed) || /^\s*sources\s*:/i.test(trimmed);
    if (isSourcesHeader) {
      sourcesIndex = i;
      break;
    }
  }

  const mainLines = sourcesIndex >= 0 ? lines.slice(0, sourcesIndex) : lines;
  const sourcesLines = sourcesIndex >= 0 ? lines.slice(sourcesIndex) : [];

  const filteredMain = mainLines.map(line => {
    const trimmed = line.trim();
    const cleanedLine = removeCitations(line);
    const lower = cleanedLine.toLowerCase();

    // Always keep lines that mention Philippines or Philippine cities
    if (PHILIPPINE_TERMS.some(term => lower.includes(term))) {
      return cleanedLine;
    }

    // Check if line contains a direct reference to non-destination countries
    for (const country of NON_DESTINATION_COUNTRIES) {
      const pattern = new RegExp(
        '\\b(in|within|for|at|located in|requirements in|centers in)\\s+' + country + '\\b',
        'i'
      );
      if (pattern.test(cleanedLine)) {
        return null; // Remove this line
      }
    }

    // Remove lines that are just URLs
    if (trimmed.match(/^https?:\/\//)) return null;

    // Remove lines that are just citation numbers
    if (trimmed.match(/^\[?\d+[,\d\s]*\]?$/)) return null;

    return cleanedLine;
  }).filter(line => line !== null);

  const mainText = filteredMain.join('\n').trim();
  if (sourcesLines.length === 0) {
    return mainText;
  }

  const sourcesText = sourcesLines.join('\n').trimEnd();
  if (!mainText) return sourcesText;
  return `${mainText}\n${sourcesText}`;
}

/**
 * Clean up citation references from the text
 */
export function removeCitations(text: string): string {
  return text.replace(/\s*\[\d+(?:,\s*\d+)*\]/g, '');
}
