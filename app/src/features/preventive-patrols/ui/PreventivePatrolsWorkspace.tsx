'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Alert, Badge, Button, Card, IconButton } from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';
import { PreventivePatrolForm } from './PreventivePatrolForm';
import type { PreventivePatrolRow } from './ppv-form-types';
import { formatOpsDateTime } from '@/features/operational-cases/ui/ops-types';

type Props = {
  initialRows: PreventivePatrolRow[];
};

export function PreventivePatrolsWorkspace({ initialRows }: Props) {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const [rows, setRows] = useState(initialRows);
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [savedCode, setSavedCode] = useState<string | null>(null);

  async function reload() {
    if (!token) return;
    const res = await fetch(`${apiBase()}/api/preventive-patrols`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => null);
    if (res.ok && Array.isArray(data)) setRows(data as PreventivePatrolRow[]);
  }

  if (mode === 'create') {
    return (
      <PreventivePatrolForm
        onCancel={() => setMode('list')}
        onSaved={(code) => {
          setSavedCode(code);
          setMode('list');
          void reload();
        }}
      />
    );
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          flexWrap: 'wrap',
        }}
      >
        <IconButton
          icon="Plus"
          variant="action"
          size="md"
          ariaLabel="Nueva ficha de patrullaje"
          onClick={() => {
            setSavedCode(null);
            setMode('create');
          }}
        />
        <p style={{ margin: 0, opacity: 0.85 }}>
          Fichas PPV-01 de patrullaje preventivo vecinal.
        </p>
      </div>

      {savedCode ? (
        <Alert variant="success">Ficha {savedCode} guardada.</Alert>
      ) : null}

      {rows.length === 0 ? (
        <Alert variant="info">
          Aún no hay rondas registradas.{' '}
          <Button type="button" variant="text" onClick={() => setMode('create')}>
            Crear la primera
          </Button>
        </Alert>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
          }}
        >
          {rows.map((r) => {
            const sector =
              r.payload?.datos_generales_recorrido?.sector_poblacion_villa ??
              'Sin sector';
            const fecha = r.payload?.datos_generales_recorrido?.fecha;
            return (
              <Card
                key={r.id}
                title={r.code}
                headerEnd={
                  <Badge variant="info">{r.status}</Badge>
                }
                content={
                  <div style={{ display: 'grid', gap: '0.25rem' }}>
                    <div style={{ fontWeight: 600 }}>{String(sector)}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                      {fecha
                        ? String(fecha)
                        : formatOpsDateTime(r.createdAt)}
                    </div>
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
