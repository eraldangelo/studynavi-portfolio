'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/layout/table';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/display/badge';
import { SchoolCard } from './school-card';
import type { SchoolTableEntry } from '@/lib/education-providers/school-table';
import type { useSchoolsFilter } from '@/hooks/schools/use-schools-filter';
import IntakeFormatter from './IntakeFormatter';
import { Pagination } from '@/components/common/navigation/pagination';
import { parseUniversityName } from '@/lib/education-providers/university-name';

interface SchoolsTableProps {
  filter: ReturnType<typeof useSchoolsFilter>;
  view: 'list' | 'grid';
}

const SCHOOLS_PER_PAGE = 20;

export function SchoolsTable({ filter, view }: SchoolsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalSchools = filter?.totalSchools ?? 0;
  const noResults = totalSchools === 0;

  const allSchools = Object.values(filter.groupedSchools).flat().sort((a, b) => a.university.localeCompare(b.university));
  const totalPages = Math.ceil(allSchools.length / SCHOOLS_PER_PAGE);

  const paginatedSchools = allSchools.slice(
    (currentPage - 1) * SCHOOLS_PER_PAGE,
    currentPage * SCHOOLS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {noResults ? (
        <div className="text-center py-20">
          <p className="text-lg font-semibold text-muted-foreground">
            No schools found.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your filters or search terms.
          </p>
        </div>
      ) : view === 'list' ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px] font-bold text-primary text-center">University</TableHead>
                <TableHead className="w-[150px] font-bold text-primary text-center">Location</TableHead>
                <TableHead className="font-bold text-primary text-center">General Programs</TableHead>
                <TableHead className="font-bold text-primary text-center">Typical Intakes</TableHead>
                <TableHead className="font-bold text-primary text-center">Signature Programs</TableHead>
                <TableHead className="font-bold text-primary text-center">Priority Level</TableHead>
                <TableHead className="font-bold text-primary text-center">Official Website</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSchools.map((school: SchoolTableEntry) => {
                const parsedUniversity = parseUniversityName(school.university);
                return (
                <TableRow key={school.university}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Image
                        src={school.logoUrl}
                        alt={`${parsedUniversity.title} logo`}
                        width={60}
                        height={60}
                        className="h-16 w-16 object-contain"
                      />
                      <div className="text-primary font-bold">
                        <span>{parsedUniversity.title}</span>
                        {parsedUniversity.details.length > 0 ? (
                          <ul className="mt-1 list-disc pl-5 text-xs font-normal text-muted-foreground">
                            {parsedUniversity.details.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {school.location.map((loc, index) => {
                      if (loc.startsWith('**') && loc.endsWith('**')) {
                        return <div key={index} className="font-bold text-foreground mt-2">{loc.slice(2, -2)}</div>;
                      }
                      if (loc.startsWith('•')) {
                        return <div key={index} className="pl-2">{loc}</div>;
                      }
                      return <div key={index}>{loc}</div>;
                    })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{school.generalPrograms}</TableCell>
                  <TableCell>
                    <IntakeFormatter intakes={school.intakes} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{school.popularPrograms}</TableCell>
                  <TableCell>
                    <Badge
                      variant={school.priorityLevel === 'High' ? 'destructive' : 'secondary'}
                      className={school.priorityLevel === 'High' ? 'bg-green-600 text-white' : ''}
                    >
                      {school.priorityLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {school.website ? (
                      <Link href={school.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                          Click Here
                          <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {paginatedSchools.map((school) => (
              <SchoolCard key={school.university} school={school} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
