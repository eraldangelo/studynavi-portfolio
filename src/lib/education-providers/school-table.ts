import { schoolTableData as legacySchoolTableData } from '@/lib/school-data/schools';

export interface SchoolTableEntry {
  university: string;
  logoUrl: string;
  location: string[];
  intakes: string;
  generalPrograms: string;
  popularPrograms: string;
  priorityLevel: 'High' | 'Low';
  website: string;
  category: string;
  partner?: boolean;
  country: string;
}

type EducationProviderRecord = {
  name?: unknown;
  country?: unknown;
  logoUrl?: unknown;
  intakes?: unknown;
  generalPrograms?: unknown;
  popularPrograms?: unknown;
  website?: unknown;
  domain?: unknown;
  category?: unknown;
  priorityLevel?: unknown;
  location?: unknown;
  locations?: unknown;
  isActive?: unknown;
};

const COUNTRY_DEFAULT_CATEGORY: Record<string, string> = {
  Australia: 'Australia Schools',
  Canada: 'Canada Schools',
  'New Zealand': 'New Zealand Schools',
  Ireland: 'Ireland Schools',
  Germany: 'Germany Schools',
};
const DEFAULT_LOGO_URL = 'https://placehold.co/80x80/png?text=%20';

const toNonEmptyString = (value: unknown) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const toTextList = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => toNonEmptyString(item))
      .filter(Boolean);
  }
  const text = toNonEmptyString(value);
  if (!text) return [];
  return text
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);
};

const toJoinedText = (value: unknown) => {
  const list = toTextList(value);
  return list.length > 0 ? list.join(', ') : 'N/A';
};

const normalizeSchoolName = (value: string) =>
  value
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '');

const normalizeLocationLabel = (value: string) =>
  value
    .replace(/\u00c3\u00a2\u00e2\u201a\u00ac\u00c2\u00a2/g, '\u2022')
    .replace(/\u00e2\u20ac\u00a2/g, '\u2022')
    .trim();

const uniqueLocationList = (value: unknown) =>
  Array.from(
    new Set(
      toTextList(value)
        .map((location) => normalizeLocationLabel(location))
        .filter(Boolean),
    ),
  );

const LEGACY_LOCATIONS_BY_SCHOOL = (() => {
  const bySchool = new Map<string, string[]>();
  for (const school of legacySchoolTableData) {
    const university = toNonEmptyString((school as { university?: unknown }).university);
    if (!university) continue;

    const locations = uniqueLocationList((school as { location?: unknown }).location);
    if (locations.length === 0) continue;

    const exactKey = university.toLowerCase();
    const normalizedKey = normalizeSchoolName(university);
    if (!bySchool.has(exactKey)) bySchool.set(exactKey, locations);
    if (normalizedKey && !bySchool.has(normalizedKey)) bySchool.set(normalizedKey, locations);
  }
  return bySchool;
})();

const resolveLegacyLocations = (university: string) => {
  const exact = LEGACY_LOCATIONS_BY_SCHOOL.get(university.toLowerCase());
  if (exact && exact.length > 0) return exact;

  const normalized = LEGACY_LOCATIONS_BY_SCHOOL.get(normalizeSchoolName(university));
  if (normalized && normalized.length > 0) return normalized;

  return [];
};

const normalizeCategory = (value: unknown, country: string) => {
  const explicit = toNonEmptyString(value);
  if (explicit) return explicit;
  return COUNTRY_DEFAULT_CATEGORY[country] || 'Partner Schools';
};

const resolveLocations = (value: unknown, university: string, country: string) => {
  const directLocations = uniqueLocationList(value);
  if (directLocations.length > 0) return directLocations;

  const legacyLocations = resolveLegacyLocations(university);
  if (legacyLocations.length > 0) return legacyLocations;

  return [country];
};

export const sanitizeWebsiteUrl = (website: unknown, domain: unknown) => {
  const explicit = toNonEmptyString(website);
  const host = toNonEmptyString(domain);
  const raw = explicit || host;
  if (!raw) return '';

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
    if (!parsed.hostname || parsed.username || parsed.password) return '';
    return parsed.toString();
  } catch {
    return '';
  }
};

const sanitizeImageUrl = (value: unknown) => {
  const raw = toNonEmptyString(value);
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
    if (!parsed.hostname) return '';
    return parsed.toString();
  } catch {
    return '';
  }
};

export const mapEducationProviderToSchoolEntry = (
  record: EducationProviderRecord,
): SchoolTableEntry | null => {
  const university = toNonEmptyString(record.name);
  const country = toNonEmptyString(record.country);
  if (!university || !country) return null;
  if (record.isActive === false) return null;

  const priorityValue = toNonEmptyString(record.priorityLevel);
  const priorityLevel: 'High' | 'Low' = priorityValue.toLowerCase() === 'high' ? 'High' : 'Low';
  const rawLocations = [...toTextList(record.locations), ...toTextList(record.location)];

  return {
    university,
    country,
    logoUrl: sanitizeImageUrl(record.logoUrl) || DEFAULT_LOGO_URL,
    location: resolveLocations(rawLocations, university, country),
    intakes: toNonEmptyString(record.intakes) || 'N/A',
    generalPrograms: toJoinedText(record.generalPrograms),
    popularPrograms: toJoinedText(record.popularPrograms),
    priorityLevel,
    website: sanitizeWebsiteUrl(record.website, record.domain),
    category: normalizeCategory(record.category, country),
    partner: true,
  };
};

export const sortSchoolEntries = (schools: SchoolTableEntry[]) =>
  [...schools].sort((a, b) => a.university.localeCompare(b.university));
