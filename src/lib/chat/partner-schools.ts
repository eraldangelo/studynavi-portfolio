/**
 * Partner school search and recommendation logic
 * Uses Firestore educationProviders as the single source of truth.
 */

import { getAdminDb } from '@/lib/firebase/admin';
import {
  mapEducationProviderToSchoolEntry,
  sortSchoolEntries,
  type SchoolTableEntry,
} from '@/lib/education-providers/school-table';

const CACHE_TTL_MS = 5 * 60 * 1000;
let cachedSchools: SchoolTableEntry[] = [];
let cacheLoadedAt = 0;

const SCHOOL_QUERY_KEYWORDS = [
  'recommend', 'recommendation', 'suggest', 'best school', 'best university',
  'best college', 'which school', 'which university', 'which college',
  'good school', 'good university', 'good college', 'top school', 'top university',
  'partner school', 'partner university', 'available school', 'list of school',
  'school for', 'university for', 'college for', 'where can i study',
  'where to study', 'schools in', 'universities in', 'colleges in',
  'study hospitality', 'study nursing', 'study business', 'study it',
  'study engineering', 'study accounting', 'school options', 'university options',
  'group of 8', 'group of eight', 'go8',
];

const SCHOOL_ALIAS_MAP: Record<string, string> = {
  usyd: 'University of Sydney (USYD)',
  'u syd': 'University of Sydney (USYD)',
  'uni syd': 'University of Sydney (USYD)',
  'sydney uni': 'University of Sydney (USYD)',
  unimelb: 'University of Melbourne (UniMelb)',
  umelb: 'University of Melbourne (UniMelb)',
  'u melb': 'University of Melbourne (UniMelb)',
  'uni melb': 'University of Melbourne (UniMelb)',
  unsw: 'UNSW Sydney',
  'unsw sydney': 'UNSW Sydney',
  monash: 'Monash University',
  anu: 'Australian National University (ANU)',
  uq: 'University of Queensland (UQ)',
  'u qld': 'University of Queensland (UQ)',
  uqld: 'University of Queensland (UQ)',
  uwa: 'University of Western Australia (UWA)',
  'u wa': 'University of Western Australia (UWA)',
  uoa: 'Adelaide University (AU)',
  'university of adelaide': 'Adelaide University (AU)',
  'adelaide uni': 'Adelaide University (AU)',
};

const COUNTRY_CATEGORY_MAP: Record<string, string[]> = {
  australia: ['Australia Schools', 'Group of 8', 'Universities', 'Private Institution & Colleges'],
  canada: ['Canada Schools'],
  'new zealand': ['New Zealand Schools'],
  ireland: ['Ireland Schools'],
  germany: ['Germany Schools'],
};

