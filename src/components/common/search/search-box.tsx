'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/forms/input';
import { Search } from 'lucide-react';
import type { SchoolTableEntry } from '@/lib/education-providers/school-table';
import { useDebouncedSearch } from '@/hooks/ui/use-debounced-search';
import { filterAndSortSchools } from '@/lib/search/search-schools';
import { SearchPreview } from '@/components/common/search/search-preview';

interface SearchBoxProps {
  onSearchRequest: (query: string) => void;
  schools: SchoolTableEntry[];
}

export function SearchBox({ onSearchRequest, schools }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [previewResults, setPreviewResults] = useState<SchoolTableEntry[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const debouncedQuery = useDebouncedSearch(query, 300);

  useEffect(() => {
    if (debouncedQuery.length > 1) {
      const filtered = filterAndSortSchools(schools, debouncedQuery);
      setPreviewResults(filtered.slice(0, 3));
      setShowPreview(true); // Show preview even if there are no results
    } else {
      setPreviewResults([]);
      setShowPreview(false);
    }
  }, [debouncedQuery, schools]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearchRequest(query);
    setShowPreview(false);
  };

  const handleSeeAll = () => {
    onSearchRequest(query);
    setShowPreview(false);
  };

  const handleSelectSchool = (_school: SchoolTableEntry) => {
    setShowPreview(false);
  };

  return (
    <div className="relative w-full max-w-sm">
      <form onSubmit={handleFormSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search Partner Schools"
          className="pl-9 placeholder:italic"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
      {showPreview && (
        <SearchPreview
          results={previewResults}
          query={debouncedQuery} // Pass debouncedQuery to show relevant message
          onSeeAll={handleSeeAll}
          onSelectSchool={handleSelectSchool}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
