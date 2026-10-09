'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Badge, Button } from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';

const REQ_STATUSES = ['missing', 'received', 'approved', 'rejected'] as const;

export type StaffRequirement = {
  id: string;
  requirementCode: string;
  status: string;
  notes: string | null;
};

type Props = {
  code: string;
  inspectorQualityStatus: string;
  readyForGrant: boolean;
  requirements: StaffRequirement[];
};

export function StaffRequirementChecklist({
  code,
  inspectorQualityStatus: initialQuality,
  readyForGrant: initialReady,
  requirements: initialReqs,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [reqs, setReqs] = useState(initialReqs);
  const [quality, setQuality] = useState(initialQuality);
  const [ready, setReady] = useState(initialReady);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = session?.user?.accessToken;
  const granted = quality === 'granted';

  async function updateReq(requirementCode: string, nextStatus: string) {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiBase()}/api/staff/${encodeURIComponent(code)}/requirements/${encodeURIComponent(requirementCode)}`,
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
        throw new Error(
          Array.isArray(body?.message)
            ? body.message.join(', ')
            : (body?.message ?? `Error ${res.status}`),
        );
      }
      const updated = (await res.json()) as {
        requirementCode: string;
        status: string;
        inspectorQualityStatus?: string;
      };
      const nextReqs = reqs.map((r) =>
        r.requirementCode === requirementCode
          ? { ...r, status: updated.status }
          : r,
      );
      setReqs(nextReqs);
      if (updated.inspectorQualityStatus) {
        setQuality(updated.inspectorQualityStatus);
      }
      setReady(
        nextReqs.every(
          (r) => r.status === 'received' || r.status === 'approved',
        ),
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar');
    } finally {
      setBusy(false);
    }
  }

  async function grantQuality() {
    if (!token || (!ready && quality !== 'pending')) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiBase()}/api/staff/${encodeURIComponent(code)}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inspectorQualityStatus: 'granted' }),
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
      const updated = (await res.json()) as {
        inspectorQualityStatus: string;
      };
      setQuality(updated.inspectorQualityStatus);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al conceder calidad');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="m-0 p-0 list-none flex flex-col gap-3">
        {reqs.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center gap-2 text-sm border-b border-[var(--color-border)] pb-3"
          >
            <span className="font-medium min-w-[12rem]">
              {r.requirementCode}
            </span>
            <Badge variant="secondary">{r.status}</Badge>
            <select
              className="text-sm border border-[var(--color-border)] rounded px-2 py-1 bg-[var(--color-background)]"
              value={r.status}
              disabled={busy || !token}
              onChange={(e) => updateReq(r.requirementCode, e.target.value)}
            >
              {REQ_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm">Calidad inspector:</span>
        <Badge variant="secondary">{quality}</Badge>
      </div>

      {!granted ? (
        <div className="flex flex-col gap-2 max-w-md">
          <Button
            type="button"
            disabled={busy || !token || !ready}
            onClick={() => void grantQuality()}
          >
            Conceder calidad inspector
          </Button>
          {!ready ? (
            <p className="text-xs m-0 text-[var(--color-muted-foreground)]">
              Marca todos los requisitos como received o approved.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm m-0 text-[var(--color-muted-foreground)]">
          Incluido en nómina art. 15° (si estado active).
        </p>
      )}

      {error ? (
        <p className="text-sm m-0 text-[var(--color-destructive)]">{error}</p>
      ) : null}
    </div>
  );
}