const PROGRAM_KEYWORDS: Record<string, string[]> = {
  hospitality: ['hospitality', 'hotel', 'culinary', 'tourism', 'food'],
  nursing: ['nursing', 'health', 'medical', 'healthcare'],
  business: ['business', 'commerce', 'management', 'mba', 'accounting', 'finance'],
  it: ['information technology', 'computer', 'software', 'data', 'cyber', 'digital'],
  engineering: ['engineering', 'mechanical', 'civil', 'electrical'],
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const loadPartnerSchools = async (): Promise<SchoolTableEntry[]> => {
  const now = Date.now();
  if (cachedSchools.length > 0 && now - cacheLoadedAt < CACHE_TTL_MS) {
    return cachedSchools;
  }

  const db = getAdminDb();
  if (!db) {
    console.warn('[partner-schools] Admin DB unavailable; using empty partner school list.');
    cachedSchools = [];
    cacheLoadedAt = now;
    return cachedSchools;
  }

  try {
    const snapshot = await db.collection('educationProviders').get();
    const mapped = snapshot.docs
      .map((doc) => mapEducationProviderToSchoolEntry(doc.data() || {}))
      .filter((school): school is SchoolTableEntry => Boolean(school));
    cachedSchools = sortSchoolEntries(mapped);
    cacheLoadedAt = now;
    return cachedSchools;
  } catch (error) {
    console.warn('[partner-schools] Failed to load Firestore educationProviders:', error);
    return cachedSchools;
  }
};

export function isSchoolRecommendationQuery(message: string): boolean {
  const lower = message.toLowerCase();
  return SCHOOL_QUERY_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export async function findMentionedPartnerSchools(message: string): Promise<SchoolTableEntry[]> {
  const schoolTableData = await loadPartnerSchools();
  const lower = message.toLowerCase();
  const aliasMatches = new Set<string>();

  for (const [alias, schoolName] of Object.entries(SCHOOL_ALIAS_MAP)) {
    const regex = new RegExp(`\\b${escapeRegex(alias)}\\b`);
    if (regex.test(lower)) {
      aliasMatches.add(schoolName.toLowerCase());
    }
  }

  return schoolTableData.filter((school) => {
    const name = school.university.toLowerCase();
    if (aliasMatches.has(name)) return true;
    if (lower.includes(name)) return true;

    const stopWords = new Set([
      'of', 'the', 'and', 'for', 'in', 'a', 'an', '&', '-', 'institute', 'college',
      'university', 'education', 'school', 'australia', 'international', 'group', 'tafe',
    ]);
    const nameTokens = name.replace(/[()]/g, '').split(/[\s/,]+/).filter((token) => token.length >= 2);
    const significantTokens = nameTokens.filter((token) => !stopWords.has(token));

    if (significantTokens.length === 0) return false;
    return significantTokens.some((token) => {
      if (token.length < 3) return false;
      const regex = new RegExp(`\\b${escapeRegex(token)}\\b`);
      return regex.test(lower);
    });
  });
}

export async function searchPartnerSchools(message: string): Promise<SchoolTableEntry[]> {
  const schoolTableData = await loadPartnerSchools();
  const lower = message.toLowerCase();

  let matchedCategories: string[] = [];
  if (/\b(group of 8|group of eight|go8)\b/.test(lower)) {
    matchedCategories = ['Group of 8'];
  }

  for (const [country, categories] of Object.entries(COUNTRY_CATEGORY_MAP)) {
    if (lower.includes(country)) {
      matchedCategories = [...matchedCategories, ...categories];
    }
  }

  if (matchedCategories.length === 0) {
    matchedCategories = Object.values(COUNTRY_CATEGORY_MAP).flat();
  }

  let filtered = schoolTableData.filter((school) =>
    matchedCategories.some((category) => school.category.includes(category)),
  );

  let programFilter: string[] = [];
  for (const keywords of Object.values(PROGRAM_KEYWORDS)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      programFilter = [...programFilter, ...keywords];
    }
  }

  if (programFilter.length > 0) {
    filtered = filtered.filter((school) => {
      const programs = `${school.generalPrograms} ${school.popularPrograms}`.toLowerCase();
      return programFilter.some((keyword) => programs.includes(keyword));
    });
  }

  const allLocations = Array.from(new Set(schoolTableData.flatMap((school) =>
    school.location.map((location) => location.toLowerCase()),
  )));
  const mentionedLocations = allLocations.filter((location) => lower.includes(location));
  if (mentionedLocations.length > 0) {
    filtered = filtered.filter((school) =>
      school.location.some((location) => mentionedLocations.includes(location.toLowerCase())),
    );
  }

  filtered.sort((a, b) => {
    if (a.priorityLevel === 'High' && b.priorityLevel === 'Low') return -1;
    if (a.priorityLevel === 'Low' && b.priorityLevel === 'High') return 1;
    return 0;
  });

  return filtered.slice(0, 10);
}

export function formatPartnerSchoolsForPrompt(schools: SchoolTableEntry[]): string {
  if (schools.length === 0) return '';

  const formatted = schools
    .map((school) => {
      const parts = [
        `- ${school.university} (${school.category})`,
        `  Location: ${school.location.join(', ')}`,
        `  Intakes: ${school.intakes}`,
        `  Priority: ${school.priorityLevel}`,
      ];
      if (school.popularPrograms && school.popularPrograms !== 'N/A') {
        parts.push(`  Popular Programs: ${school.popularPrograms.substring(0, 150)}...`);
      }
      parts.push(`  Website: ${school.website || 'N/A'}`);
      return parts.join('\n');
    })
    .join('\n\n');

  return `\n\n=== STUDYNAVI PARTNER SCHOOLS (USE ONLY THESE FOR RECOMMENDATIONS) ===
The following schools are StudyNavi official partners. When recommending schools, ONLY recommend from this list:

IMPORTANT: StudyNavi is an official partner of the Group of Eight (Go8). If Go8 is mentioned, confirm the partnership and list the Go8 members shown below.

${formatted}

IMPORTANT: Do NOT recommend any schools that are not in this list. If asked about a school not in the list, explain that it is not a StudyNavi partner school.
===`;
}
