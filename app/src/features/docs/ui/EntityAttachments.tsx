'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Alert, Button } from '@felipechandiadev/ui';
import { FileText } from 'lucide-react';
import { apiBase } from '@/lib/api/core-fetch';

export type AttachmentItem = {
  id: string;
  originalName: string;
  mimeType: string;
  byteSize: number;
  kind?: string;
};

type Props = {
  /** Si se pasa, muestra este asset (p. ej. PDF oficial de la ficha). */
  asset?: AttachmentItem | null;
  /**
   * Endpoint dedicado de subida (multipart `file`).
   * Ej.: `/api/legal/norms/LEY-21802/pdf`
   */
  uploadPath?: string;
  canEdit: boolean;
  accept?: string;
  emptyLabel?: string;
  uploadLabel?: string;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function EntityAttachments({
  asset,
  uploadPath,
  canEdit,
  accept = 'application/pdf',
  emptyLabel = 'Sin documento adjunto.',
  uploadLabel = 'Subir PDF',
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.user?.accessToken;
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;
    async function load() {
      if (!asset?.id || !token) {
        setBlobUrl(null);
        return;
      }
      try {
        const res = await fetch(
          `${apiBase()}/api/multimedia/${asset.id}/content`,
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
  }, [asset?.id, token]);

  async function onFile(file: File | null) {
    if (!file || !token || !canEdit || !uploadPath) return;
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch(`${apiBase()}${uploadPath}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          message?: string | string[];
        } | null;
        const msg = data?.message;
        throw new Error(
          Array.isArray(msg)
            ? msg.join(', ')
            : typeof msg === 'string'
              ? msg
              : `Error ${res.status}`,
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
    <div className="grid gap-3">
      {error ? <Alert variant="error">{error}</Alert> : null}
      {asset ? (
        <div className="flex flex-wrap items-center gap-3">
          <FileText
            className="h-8 w-8 shrink-0 text-[var(--color-muted-foreground)]"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="m-0 font-medium truncate">{asset.originalName}</p>
            <p className="m-0 text-sm text-[var(--color-muted-foreground)]">
              {asset.mimeType} · {formatBytes(asset.byteSize)}
            </p>
          </div>
          {blobUrl ? (
            <a
              href={blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline"
            >
              Abrir
            </a>
          ) : null}
        </div>
      ) : (
        <p className="m-0 text-sm text-[var(--color-muted-foreground)]">
          {emptyLabel}
        </p>
      )}
      {canEdit && uploadPath ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              void onFile(e.target.files?.[0] ?? null);
              e.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outlined"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? 'Subiendo…' : uploadLabel}
          </Button>
        </>
      ) : null}
    </div>
  );
}
