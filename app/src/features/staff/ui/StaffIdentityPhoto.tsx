'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, MultimediaUpdater } from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';

type Props = {
  code: string;
  avatarAssetId: string | null;
  canEdit: boolean;
};

/** Foto de identidad: MultimediaUpdater avatar + edge (patrón realEstate). */
export function StaffIdentityPhoto({
  code,
  avatarAssetId,
  canEdit,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.user?.accessToken;
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [updaterKey, setUpdaterKey] = useState(0);

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;
    async function load() {
      if (!avatarAssetId || !token) {
        setCurrentUrl(null);
        return;
      }
      try {
        const res = await fetch(
          `${apiBase()}/api/multimedia/${avatarAssetId}/content`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) {
          if (!cancelled) setCurrentUrl(null);
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        revoked = url;
        if (!cancelled) setCurrentUrl(url);
      } catch {
        if (!cancelled) setCurrentUrl(null);
      }
    }
    void load();
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [avatarAssetId, token]);

  async function onFileChange(file: File | null) {
    if (!file || !token || !canEdit) return;
    setUploading(true);
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
      setCurrentUrl(URL.createObjectURL(file));
      setUpdaterKey((k) => k + 1);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al subir');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="inline-flex w-fit flex-col items-center gap-1 overflow-visible"
      onClick={(e) => e.stopPropagation()}
    >
      {error ? <Alert variant="error">{error}</Alert> : null}
      <div className={uploading ? 'pointer-events-none opacity-60' : ''}>
        <MultimediaUpdater
          key={`${updaterKey}-${currentUrl ?? 'none'}`}
          variant="avatar"
          avatarSize="lg"
          actionPlacement="edge"
          currentUrl={currentUrl}
          currentType="image"
          acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
          maxSize={8}
          allowDragDrop={canEdit}
          disabled={!canEdit || !token || uploading}
          onFileChange={onFileChange}
        />
      </div>
      {uploading ? (
        <p className="text-xs m-0 text-[var(--color-muted-foreground)]">
          Subiendo…
        </p>
      ) : null}
    </div>
  );
}
