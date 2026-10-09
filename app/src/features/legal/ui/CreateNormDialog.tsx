'use client';

import { FormEvent, useState } from 'react';
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
} from './legal-types';

type Props = {
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

export function CreateNormDialog({ open, onClose }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.user?.accessToken;

  const [kind, setKind] = useState<string | number | null>('law');
  const [status, setStatus] = useState<string | number | null>('in_force');
  const [numberLabel, setNumberLabel] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [code, setCode] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function reset() {
    setKind('law');
    setStatus('in_force');
    setNumberLabel('');
    setShortTitle('');
    setCode('');
    setSummary('');
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !kind) {
      setError('Sesión o tipo no disponible');
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/api/legal/norms`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kind: String(kind),
          status: status != null ? String(status) : 'in_force',
          numberLabel: numberLabel.trim(),
          shortTitle: shortTitle.trim(),
          code: code.trim() || undefined,
          summary: summary.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        code?: string;
        message?: string | string[];
      } | null;
      if (!res.ok) {
        const msg = data?.message;
        setError(
          Array.isArray(msg)
            ? msg.join(', ')
            : typeof msg === 'string'
              ? msg
              : 'No se pudo crear la norma',
        );
        return;
      }
      handleClose();
      if (data?.code) {
        router.push(`/legal/${encodeURIComponent(data.code)}`);
      } else {
        router.refresh();
      }
    } catch {
      setError('Error de red');
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Nueva norma">
      <form onSubmit={onSubmit} className="grid gap-3">
        <p className="text-sm text-[var(--color-muted-foreground)] m-0">
          Catálogo del marco normativo. El PDF se adjunta en la ficha.
        </p>
        {error ? <Alert variant="error">{error}</Alert> : null}
        <Select
          label="Tipo"
          options={KIND_OPTIONS}
          value={kind}
          onChange={setKind}
          required
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
          placeholder="Ley N.º 21.802"
        />
        <TextField
          label="Título corto"
          value={shortTitle}
          onChange={(e) => setShortTitle(e.target.value)}
          required
        />
        <TextField
          label="Código (opcional)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="LEY-21802"
        />
        <TextField
          label="Resumen"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outlined" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? 'Creando…' : 'Crear'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
