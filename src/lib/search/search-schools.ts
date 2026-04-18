import type { SchoolTableEntry } from '@/lib/education-providers/school-table';

/**
 * Filters and sorts schools based on a search query.
 * - Filters by checking if all keywords are present.
 * - Sorts by 'High Priority' first, then alphabetically.
 *
 * @param {SchoolTableEntry[]} schools - The array of school objects to filter.
 * @param {string} query - The search query string.
 * @returns {SchoolTableEntry[]} A new array of schools that match the query, correctly sorted.
 */
export const filterAndSortSchools = (schools: SchoolTableEntry[], query: string): SchoolTableEntry[] => {
  if (!query.trim()) {
    return [];
  }

  const keywords = query.toLowerCase().split(' ').filter(Boolean);

  const filtered = schools.filter((school) => {
    const schoolText = `
      ${school.university.toLowerCase()}
      ${school.location.join(' ').toLowerCase()}
      ${school.generalPrograms.toLowerCase()}
      ${school.popularPrograms.toLowerCase()}
      ${String(school.category || '').toLowerCase()}
    `;
    return keywords.every((keyword) => schoolText.includes(keyword));
  });

  // Sort results: High Priority on top, then A-Z
  filtered.sort((a, b) => {
    const aIsHigh = a.priorityLevel === 'High';
    const bIsHigh = b.priorityLevel === 'High';

    // If priorities are different, the High priority one comes first.
    if (aIsHigh && !bIsHigh) return -1;
    if (!aIsHigh && bIsHigh) return 1;

    // If priorities are the same, sort alphabetically.
    return a.university.localeCompare(b.university);
  });

  return filtered;
};
