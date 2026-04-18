'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { sanitizeInternalRedirectTarget } from '@/lib/security/redirect';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading) return;
    if (user) return;

    const qs = searchParams.toString();
    const currentUrl = sanitizeInternalRedirectTarget(`${pathname}${qs ? `?${qs}` : ''}`, '/');

    // Avoid redirecting if already on login (defensive)
    if (pathname !== '/login') {
      router.replace(`/login?next=${encodeURIComponent(currentUrl)}`);

      // Fallback for cases where client routing stalls: force a hard navigation.
      const timer = window.setTimeout(() => {
        window.location.replace(`/login?next=${encodeURIComponent(currentUrl)}`);
      }, 500);
      return () => {
        window.clearTimeout(timer);
      };
    }
  }, [loading, user, router, pathname, searchParams]);

  if (loading) {
    // Keep this lightweight; avoid heavy layout mount
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting to login...</div>;
  }
  return <>{children}</>;
}
