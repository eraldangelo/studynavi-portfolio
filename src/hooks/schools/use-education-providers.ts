'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import {
  mapEducationProviderToSchoolEntry,
  sortSchoolEntries,
  type SchoolTableEntry,
} from '@/lib/education-providers/school-table';

let cachedSchools: SchoolTableEntry[] | null = null;
let inFlightFetch: Promise<SchoolTableEntry[]> | null = null;

const fetchEducationProviders = async (): Promise<SchoolTableEntry[]> => {
  if (cachedSchools) return cachedSchools;
  if (inFlightFetch) return inFlightFetch;

  inFlightFetch = (async () => {
    const snapshot = await getDocs(collection(db, 'educationProviders'));
    const schools = snapshot.docs
      .map((doc) => mapEducationProviderToSchoolEntry(doc.data() || {}))
      .filter((item): item is SchoolTableEntry => Boolean(item));
    const sorted = sortSchoolEntries(schools);
    cachedSchools = sorted;
    return sorted;
  })()
    .catch((error) => {
      console.error('[educationProviders] Failed to load from Firestore:', error);
      return [];
    })
    .finally(() => {
      inFlightFetch = null;
    });

  return inFlightFetch;
};

export function useEducationProviders() {
  const [schools, setSchools] = useState<SchoolTableEntry[]>(cachedSchools || []);
  const [isLoading, setIsLoading] = useState(!cachedSchools);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(!cachedSchools);
      const nextSchools = await fetchEducationProviders();
      if (!isMounted) return;
      setSchools(nextSchools);
      setError(nextSchools.length === 0 ? 'No education providers found in Firestore.' : null);
      setIsLoading(false);
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    schools,
    isLoading,
    error,
  };
}
