'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Alert,
  Badge,
  Button,
  Dialog,
  IconButton,
  Select,
  TextField,
} from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';
import { canWriteTerritory } from '@/shared/auth/user-roles';
import type { AreaTypeRow } from './territory-types';

type AreaTypesAdminProps = {
  initialTypes: AreaTypeRow[];
};

const STATUS_OPTIONS = [
  { id: 'active', label: 'Activo' },
  { id: 'inactive', label: 'Inactivo' },
];

export function AreaTypesAdmin({ initialTypes }: AreaTypesAdminProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const canWrite = canWriteTerritory(session?.user?.role);

  const [types, setTypes] = useState(initialTypes);
  const [createOpen, setCreateOpen] = useState(false);
  const [editType, setEditType] = useState<AreaTypeRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#1e73ae');
  const [sortOrder, setSortOrder] = useState('0');
  const [status, setStatus] = useState<string | number | null>('active');

  function resetForm() {
    setCode('');
    setName('');
    setDescription('');
    setColor('#1e73ae');
    setSortOrder('0');
    setStatus('active');
    setError(null);
  }

  function openCreate() {
    resetForm();
    setCreateOpen(true);
  }

  function openEdit(t: AreaTypeRow) {
    setEditType(t);
    setName(t.name);
    setDescription(t.description ?? '');
    setColor(t.color ?? '#1e73ae');
    setSortOrder(String(t.sortOrder));
    setStatus(t.status);
    setError(null);
  }

  async function createType(e: FormEvent) {
    e.preventDefault();
    if (!token || !canWrite) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/api/territory/area-types`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim().toLowerCase(),
          name: name.trim(),
          description: description.trim() || undefined,
          color: color.trim() || undefined,
          sortOrder: Number(sortOrder) || 0,
          status: status ? String(status) : 'active',
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | AreaTypeRow
        | { message?: string | string[] }
        | null;
      if (!res.ok) {
        const msg = (data as { message?: string | string[] } | null)?.message;
        setError(
          Array.isArray(msg)
            ? msg.join(', ')
            : typeof msg === 'string'
              ? msg
              : 'No se pudo crear el tipo',
        );
        return;
      }
      const created = data as AreaTypeRow;
      setTypes((prev) =>
        [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder),
      );
      setCreateOpen(false);
      resetForm();
      router.refresh();
    } catch {
      setError('Error de red');
    } finally {
      setPending(false);
    }
  }

  async function updateType(e: FormEvent) {
    e.preventDefault();
    if (!token || !canWrite || !editType) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiBase()}/api/territory/area-types/${editType.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || null,
            color: color.trim() || null,
            sortOrder: Number(sortOrder) || 0,
            status: status ? String(status) : 'active',
          }),
        },
      );
      const data = (await res.json().catch(() => null)) as
        | AreaTypeRow
        | { message?: string | string[] }
        | null;
      if (!res.ok) {
        const msg = (data as { message?: string | string[] } | null)?.message;
        setError(
          Array.isArray(msg)
            ? msg.join(', ')
            : typeof msg === 'string'
              ? msg
              : 'No se pudo actualizar el tipo',
        );
        return;
      }
      const updated = data as AreaTypeRow;
      setTypes((prev) =>
        prev
          .map((t) => (t.id === updated.id ? updated : t))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );
      setEditType(null);
      router.refresh();
    } catch {
      setError('Error de red');
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <p style={{ margin: 0, opacity: 0.85 }}>
          Catálogo administrable de tipos (territorio, sector, barrio, …).
        </p>
        {canWrite ? (
          <IconButton
            icon="Plus"
            variant="action"
            size="md"
            ariaLabel="Nuevo tipo de área de operación"
            onClick={openCreate}
          />
        ) : null}
      </div>

      {!canWrite ? (
        <Alert variant="info">
          Solo dirección, prevención o administrativo pueden modificar tipos.
        </Alert>
      ) : null}

      {types.length === 0 ? (
        <Alert variant="info">No hay tipos definidos.</Alert>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gap: '0.5rem',
          }}
        >
          {types.map((t) => (
            <li
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 0.85rem',
                border: '1px solid var(--color-border, #e5e5e5)',
                borderRadius: '0.5rem',
                background: 'var(--color-surface, #fff)',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: '1rem',
                  height: '1rem',
                  borderRadius: '0.2rem',
                  background: t.color || '#94a3b8',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>
                  {t.name}{' '}
                  <span style={{ fontWeight: 400, opacity: 0.7 }}>
                    ({t.code})
                  </span>
                </div>
                {t.description ? (
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                    {t.description}
                  </div>
                ) : null}
              </div>
              <Badge
                variant={t.status === 'active' ? 'success' : 'secondary'}
              >
                {t.status === 'active' ? 'Activo' : 'Inactivo'}
              </Badge>
              {canWrite ? (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => openEdit(t)}
                >
                  Editar
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          resetForm();
        }}
        title="Nuevo tipo de área"
      >
        <form onSubmit={createType} className="grid gap-3">
          {error ? <Alert variant="error">{error}</Alert> : null}
          <TextField
            label="Código (slug)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="sector"
          />
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
            label="Color (hex)"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <TextField
            label="Orden"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
          <Select
            label="Estado"
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
          />
          <div className="flex justify-end gap-2 pt-1">
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
        open={Boolean(editType)}
        onClose={() => setEditType(null)}
        title="Editar tipo de área"
      >
        <form onSubmit={updateType} className="grid gap-3">
          {error ? <Alert variant="error">{error}</Alert> : null}
          {editType ? (
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              Código: <strong>{editType.code}</strong>
            </p>
          ) : null}
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
            label="Color (hex)"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <TextField
            label="Orden"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
          <Select
            label="Estado"
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
          />
          <div className="flex justify-end gap-2 pt-1">
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
