'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, type FormEvent } from 'react';
import { Button, Dialog, Select, TextField } from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';
import type { DocumentTypeRow } from '@/features/documents/ui/document-types';

type Props = {
  open: boolean;
  onClose: () => void;
  documentTypes: DocumentTypeRow[];
};

export function CreateReportDialog({ open, onClose, documentTypes }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.user?.accessToken;
  const [title, setTitle] = useState('');
  const [typeCode, setTypeCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typeOptions = documentTypes
    .filter((t) => t.status === 'active' && t.creationMode === 'composed')
    .map((t) => ({ id: t.code, label: t.name }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/api/documents/reports`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          documentTypeCode: typeCode,
          status: 'draft',
          bodyJson: { type: 'doc', content: [] },
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          Array.isArray(data?.message)
            ? data.message.join(', ')
            : (data?.message ?? `Error ${res.status}`),
        );
      }
      onClose();
      setTitle('');
      setTypeCode(null);
      if (data?.code) {
        router.push(`/documents/reports/${encodeURIComponent(data.code)}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Nuevo informe">
      <form onSubmit={onSubmit} className="grid gap-3">
        <TextField
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Select
          label="Tipo de documento"
          options={typeOptions}
          value={typeCode}
          onChange={(id) => setTypeCode(id == null ? null : String(id))}
          allowClear
          placeholder="Opcional…"
        />
        {error ? (
          <p className="m-0 text-sm text-[var(--color-destructive,#b91c1c)]">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy || !title.trim() || !token}>
            {busy ? 'Creando…' : 'Crear'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
