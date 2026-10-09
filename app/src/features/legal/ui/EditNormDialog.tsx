'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Alert,
  Button,
  Dialog,
  Select,
  TextField,
} from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';
import {
  LEGAL_NORM_KINDS,
  LEGAL_NORM_KIND_LABELS,
  LEGAL_NORM_STATUSES,
  LEGAL_NORM_STATUS_LABELS,
  type NormDetail,
} from './legal-types';

type Props = {
  norm: NormDetail | null;
  open: boolean;
  onClose: () => void;
};

const KIND_OPTIONS = LEGAL_NORM_KINDS.map((k) => ({
  id: k,
  label: LEGAL_NORM_KIND_LABELS[k],
}));

const STATUS_OPTIONS = LEGAL_NORM_STATUSES.map((s) => ({
  id: s,
  label: LEGAL_NORM_STATUS_LABELS[s],
}));

export function EditNormDialog({ norm, open, onClose }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.user?.accessToken;

  const [kind, setKind] = useState<string | number | null>(null);
  const [status, setStatus] = useState<string | number | null>(null);
  const [numberLabel, setNumberLabel] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!norm) return;
    setKind(norm.kind);
    setStatus(norm.status);
    setNumberLabel(norm.numberLabel);
    setShortTitle(norm.shortTitle);
    setSummary(norm.summary ?? '');
    setError(null);
    setOk(null);
  }, [norm]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!token || !norm) return;
    setPending(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch(
        `${apiBase()}/api/legal/norms/${encodeURIComponent(norm.code)}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kind: kind != null ? String(kind) : undefined,
            status: status != null ? String(status) : undefined,
            numberLabel: numberLabel.trim(),
            shortTitle: shortTitle.trim(),
            summary: summary.trim(),
          }),
        },
      );
      const data = (await res.json().catch(() => null)) as {
        message?: string | string[];
      } | null;
      if (!res.ok) {
        const msg = data?.message;
        setError(
          Array.isArray(msg)
            ? msg.join(', ')
            : typeof msg === 'string'
              ? msg
              : 'No se pudo guardar',
        );
        return;
      }
      setOk('Guardado');
      router.refresh();
    } catch {
      setError('Error de red');
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={norm ? `Editar · ${norm.code}` : 'Editar norma'}
    >
      {!norm ? null : (
        <form onSubmit={onSave} className="grid gap-3">
          {error ? <Alert variant="error">{error}</Alert> : null}
          {ok ? <Alert variant="success">{ok}</Alert> : null}
          <Select
            label="Tipo"
            options={KIND_OPTIONS}
            value={kind}
            onChange={setKind}
          />
          <Select
            label="Estado"
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
          />
          <TextField
            label="Número / rótulo"
            value={numberLabel}
            onChange={(e) => setNumberLabel(e.target.value)}
            required
          />
          <TextField
            label="Título corto"
            value={shortTitle}
            onChange={(e) => setShortTitle(e.target.value)}
            required
          />
          <TextField
            label="Resumen"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outlined" onClick={onClose}>
              Cerrar
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
