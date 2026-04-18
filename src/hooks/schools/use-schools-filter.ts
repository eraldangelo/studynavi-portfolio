'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { SchoolTableEntry } from '@/lib/education-providers/school-table';
import { FLAG_URLS } from '@/lib/pdf/layouts/main-layout';
import { matchesSchoolQuery, normalizeText } from '@/lib/search/school-search-utils';

export const countryOptions = [
  { value: 'All', label: 'All Countries' },
  { value: 'Australia', label: 'Australia', flag: FLAG_URLS.Australia },
  { value: 'Canada', label: 'Canada', flag: FLAG_URLS.Canada },
  { value: 'Ireland', label: 'Ireland', flag: FLAG_URLS.Ireland },
  { value: 'New Zealand', label: 'New Zealand', flag: FLAG_URLS['New Zealand'] },
  { value: 'Germany', label: 'Germany', flag: FLAG_URLS.Germany },
];

export function useSchoolsFilter(schoolTableData: SchoolTableEntry[], initialType: string = 'All') {
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>(initialType);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const setCountryFilterAndResetLocation = useCallback((country: string) => {
    setCountryFilter(country);
    setLocationFilter('All');
  }, []);

  const allLocations = useMemo(() => {
    let relevantSchools = schoolTableData;

    if (countryFilter !== 'All') {
      relevantSchools = schoolTableData.filter((school) => school.country === countryFilter);
    }

    const locations = new Set<string>();
    relevantSchools.forEach((school) => {
      school.location.forEach((loc) => {
        if (loc.startsWith('**') && loc.endsWith('**')) {
          locations.add(loc.slice(2, -2));
        } else if (!loc.startsWith('•')) {
          locations.add(loc);
        }
      });
    });

    return ['All', ...Array.from(locations).sort()];
  }, [countryFilter, schoolTableData]);

  const filteredSchools = useMemo(() => {
    let schools = schoolTableData;

    // 1) Country filter
    if (countryFilter !== 'All') {
      schools = schools.filter((school) => school.country === countryFilter);
    }

    // 2) Location filter
    if (locationFilter !== 'All') {
      schools = schools.filter((school) => {
        return school.location.some((loc) => {
          if (loc === locationFilter) return true;
          if (loc.startsWith('**') && loc.endsWith('**')) {
            return loc.slice(2, -2) === locationFilter;
          }
          return false;
        });
      });
    }

    // 3) Type filter
    if (typeFilter !== 'All') {
      schools = schools.filter((school) => school.category === typeFilter);
    }

    // 4) Search (centralized)
    if (searchQuery.trim()) {
      schools = schools.filter((school) => matchesSchoolQuery(school, searchQuery));
    }

    // 5) Sort
    return [...schools].sort((a, b) => {
      const query = normalizeText(searchQuery);
      const aName = normalizeText(a.university);
      const bName = normalizeText(b.university);

      // Only apply startsWith boost if query exists
      if (query) {
        const aStartsWith = aName.startsWith(query);
        const bStartsWith = bName.startsWith(query);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
      }

      // Priority High first
      if (a.priorityLevel === 'High' && b.priorityLevel !== 'High') return -1;
      if (a.priorityLevel !== 'High' && b.priorityLevel === 'High') return 1;

      // Alphabetical
      return a.university.localeCompare(b.university);
    });
  }, [countryFilter, locationFilter, typeFilter, searchQuery, schoolTableData]);

  const allTypes = useMemo(() => {
    const types = new Set<string>();
    schoolTableData.forEach((school) => {
      if (school.category) types.add(school.category);
    });
    return ['All', ...Array.from(types).sort()];
  }, [schoolTableData]);

  useEffect(() => {
    if (typeFilter !== 'All' && !allTypes.includes(typeFilter)) {
      setTypeFilter('All');
    }
  }, [allTypes, typeFilter]);

  const groupedSchools = useMemo(() => {
    return filteredSchools.reduce((acc, school) => {
      const { category } = school;
      if (!acc[category]) acc[category] = [];
      acc[category].push(school);
      return acc;
    }, {} as Record<string, SchoolTableEntry[]>);
  }, [filteredSchools]);

  return useMemo(
    () => ({
      countryFilter,
      setCountryFilter: setCountryFilterAndResetLocation,
      locationFilter,
      setLocationFilter,
      typeFilter,
      setTypeFilter,
      searchQuery,
      setSearchQuery,
      allLocations,
      groupedSchools,
      allTypes,
      totalSchools: filteredSchools?.length || 0,
    }),
    [
      countryFilter,
      setCountryFilterAndResetLocation,
      locationFilter,
      typeFilter,
      searchQuery,
      allLocations,
      groupedSchools,
      allTypes,
      filteredSchools.length,
    ]
  );
}
