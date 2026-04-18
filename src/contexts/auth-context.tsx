'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';

import { auth } from '@/lib/firebase/client';
import { signIn as firebaseSignIn, signOut as firebaseSignOut } from '@/lib/firebase/auth';
import { isE2EAuthBypassEnabled } from '@/lib/env/runtime-flags';
import { clearServerSession, establishServerSessionFromUser } from '@/lib/firebase/server-session';

const E2E_AUTH_BYPASS = isE2EAuthBypassEnabled();
const E2E_AUTH_KEY = '__e2e_auth_user__';

function readE2EUser(): User | null {
  try {
    const raw = localStorage.getItem(E2E_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { uid?: string; email?: string };
    return {
      uid: parsed.uid || 'e2e-user',
      email: parsed.email || 'e2e@example.test',
    } as User;
  } catch {
    return null;
  }
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>; // Allow component to handle errors
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [expiryTimer, setExpiryTimer] = useState<number | null>(null);

  useEffect(() => {
    if (E2E_AUTH_BYPASS) {
      setUser(readE2EUser());
      setLoading(false);
      const handleStorage = (event: StorageEvent) => {
        if (event.key === E2E_AUTH_KEY) {
          setUser(readE2EUser());
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }

    let unsubscribe = () => {};

    (async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (e) {
        console.error('[auth] init error:', e);
      } finally {
        unsubscribe = onAuthStateChanged(auth, (u) => {
          setUser(u);
          setLoading(false);
          if (u) {
            void establishServerSessionFromUser(u).catch((error) => {
              console.warn('[auth] server session sync failed:', error);
            });
          } else {
            void clearServerSession();
          }
        });

        // On init, check stored session expiry and enforce sign-out if expired,
        // otherwise schedule sign-out at the expiry time.
        try {
          const raw = localStorage.getItem('sessionExpiry');
          if (raw) {
            const expiry = new Date(raw);
            const now = new Date();
            if (expiry <= now) {
              // expired: sign out immediately
              firebaseSignOut().catch(() => {});
              localStorage.removeItem('sessionExpiry');
            } else {
              // schedule sign out
              const ms = expiry.getTime() - now.getTime();
              const id = window.setTimeout(() => {
                firebaseSignOut().catch(() => {});
                localStorage.removeItem('sessionExpiry');
              }, ms);
              setExpiryTimer(id);
            }
          }
        } catch (e) {
          // localStorage may be unavailable in some contexts
        }
      }
    })();

    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextType>(() => {
    return {
      user,
      loading,
      signIn: async (email, password) => {
        if (E2E_AUTH_BYPASS) {
          const mockUser = { uid: 'e2e-user', email } as User;
          localStorage.setItem(E2E_AUTH_KEY, JSON.stringify({ uid: mockUser.uid, email: mockUser.email }));
          setUser(mockUser);
          return { user: mockUser };
        }

        // Pass promise back to component to allow for error handling
        const res = await firebaseSignIn(email, password);
        try {
          await establishServerSessionFromUser(res.user);
        } catch (error) {
          await firebaseSignOut().catch(() => {});
          throw error;
        }

        // On successful sign-in, set session expiry to next 00:01 local time
        try {
          const now = new Date();
          const next = new Date(now);
          next.setDate(now.getDate() + 1);
          next.setHours(0, 1, 0, 0); // 00:01
          localStorage.setItem('sessionExpiry', next.toISOString());

          const ms = next.getTime() - now.getTime();
          if (expiryTimer) {
            window.clearTimeout(expiryTimer);
          }
          const id = window.setTimeout(() => {
            firebaseSignOut().catch(() => {});
            localStorage.removeItem('sessionExpiry');
          }, ms);
          setExpiryTimer(id);
        } catch (e) {
          // ignore storage/timer errors
        }

        return res;
      },
      signOut: async () => {
        if (E2E_AUTH_BYPASS) {
          localStorage.removeItem(E2E_AUTH_KEY);
          setUser(null);
          return;
        }

        if (expiryTimer) {
          window.clearTimeout(expiryTimer);
          setExpiryTimer(null);
        }
        try {
          localStorage.removeItem('sessionExpiry');
        } catch (e) {}
        await clearServerSession();
        await firebaseSignOut();
      },
    };
  }, [user, loading, expiryTimer]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
