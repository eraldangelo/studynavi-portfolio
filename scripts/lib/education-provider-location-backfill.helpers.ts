import { groupOf8 } from '../../src/lib/school-data/groupof8';
import { universities, privateColleges } from '../../src/lib/school-data';
import { canadaSchoolData } from '../../src/lib/school-data/canada-schools';
import { newZealandSchoolData } from '../../src/lib/school-data/newzealand-schools';
import { germanySchoolData } from '../../src/lib/school-data/germany-schools';
import { irelandSchoolData } from '../../src/lib/school-data/ireland-schools';
import { parseUniversityName } from '../../src/lib/education-providers/university-name';

export type CanonicalLocationEntry = {
  country: string;
  university: string;
  locations: string[];
  sources: string[];
};

export type FirestoreProvider = {
  id: string;
  name: string;
  country: string;
  locations: string[];
  category: string;
};

export type UpdateRecord = {
  id: string;
  name: string;
  country: string;
  category: string;
  matchMode: 'country+name' | 'name-only';
  before: string[];
  after: string[];
};

export const SOURCE_SETS = [
  'groupof8',
  'universities',
  'private-colleges',
  'canada-schools',
  'newzealand-schools',
  'germany-schools',
  'ireland-schools',
] as const;

export const toNonEmptyString = (value: unknown) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const toCanonicalUniversityTitle = (value: unknown) => {
  const raw = toNonEmptyString(value);
  if (!raw) return '';
  const parsed = parseUniversityName(raw).title;
  return toNonEmptyString(parsed) || raw;
};

export const normalizeSchoolName = (value: string) =>
  value
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const normalizeLocationLabel = (value: string) =>
  value
    .replace(/\u00c3\u00a2\u00e2\u201a\u00ac\u00c2\u00a2/g, '\u2022')
    .replace(/\u00e2\u20ac\u00a2/g, '\u2022')
    .trim();

export const toTextList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => toNonEmptyString(item))
      .map((item) => normalizeLocationLabel(item))
      .filter(Boolean);
  }

  const text = toNonEmptyString(value);
  if (!text) return [];

  const delimiter = text.includes(';') ? ';' : text.includes('|') ? '|' : text.includes(',') ? ',' : null;
  const splitValues = delimiter ? text.split(delimiter) : [text];
  return splitValues
    .map((item) => normalizeLocationLabel(item))
    .filter(Boolean);
};

const unique = (values: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
};

const toCanonicalKeyCore = (country: string, university: string) =>
  `${country.toLowerCase()}::${normalizeSchoolName(university)}`;

export const toCanonicalKey = (country: string, university: string) =>
  toCanonicalKeyCore(country, toCanonicalUniversityTitle(university));

const mergeLocations = (base: string[], next: string[]) => {
  const merged = [...base];
  for (const location of next) {
    if (!merged.includes(location)) {
      merged.push(location);
    }
  }
  return merged;
};

export const buildCanonicalLocationMap = () => {
  const byCountryAndName = new Map<string, CanonicalLocationEntry>();
  const byNameOnly = new Map<string, CanonicalLocationEntry[]>();

  const ingest = (
    schools: Array<{ university?: string; location?: unknown }>,
    country: string,
    source: string,
  ) => {
    for (const school of schools) {
      const university = toCanonicalUniversityTitle(school.university);
      if (!university) continue;

      const locations = unique(toTextList(school.location));
      if (locations.length === 0) continue;

      const key = toCanonicalKeyCore(country, university);
      const existing = byCountryAndName.get(key);
      if (existing) {
        existing.locations = mergeLocations(existing.locations, locations);
        if (!existing.sources.includes(source)) {
          existing.sources.push(source);
        }
      } else {
        byCountryAndName.set(key, {
          country,
          university,
          locations,
          sources: [source],
        });
      }
    }
  };

  ingest(groupOf8, 'Australia', 'groupof8');
  ingest(universities, 'Australia', 'universities');
  ingest(privateColleges, 'Australia', 'private-colleges');
  ingest(canadaSchoolData, 'Canada', 'canada-schools');
  ingest(newZealandSchoolData, 'New Zealand', 'newzealand-schools');
  ingest(germanySchoolData, 'Germany', 'germany-schools');
  ingest(irelandSchoolData, 'Ireland', 'ireland-schools');

  for (const entry of byCountryAndName.values()) {
    const normalizedName = normalizeSchoolName(entry.university);
    if (!normalizedName) continue;

    const matches = byNameOnly.get(normalizedName) || [];
    matches.push(entry);
    byNameOnly.set(normalizedName, matches);
  }

  return { byCountryAndName, byNameOnly };
};

export const areArraysEqual = (left: string[], right: string[]) => {
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) return false;
  }
  return true;
};

export const toCanonicalProviderName = (name: string) => toCanonicalUniversityTitle(name);
