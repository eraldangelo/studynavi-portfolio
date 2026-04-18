#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import {
  SOURCE_SETS,
  areArraysEqual,
  buildCanonicalLocationMap,
  normalizeSchoolName,
  toCanonicalKey,
  toCanonicalProviderName,
  type FirestoreProvider,
  type UpdateRecord,
} from './lib/education-provider-location-backfill.helpers';
import {
  applyLocationUpdates,
  ensureAdminApp,
  loadProviders,
} from './lib/education-provider-location-backfill.firestore';

type CliOptions = {
  apply: boolean;
  collection: string;
  serviceAccountPath: string | null;
  reportPath: string | null;
};

const getArgValue = (flag: string) => {
  const args = process.argv.slice(2);
  const index = args.indexOf(flag);
  if (index < 0 || index + 1 >= args.length) return null;
  return args[index + 1];
};

const parseArgs = (): CliOptions => {
  const args = process.argv.slice(2);
  return {
    apply: args.includes('--apply'),
    collection: (getArgValue('--collection') || 'educationProviders').trim(),
    serviceAccountPath:
      getArgValue('--service-account') ||
      process.env.SERVICE_ACCOUNT ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      null,
    reportPath: getArgValue('--report') || null,
  };
};

const writeReport = (reportPath: string, payload: unknown) => {
  const directory = path.dirname(reportPath);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(payload, null, 2));
};

const buildDefaultReportPath = (isApply: boolean) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(
    process.cwd(),
    'reports',
    `education-provider-location-backfill-${isApply ? 'apply' : 'dryrun'}-${timestamp}.json`,
  );
};

const resolveUpdates = (
  providers: FirestoreProvider[],
  byCountryAndName: Map<string, { locations: string[] }>,
  byNameOnly: Map<string, { locations: string[] }[]>,
) => {
  const updates: UpdateRecord[] = [];
  const alreadyCorrect: FirestoreProvider[] = [];
  const unmatched: FirestoreProvider[] = [];
  const missingNameOrCountry: FirestoreProvider[] = [];

  for (const provider of providers) {
    if (!provider.name || !provider.country) {
      missingNameOrCountry.push(provider);
      continue;
    }

    const canonicalProviderName = toCanonicalProviderName(provider.name);
    const key = toCanonicalKey(provider.country, canonicalProviderName);
    let canonical = byCountryAndName.get(key);
    let matchMode: 'country+name' | 'name-only' | null = null;

    if (canonical) {
      matchMode = 'country+name';
    } else {
      const nameMatches = byNameOnly.get(normalizeSchoolName(canonicalProviderName)) || [];
      if (nameMatches.length === 1) {
        canonical = nameMatches[0];
        matchMode = 'name-only';
      }
    }

    if (!canonical || !matchMode || canonical.locations.length === 0) {
      unmatched.push(provider);
      continue;
    }

    if (areArraysEqual(provider.locations, canonical.locations)) {
      alreadyCorrect.push(provider);
      continue;
    }

    updates.push({
      id: provider.id,
      name: provider.name,
      country: provider.country,
      category: provider.category,
      matchMode,
      before: provider.locations,
      after: canonical.locations,
    });
  }

  return {
    updates,
    alreadyCorrect,
    unmatched,
    missingNameOrCountry,
  };
};

const run = async () => {
  const options = parseArgs();
  ensureAdminApp(options.serviceAccountPath);

  const { byCountryAndName, byNameOnly } = buildCanonicalLocationMap();
  const providers = await loadProviders(options.collection);
  const summary = resolveUpdates(providers, byCountryAndName, byNameOnly);

  const reportPath = options.reportPath
    ? path.resolve(options.reportPath)
    : buildDefaultReportPath(options.apply);

  const basePayload = {
    generatedAt: new Date().toISOString(),
    mode: options.apply ? 'apply' : 'dry-run',
    collection: options.collection,
    sourceSets: SOURCE_SETS,
    totals: {
      canonicalEntries: byCountryAndName.size,
      firestoreProviders: providers.length,
      updatesNeeded: summary.updates.length,
      alreadyCorrect: summary.alreadyCorrect.length,
      unmatched: summary.unmatched.length,
      missingNameOrCountry: summary.missingNameOrCountry.length,
    },
    updates: summary.updates,
    unmatched: summary.unmatched.map((provider) => ({
      id: provider.id,
      name: provider.name,
      country: provider.country,
      category: provider.category,
      currentLocations: provider.locations,
    })),
    missingNameOrCountry: summary.missingNameOrCountry.map((provider) => ({
      id: provider.id,
      name: provider.name,
      country: provider.country,
      category: provider.category,
    })),
  };

  if (options.apply) {
    const applySummary = await applyLocationUpdates(options.collection, summary.updates);
    writeReport(reportPath, {
      ...basePayload,
      applySummary,
    });

    console.log('[location-backfill] Apply complete.');
    console.log(`[location-backfill] Updated documents: ${applySummary.updatedDocuments}`);
    console.log(`[location-backfill] Batch commits: ${applySummary.commits}`);
    console.log(`[location-backfill] Report: ${reportPath}`);
    return;
  }

  writeReport(reportPath, basePayload);
  console.log('[location-backfill] Dry run complete.');
  console.log(`[location-backfill] Canonical entries: ${byCountryAndName.size}`);
  console.log(`[location-backfill] Firestore providers: ${providers.length}`);
  console.log(`[location-backfill] Updates needed: ${summary.updates.length}`);
  console.log(`[location-backfill] Already correct: ${summary.alreadyCorrect.length}`);
  console.log(`[location-backfill] Unmatched: ${summary.unmatched.length}`);
  console.log(`[location-backfill] Missing name/country: ${summary.missingNameOrCountry.length}`);
  console.log(`[location-backfill] Report: ${reportPath}`);
};

run().catch((error) => {
  console.error('[location-backfill] Failed:', error);
  process.exit(1);
});
