'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { Input } from '@/components/ui/forms/input';
import { Search } from 'lucide-react';
import { useSchoolsFilter, countryOptions } from '@/hooks/schools/use-schools-filter';

interface SchoolsFilterBarProps {
  filter: ReturnType<typeof useSchoolsFilter>;
}

export function SchoolsFilterBar({ filter }: SchoolsFilterBarProps) {
  const {
    countryFilter,
    setCountryFilter,
    locationFilter,
    setLocationFilter,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    allLocations,
    allTypes,
  } = filter;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap md:flex-nowrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium shrink-0">Country:</label>
          <Select onValueChange={setCountryFilter} value={countryFilter}>
            <SelectTrigger className="w-full sm:w-auto">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              {countryOptions.map(option => (
                <SelectItem key={option.value} value={option.value} disabled={(option as any).disabled}>
                  <div className="flex items-center gap-2">
                    {option.flag && <img src={option.flag} alt={option.label} className="h-4 w-5 object-cover" />}
                    <span>{option.label}{(option as any).disabled ? ' (coming soon)' : ''}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium shrink-0">Location:</label>
          <Select onValueChange={setLocationFilter} value={locationFilter}>
            <SelectTrigger className="w-full sm:w-auto">
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent>
              {allLocations.map(loc => (
                <SelectItem key={loc} value={loc}>
                    {loc === 'All' ? 'All Locations' : loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium shrink-0">School Type:</label>
          <Select onValueChange={setTypeFilter} value={typeFilter}>
            <SelectTrigger className="w-full sm:w-auto">
              <SelectValue placeholder="Select School Type" />
            </SelectTrigger>
            <SelectContent>
              {allTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'All' ? 'All Types' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search manually..."
          className="pl-9 placeholder:italic w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </>
  );
}
