import { useCallback, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { isE2EAuthBypassEnabled } from '@/lib/env/runtime-flags';

const E2E_AUTH_BYPASS = isE2EAuthBypassEnabled();

type FetchFeesFn<T> = () => Promise<T | null | undefined>;

export function useFeesEditorState<T>(fetchFees: FetchFeesFn<T>) {
  const [feesDoc, setFeesDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const refreshFees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFees();
      setFeesDoc(data ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [fetchFees]);

  useEffect(() => {
    if (E2E_AUTH_BYPASS) {
      setUser({ uid: 'e2e-user', email: 'e2e@example.test' } as User);
      return;
    }

    const unsub = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (!authUser) setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchFees();
        if (active) {
          setFeesDoc(data ?? {});
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [fetchFees]);

  return {
    feesDoc,
    loading,
    error,
    user,
    refreshFees,
  };
}
