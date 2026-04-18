'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { School, ChevronLeft, List, LayoutGrid } from 'lucide-react';
import { AppHeader } from '@/components/common/layout/app-header';
import { SchoolsTable } from '@/components/schools/schools-table';
import { SchoolsFilterBar } from '@/components/schools/schools-filter-bar';
import { useSchoolsFilter } from '@/hooks/schools/use-schools-filter';
import { useEducationProviders } from '@/hooks/schools/use-education-providers';
import { Button } from '@/components/ui/forms/button';

export default function PartnerSchoolsClient({ initialType = 'All' }: { initialType?: string }) {
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const { schools, isLoading, error } = useEducationProviders();
  const filter = useSchoolsFilter(schools, initialType);

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <AppHeader showSearch={false} />
      
      {/* Header outside main container */}
      <div className="container mx-auto px-4">
        <div className="pt-8 mb-6 flex items-center gap-4">
            <Link href="/" className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">
                <ChevronLeft className="h-6 w-6" />
            </Link>
          <div className="flex items-center gap-2">
            <School className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-primary">Partner Schools</h2>
          </div>
        </div>
      </div>

      {/* Sticky Filter Bar - Now separate from main content flow */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
            <SchoolsFilterBar filter={filter} />
            <div className="hidden md:flex items-center gap-1">
              <Button 
                variant={view === 'list' ? 'secondary' : 'ghost'} 
                size="icon" 
                onClick={() => setView('list')} 
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={view === 'grid' ? 'secondary' : 'ghost'} 
                size="icon" 
                onClick={() => setView('grid')} 
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {isLoading && (
          <p className="mb-4 text-sm text-muted-foreground">Loading partner schools from Firestore...</p>
        )}
        {error && !isLoading && (
          <p className="mb-4 text-sm text-red-500">{error}</p>
        )}
        <SchoolsTable filter={filter} view={view} />
      </main>
    </div>
  );
}
