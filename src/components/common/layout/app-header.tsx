'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/forms/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/overlay/dropdown-menu';
import { Menu, School, Search, LogOut, Wrench, Bug, Dumbbell } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { SearchBox } from '@/components/common/search/search-box';
import SearchResultsDialog from '@/components/schools/search-results-dialog';
import { useEducationProviders } from '@/hooks/schools/use-education-providers';

// Feature flag: set NEXT_PUBLIC_ISAM_ENABLED=true to show the ISAM Training menu
const SHOW_ISAM = process.env.NEXT_PUBLIC_ISAM_ENABLED === 'true';

interface AppHeaderProps {
  showControls?: boolean;
  showSearch?: boolean;
}

export function AppHeader({ showControls = true, showSearch = true }: AppHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { signOut } = useAuth();
  const { schools } = useEducationProviders();

  const handleSearchRequest = (query: string) => {
    setSearchQuery(query);
    setIsDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.replace('/login');
    } catch (e) {
      console.error('[logout] failed:', e);
      // Even when signout throws, force the user back to login.
      window.location.replace('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70" 
            alt="StudyNavi Logo" 
            className="h-7 mix-blend-multiply sm:h-8 md:h-10 mr-2 sm:mr-3 md:mr-4" 
          />
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-bold sm:text-xl md:text-2xl">
              <span style={{ color: '#004097' }}>Study</span>
              <span style={{ color: '#eab308' }}>Navi</span>
            </h1>
          </div>
        </div>

        {showControls && (
          <div className="flex items-center gap-2">
            {showSearch && (
              <>
                <div className="hidden md:block">
                    <SearchBox onSearchRequest={handleSearchRequest} schools={schools} />
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => handleSearchRequest('')}
                >
                    <Search className="h-6 w-6" />
                    <span className="sr-only">Search</span>
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/partnerschools">
                    <School className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>Partner School List</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/fees-updater">
                    <Wrench className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>Fees Updater</span>
                  </Link>
                </DropdownMenuItem>
                {SHOW_ISAM && (
                  <DropdownMenuItem asChild>
                    <Link href="/isam-training">
                      <Dumbbell className="mr-2 h-4 w-4 text-yellow-500" />
                      <span>ISAM Training</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/report-problem">
                    <Bug className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>Report a problem</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-red-600">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <SearchResultsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialQuery={searchQuery}
        setInitialQuery={setSearchQuery}
        schools={schools}
      />
    </header>
  );
}
