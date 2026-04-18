'use client';

import type { SchoolTableEntry } from '@/lib/education-providers/school-table';
import { SchoolCard } from './school-card';

interface SchoolsListProps {
  groupedSchools: Record<string, SchoolTableEntry[]>;
  totalSchools: number;
}

export function SchoolsList({ groupedSchools, totalSchools }: SchoolsListProps) {

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Showing {totalSchools} schools
      </p>

      {Object.keys(groupedSchools).length > 0 ? (
        <div className="space-y-8">
          {Object.keys(groupedSchools).map(category => (
            <div key={category}>
              <h2 className="text-2xl font-bold mb-4 text-primary">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedSchools[category].map(school => (
                  <SchoolCard key={school.university} school={school} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No schools found.</p>
      )}
    </div>
  );
}
