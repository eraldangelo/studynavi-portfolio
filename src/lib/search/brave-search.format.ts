import type { BraveSearchResponse } from './brave-search.types';

export function formatSearchResultsForPrompt(searchResponse: BraveSearchResponse): string {
  if (searchResponse.error || searchResponse.results.length === 0) {
    return '';
  }

  const formattedResults = searchResponse.results
    .map((result, index) => {
      const lines: string[] = [];
      lines.push(`[${index + 1}] ${result.title}`);
      lines.push(`   URL: ${result.url}`);
      if (result.description) lines.push(`   ${result.description}`);
      if (result.excerpt) lines.push(`   Excerpt: ${result.excerpt.slice(0, 600)}...`);
      return lines.join('\n');
    })
    .join('\n\n');

  return `
--- Web Search Results for "${searchResponse.query}" ---
${formattedResults}
--- End of Search Results ---
Use the above search results to provide accurate, up-to-date information in your response. Do not include a Sources section.
`;
}
