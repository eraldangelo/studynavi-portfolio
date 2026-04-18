import React, { useRef } from 'react';
import type { SchoolTableEntry } from '@/lib/education-providers/school-table';
import { useClickOutside } from '@/hooks/ui/use-click-outside';
import { parseUniversityName } from '@/lib/education-providers/university-name';

/**
 * Props for the SearchPreview component.
 */
interface SearchPreviewProps {
  /** The array of school results to display (limited to 3). */
  results: SchoolTableEntry[];
  /** The current search query. */
  query: string;
  /** Callback function when the 'See all' link is clicked. */
  onSeeAll: () => void;
  /** Callback function when a school is selected from the preview. */
  onSelectSchool: (school: SchoolTableEntry) => void;
  /** Callback function to close the preview. */
  onClose: () => void;
}

/**
 * A dropdown component that displays a preview of search results.
 */
export const SearchPreview: React.FC<SearchPreviewProps> = ({ 
  results, 
  query, 
  onSeeAll, 
  onSelectSchool, 
  onClose 
}) => {
  const previewRef = useRef<HTMLDivElement>(null);

  // Close the preview if a click is detected outside of it
  useClickOutside(previewRef, onClose);

  // If there's no query, don't render anything.
  // The component will handle the "no results" case internally.
  if (!query) {
    return null;
  }

  return (
    <div
      ref={previewRef}
      className="absolute top-full left-0 right-0 z-10 mt-2 w-full rounded-md bg-white shadow-lg border border-gray-200"
    >
      {results.length > 0 ? (
        <>
          <ul className="py-1">
            {results.map((school) => {
              const parsedUniversity = parseUniversityName(school.university);
              return (
              <li key={school.university}>
                <button
                  onClick={() => onSelectSchool(school)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                >
                  <img src={school.logoUrl} alt={`${parsedUniversity.title} logo`} className="h-6 w-6 mr-3" />
                  <span className="font-bold" style={{ color: '#004097' }}>
                    {parsedUniversity.title}
                  </span>
                </button>
              </li>
              );
            })}
          </ul>
          <div className="border-t border-gray-200 px-4 py-2">
            <button
              onClick={onSeeAll}
              className="w-full text-center text-sm text-yellow-500 hover:underline"
            >
              See all results for "{query}"
            </button>
          </div>
        </>
      ) : (
        <div className="px-4 py-3 text-sm text-gray-500">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
};
