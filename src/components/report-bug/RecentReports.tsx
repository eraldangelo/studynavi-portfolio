'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/client';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type Query,
  type DocumentData,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  isLegacyStaffBridgeEnabledClient,
  isLegacyStaffCompatClaim,
  resolveStaffEmailDomain,
} from '@/lib/security/claims-governance';

type Report = {
  id: string;
  name?: string;
  issue?: string;
  createdByUid?: string;
  screenshotUrl?: string | null;
  createdAt?: any;
  status?: string;
};

const legacyStaffCompatBridgeEnabled = isLegacyStaffBridgeEnabledClient();
const staffEmailDomain = resolveStaffEmailDomain();

function isStaffUser(
  email: string,
  adminClaim: unknown,
  staffClaim: unknown,
  supportClaim: unknown,
  emailVerifiedClaim: unknown,
  legacyStaffCompatClaim: unknown,
): boolean {
  if (adminClaim === true || staffClaim === true || supportClaim === true) return true;
  if (!legacyStaffCompatBridgeEnabled) return false;
  return isLegacyStaffCompatClaim({
    email,
    emailVerified: emailVerifiedClaim === true,
    legacyClaim: legacyStaffCompatClaim,
    staffDomain: staffEmailDomain,
  });
}

function byNewest(a: Report, b: Report) {
  const aMs = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : Number(new Date(a.createdAt || 0));
  const bMs = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : Number(new Date(b.createdAt || 0));
  return bMs - aMs;
}

export default function RecentReports() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
      if (!user) {
        setReports([]);
        return;
      }

      let queryRef: Query<DocumentData>;
      try {
        const tokenResult = await user.getIdTokenResult();
        const email = String(tokenResult.claims.email || user.email || '');
        const staff = isStaffUser(
          email,
          tokenResult.claims.admin,
          tokenResult.claims.staff,
          tokenResult.claims.support,
          tokenResult.claims.email_verified,
          tokenResult.claims.legacy_staff_email_fallback,
        );

        queryRef = staff
          ? query(collection(db as any, 'reports'), orderBy('createdAt', 'desc'), limit(5))
          : query(collection(db as any, 'reports'), where('createdByUid', '==', user.uid), limit(20));
      } catch {
        queryRef = query(collection(db as any, 'reports'), where('createdByUid', '==', user.uid), limit(20));
      }

      unsubscribeSnapshot = onSnapshot(
        queryRef,
        (snapshot) => {
          const items: Report[] = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
          setReports(items.sort(byNewest).slice(0, 5));
        },
        (error) => {
          console.error('RecentReports snapshot error:', error);
          setReports([]);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  if (!reports.length) {
    return <div className="text-sm text-muted-foreground">No recent reports.</div>;
  }

  const statusClasses = (status?: string) => {
    const normalized = (status || 'Submitted').toLowerCase();
    if (normalized === 'submitted') return 'bg-gray-200 text-gray-800';
    if (normalized === 'on-going' || normalized === 'ongoing') return 'bg-blue-600 text-white';
    if (normalized === 'resolved') return 'bg-green-600 text-white';
    return 'bg-gray-200 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const date = report.createdAt?.toDate
          ? report.createdAt.toDate()
          : (report.createdAt ? new Date(report.createdAt) : null);
        const status = report.status || 'Submitted';
        return (
          <div key={report.id} className="py-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    User: <span className="font-normal">{report.name || 'Anonymous'}</span>
                  </div>
                  <div className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusClasses(status)}`}>
                    {status}
                  </div>
                </div>
                <div className="mt-1 text-sm">
                  <strong>Issue / Bug report:</strong>
                </div>
                <div className="mt-1 text-xs text-foreground/90">{report.issue || 'No description'}</div>
              </div>
              <div className="ml-2 text-xs text-muted-foreground">{date ? date.toLocaleString() : '-'}</div>
            </div>
            <div className="mt-3 border-t" />
          </div>
        );
      })}
    </div>
  );
}
