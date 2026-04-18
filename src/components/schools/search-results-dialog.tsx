'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/overlay/dialog';
import { ScrollArea } from '@/components/ui/layout/scroll-area';
import { Input } from '@/components/ui/forms/input';
import { X, Search, AlertTriangle } from 'lucide-react';
import type { SchoolTableEntry } from '@/lib/education-providers/school-table';
import { SchoolCard } from './school-card';
import { matchesSchoolQuery } from '@/lib/search/school-search-utils';

interface SearchResultsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialQuery: string;
  setInitialQuery: (query: string) => void;
  schools: SchoolTableEntry[];
}

export default function SearchResultsDialog({
  isOpen,
  onOpenChange,
  initialQuery,
  setInitialQuery,
  schools,
}: SearchResultsDialogProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SchoolTableEntry[]>([]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery, isOpen]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const searchResults = schools.filter((school) =>
      matchesSchoolQuery(school, query)
    );

    // Sort results by priority and then alphabetically
    searchResults.sort((a, b) => {
      if (a.priorityLevel === 'High' && b.priorityLevel !== 'High') return -1;
      if (a.priorityLevel !== 'High' && b.priorityLevel === 'High') return 1;
      return a.university.localeCompare(b.university);
    });

    setResults(searchResults);
  }, [query, schools]);

  const handleClose = () => {
    setInitialQuery(query);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl p-0" showCloseButton={false}>
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-none w-10">
              <button
                onClick={handleClose}
                className="group h-3.5 w-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center z-20"
                aria-label="Close modal"
              >
                <X className="h-2 w-2 text-[#9a0000] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
            <div className="flex-grow text-center">
              <DialogTitle
                className="text-base flex items-center justify-center gap-2"
                style={{ color: '#004097' }}
              >
                <Search className="h-4 w-4" />
                Search Results
              </DialogTitle>
            </div>
            <div className="flex-none w-10"></div>
          </div>

          <div className="relative mt-2 px-4">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Refine your search..."
              className="pl-9 placeholder:italic w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <DialogDescription className="text-center text-xs px-4 pt-2">
            Showing {results.length} results for:{ ' '}
            <span className="font-semibold italic text-primary">{query}</span>
            <br />
            <span className="italic text-red-500 flex items-center justify-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Please always check the school's website to see if the course is
              available at a specific campus.
            </span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6">
            {results.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {results.map((school) => (
                  <SchoolCard key={school.university} school={school} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg font-semibold text-muted-foreground">
                  No schools found.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search terms.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
