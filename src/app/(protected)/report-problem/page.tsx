'use client';

import Link from 'next/link';
import { AppHeader } from '@/components/common/layout/app-header';
import { ChevronLeft, Bug } from 'lucide-react';
import ReportBugForm from '@/components/report-bug/ReportBugForm';
import RecentReports from '@/components/report-bug/RecentReports';

export default function ReportProblemPage() {
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <AppHeader />
      <main className="container mx-auto px-6">
        <div className="pt-8 mb-6 flex items-center gap-4">
          <Link href="/" className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-2">
            <Bug className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-primary">Report a bug</h2>
          </div>
        </div>

        <section className="max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <ReportBugForm />
            </div>

            <aside className="md:col-span-1">
              <div className="max-h-[65vh] overflow-y-auto pr-4">{/* independent scroll for recent reports */}
                <h3 className="text-lg font-semibold text-primary">Recent issue/bug reports</h3>
                <p className="text-sm text-muted-foreground mb-4">Latest reports submitted by users.</p>
                <RecentReports />
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
