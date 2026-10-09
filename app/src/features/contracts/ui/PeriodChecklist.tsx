'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Badge, Button } from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';

const DOC_STATUSES = ['missing', 'received', 'approved', 'rejected'] as const;

export type PeriodDocument = {
  id: string;
  docType: string;
  status: string;
  notes: string | null;
};

type Props = {
  periodId: string;
  status: string;
  canCertify: boolean;
  documents: PeriodDocument[];
  certificationNotes: string | null;
};

export function PeriodChecklist({
  periodId,
  status,
  canCertify: initialCanCertify,
  documents: initialDocs,
  certificationNotes,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [docs, setDocs] = useState(initialDocs);
  const [canCertify, setCanCertify] = useState(initialCanCertify);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const certified = status === 'certified';
  const token = session?.user?.accessToken;

  async function updateDoc(docType: string, nextStatus: string) {
    if (!token || certified) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiBase()}/api/contracts/periods/${periodId}/documents/${encodeURIComponent(docType)}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Error ${res.status}`);
      }
      const updated = (await res.json()) as PeriodDocument;
      setDocs((prev) =>
        prev.map((d) => (d.docType === docType ? { ...d, ...updated } : d)),
      );
      const next = docs.map((d) =>
        d.docType === docType ? { ...d, status: nextStatus } : d,
      );
      setCanCertify(
        next.every((d) => d.status === 'received' || d.status === 'approved'),
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar');
    } finally {
      setBusy(false);
    }
  }

  async function certify() {
    if (!token || !canCertify || certified) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiBase()}/api/contracts/periods/${periodId}/certify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notes: notes || undefined }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          Array.isArray(body?.message)
            ? body.message.join(', ')
            : (body?.message ?? `Error ${res.status}`),
        );
      }
      setCanCertify(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al certificar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="m-0 p-0 list-none flex flex-col gap-3">
        {docs.map((d) => (
          <li
            key={d.id}
            className="flex flex-wrap items-center gap-2 text-sm border-b border-[var(--color-border)] pb-3"
          >
            <span className="font-medium min-w-[10rem]">{d.docType}</span>
            <Badge variant="secondary">{d.status}</Badge>
            {!certified ? (
              <select
                className="text-sm border border-[var(--color-border)] rounded px-2 py-1 bg-[var(--color-background)]"
                value={d.status}
                disabled={busy || !token}
                onChange={(e) => updateDoc(d.docType, e.target.value)}
              >
                {DOC_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : null}
          </li>
        ))}
      </ul>

      {certified ? (
        <p className="text-sm m-0 text-[var(--color-muted-foreground)]">
          Período certificado.
          {certificationNotes ? ` Nota: ${certificationNotes}` : ''}
        </p>
      ) : (
        <div className="flex flex-col gap-2 max-w-md">
          <label className="text-sm flex flex-col gap-1">
            Nota de certificación
            <textarea
              className="border border-[var(--color-border)] rounded px-2 py-1 text-sm bg-[var(--color-background)] min-h-[4rem]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={busy || !token}
              placeholder="Opcional"
            />
          </label>
          <Button
            type="button"
            disabled={busy || !token || !canCertify}
            onClick={() => void certify()}
          >
            Certificar período
          </Button>
          {!canCertify ? (
            <p className="text-xs m-0 text-[var(--color-muted-foreground)]">
              Marca todos los documentos como received o approved para certificar.
            </p>
          ) : null}
        </div>
      )}

      {error ? (
        <p className="text-sm m-0 text-[var(--color-destructive)]">{error}</p>
      ) : null}
    </div>
  );
}
