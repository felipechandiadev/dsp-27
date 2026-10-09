'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiBase } from '@/lib/api/core-fetch';

type Props = {
  code: string;
  avatarAssetId: string | null;
  initials: string;
  canEdit: boolean;
};

export function StaffAvatar({
  code,
  avatarAssetId,
  initials,
  canEdit,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const token = session?.user?.accessToken;

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;
    async function load() {
      if (!avatarAssetId || !token) {
        setBlobUrl(null);
        return;
      }
      try {
        const res = await fetch(
          `${apiBase()}/api/multimedia/${avatarAssetId}/content`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) {
          if (!cancelled) setBlobUrl(null);
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        revoked = url;
        if (!cancelled) setBlobUrl(url);
      } catch {
        if (!cancelled) setBlobUrl(null);
      }
    }
    void load();
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [avatarAssetId, token]);

  async function onFile(file: File | null) {
    if (!file || !token || !canEdit) return;
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch(
        `${apiBase()}/api/staff/${encodeURIComponent(code)}/avatar`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body,
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          Array.isArray(data?.message)
            ? data.message.join(', ')
            : (data?.message ?? `Error ${res.status}`),
        );
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al subir');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-muted)] flex items-center justify-center text-lg font-semibold"
        aria-label="Avatar"
      >
        {blobUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={blobUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {canEdit && token ? (
        <label className="text-sm cursor-pointer underline text-[var(--color-muted-foreground)]">
          {busy ? 'Subiendo…' : 'Cambiar foto'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={busy}
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </label>
      ) : null}
      {error ? (
        <p className="text-xs m-0 text-[var(--color-destructive)]">{error}</p>
      ) : null}
    </div>
  );
}
