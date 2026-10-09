export function apiBase(): string {
  const base =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    'http://localhost:5080';
  return base.replace(/\/$/, '');
}

export async function coreFetch<T = unknown>(
  path: string,
  accessToken: string | undefined,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  if (!accessToken) {
    return { ok: false, status: 401, data: null };
  }
  const url = `${apiBase()}${path.startsWith('/') ? path : `/${path}`}`;
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        Authorization: `Bearer ${accessToken}`,
        ...(init?.body && !(init.headers as Record<string, string>)?.['Content-Type']
          ? { 'Content-Type': 'application/json' }
          : {}),
      },
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => null)) as T | null;
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export type MicrosoftStatus = {
  configured: boolean;
  connected: boolean;
  accountEmail: string | null;
};
