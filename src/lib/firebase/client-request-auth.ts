import { auth } from '@/lib/firebase/client';

export async function getAuthBearerToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) return '';
  try {
    return await user.getIdToken();
  } catch {
    return '';
  }
}

export async function buildAuthorizedJsonHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = await getAuthBearerToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

