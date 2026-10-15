'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  IconButton,
  Select,
  TextField,
} from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';
import { canWriteDocumentTypes } from '@/shared/auth/user-roles';
import type { DocumentTypeRow } from './document-types';

type Props = {
  initialTypes: DocumentTypeRow[];
};

const STATUS_OPTIONS = [
  { id: 'active', label: 'Activo' },
  { id: 'inactive', label: 'Inactivo' },
];

function apiError(data: unknown, fallback: string): string {
  const msg = (data as { message?: string | string[] } | null)?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return fallback;
}

export function DocumentTypesAdmin({ initialTypes }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const canWrite = canWriteDocumentTypes(session?.user?.role);

  const [types, setTypes] = useState(initialTypes);
  const [createOpen, setCreateOpen] = useState(false);
  const [editType, setEditType] = useState<DocumentTypeRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [status, setStatus] = useState<string | number | null>('active');

  function resetForm() {
    setName('');
    setDescription('');
    setSortOrder('0');
    setStatus('active');
    setDialogError(null);
  }

  function openCreate() {
    resetForm();
    setCreateOpen(true);
  }

  function openEdit(t: DocumentTypeRow) {
    setEditType(t);
    setName(t.name);
    setDescription(t.description ?? '');
    setSortOrder(String(t.sortOrder));
    setStatus(t.status);
    setDialogError(null);
  }

  async function createType(e: FormEvent) {
    e.preventDefault();
    if (!token || !canWrite) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setDialogError('El nombre es requerido');
      return;
    }
    setPending(true);
    setDialogError(null);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/api/document-types`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmed,
          description: description.trim() || undefined,
          sortOrder: Number(sortOrder) || 0,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setDialogError(apiError(data, 'No se pudo crear el tipo'));
        return;
      }
      const created = data as DocumentTypeRow;
      setTypes((prev) =>
        [...prev, created].sort(
          (a, b) =>
            a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es'),
        ),
      );
      setCreateOpen(false);
      resetForm();
      router.refresh();
    } catch {
      setDialogError('Error de red');
    } finally {
      setPending(false);
    }
  }

  async function updateType(e: FormEvent) {
    e.preventDefault();
    if (!token || !canWrite || !editType) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setDialogError('El nombre es requerido');
      return;
    }
    setPending(true);
    setDialogError(null);
    setError(null);
    try {
      const res = await fetch(
        `${apiBase()}/api/document-types/${encodeURIComponent(editType.code)}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: trimmed,
            description: description.trim() || null,
            sortOrder: Number(sortOrder) || 0,
            status: status ? String(status) : 'active',
          }),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setDialogError(apiError(data, 'No se pudo actualizar el tipo'));
        return;
      }
      const updated = data as DocumentTypeRow;
      setTypes((prev) =>
        prev
          .map((t) => (t.code === updated.code ? updated : t))
          .sort(
            (a, b) =>
              a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es'),
          ),
      );
      setEditType(null);
      router.refresh();
    } catch {
      setDialogError('Error de red');
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '0.35rem',
          flexWrap: 'wrap',
        }}
      >
        {canWrite ? (
          <IconButton
            icon="Plus"
            variant="action"
            size="md"
            ariaLabel="Nuevo tipo de documento"
            onClick={openCreate}
          />
        ) : null}
        <p style={{ margin: 0, opacity: 0.85 }}>
          Catálogo de tipos usados en contratos, normas y otras secciones.
        </p>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {!canWrite ? (
        <Alert variant="info">
          Solo dirección, prevención o administrativo pueden modificar tipos.
        </Alert>
      ) : null}

      {types.length === 0 ? (
        <Alert variant="info">No hay tipos definidos.</Alert>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
          }}
        >
          {types.map((t) => (
            <Card
              key={t.id}
              title={t.code}
              headerEnd={
                <Badge
                  variant={t.status === 'active' ? 'success' : 'secondary'}
                >
                  {t.status === 'active' ? 'Activo' : 'Inactivo'}
                </Badge>
              }
              content={
                <div style={{ display: 'grid', gap: '0.35rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {t.name}
                  </div>
                  {t.description ? (
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        opacity: 0.8,
                      }}
                    >
                      {t.description}
                    </p>
                  ) : null}
                  {canWrite ? (
                    <div style={{ marginTop: '0.25rem' }}>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => openEdit(t)}
                      >
                        Editar
                      </Button>
                    </div>
                  ) : null}
                </div>
              }
            />
          ))}
        </div>
      )}

      <Dialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          resetForm();
        }}
        title="Nuevo tipo de documento"
        size="xs"
      >
        <form onSubmit={createType} className="grid gap-3">
          {dialogError ? <Alert variant="error">{dialogError}</Alert> : null}
          <TextField
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <TextField
            label="Orden"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            type="number"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setCreateOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? 'Creando…' : 'Crear'}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={!!editType}
        onClose={() => setEditType(null)}
        title={editType ? `Editar ${editType.code}` : 'Editar tipo'}
        size="xs"
      >
        <form onSubmit={updateType} className="grid gap-3">
          {dialogError ? <Alert variant="error">{dialogError}</Alert> : null}
          <TextField
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <TextField
            label="Orden"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            type="number"
          />
          <Select
            label="Estado"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(id) => setStatus(id)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={() => setEditType(null)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
