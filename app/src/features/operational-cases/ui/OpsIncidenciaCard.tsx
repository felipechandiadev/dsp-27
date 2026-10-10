'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Select,
  TextField,
} from '@felipechandiadev/ui';
import { OpsTriageExpandableCard } from './OpsTriageExpandableCard';
import type { OpsEntityKind } from './compute-ops-traceability-edges';
import type { CatalogType, IncidenciaRow } from './ops-types';
import {
  INC_STATUS_BADGE,
  INC_STATUS_LABELS,
  clampText,
  formatOpsDateTime,
} from './ops-types';

type Props = {
  incidencia: IncidenciaRow;
  incidentTypes: CatalogType[];
  focused: boolean;
  linked: boolean;
  expanded: boolean;
  canEdit: boolean;
  canVerify: boolean;
  pending: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onUpdated: (row: IncidenciaRow) => void;
  onVerify: (code: string, status: string) => void;
  registerAnchor?: (
    kind: OpsEntityKind,
    id: string,
    el: HTMLElement | null,
  ) => void;
  onLayoutChange?: () => void;
  authed: (
    path: string,
    init?: RequestInit,
  ) => Promise<{ ok: boolean; data: unknown }>;
};

export function OpsIncidenciaCard({
  incidencia,
  incidentTypes,
  focused,
  linked,
  expanded,
  canEdit,
  canVerify,
  pending,
  onSelect,
  onToggleExpand,
  onUpdated,
  onVerify,
  registerAnchor,
  onLayoutChange,
  authed,
}: Props) {
  const [title, setTitle] = useState(incidencia.title);
  const [descripcion, setDescripcion] = useState(incidencia.descripcion ?? '');
  const [typeId, setTypeId] = useState<string | number | null>(
    incidencia.incidentTypeId,
  );
  const [location, setLocation] = useState(
    incidencia.locationDescription ?? '',
  );
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(incidencia.title);
    setDescripcion(incidencia.descripcion ?? '');
    setTypeId(incidencia.incidentTypeId);
    setLocation(incidencia.locationDescription ?? '');
  }, [incidencia]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    const trimmed = title.trim();
    if (!trimmed) {
      setLocalError('El título es requerido');
      return;
    }
    setSaving(true);
    setLocalError(null);
    const { ok, data } = await authed(
      `/api/operational-cases/incidencias/${encodeURIComponent(incidencia.code)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          title: trimmed,
          descripcion: descripcion.trim() || null,
          incidentTypeId: typeId ? String(typeId) : null,
          locationDescription: location.trim() || null,
        }),
      },
    );
    setSaving(false);
    if (!ok) {
      const msg = (data as { message?: string | string[] } | null)?.message;
      setLocalError(
        Array.isArray(msg)
          ? msg.join(', ')
          : typeof msg === 'string'
            ? msg
            : 'No se pudo guardar',
      );
      return;
    }
    onUpdated(data as IncidenciaRow);
  }

  const typeOptions = incidentTypes.map((t) => ({ id: t.id, label: t.name }));

  return (
    <OpsTriageExpandableCard
      kind="inc"
      id={incidencia.id}
      code={incidencia.code}
      subtitle={formatOpsDateTime(incidencia.occurredAt)}
      headerEnd={
        <Badge variant={INC_STATUS_BADGE[incidencia.status] ?? 'secondary'}>
          {INC_STATUS_LABELS[incidencia.status] ?? incidencia.status}
        </Badge>
      }
      summary={
        <>
          <p className="ops-triage-summary">
            {clampText(incidencia.title || incidencia.descripcion, 110)}
          </p>
          <div className="ops-triage-badges">
            {incidencia.incidentType ? (
              <Badge variant="secondary-outlined">
                {incidencia.incidentType.name}
              </Badge>
            ) : null}
            {incidencia.requerimientoId ? (
              <Badge variant="info">Req vinculado</Badge>
            ) : null}
          </div>
        </>
      }
      expanded={expanded}
      focused={focused}
      linked={linked}
      onSelect={onSelect}
      onToggleExpand={onToggleExpand}
      registerAnchor={registerAnchor}
      onLayoutChange={onLayoutChange}
    >
      {localError ? <Alert variant="error">{localError}</Alert> : null}

      {canEdit ? (
        <form className="ops-triage-edit" onSubmit={save}>
          <TextField
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
          />
          <Select
            label="Tipo"
            options={typeOptions}
            value={typeId}
            onChange={(id) => setTypeId(id)}
            placeholder="Sin tipo"
          />
          <TextField
            label="Ubicación"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <div className="ops-triage-actions">
            <Button type="submit" variant="primary" disabled={saving || pending}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      ) : (
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          {incidencia.descripcion || 'Sin descripción'}
        </p>
      )}

      {canVerify && incidencia.status === 'sin_verificar' ? (
        <div className="ops-triage-actions">
          <Button
            type="button"
            variant="primary"
            disabled={pending}
            onClick={() => onVerify(incidencia.code, 'verificada')}
          >
            Verificar
          </Button>
          <Button
            type="button"
            variant="outlined"
            disabled={pending}
            onClick={() => onVerify(incidencia.code, 'descartada')}
          >
            Descartar
          </Button>
        </div>
      ) : null}
    </OpsTriageExpandableCard>
  );
}
