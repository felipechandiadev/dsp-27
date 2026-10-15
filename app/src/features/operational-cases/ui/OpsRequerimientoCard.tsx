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
import { LocationGeometryPicker } from './LocationGeometryPicker';
import type { OpsEntityKind } from './compute-ops-traceability-edges';
import type { CaseLocationGeometry, RequerimientoRow } from './ops-types';
import {
  PRIORITY_OPTIONS,
  REQ_STATUS_BADGE,
  REQ_STATUS_LABELS,
  clampText,
  formatOpsDateTime,
  priorityLabel,
} from './ops-types';

type Props = {
  requerimiento: RequerimientoRow;
  focused: boolean;
  linked: boolean;
  expanded: boolean;
  canEdit: boolean;
  canClose: boolean;
  pending: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onUpdated: (row: RequerimientoRow) => void;
  onEnGestion: (code: string) => void;
  onClose: (code: string) => void;
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

export function OpsRequerimientoCard({
  requerimiento,
  focused,
  linked,
  expanded,
  canEdit,
  canClose,
  pending,
  onSelect,
  onToggleExpand,
  onUpdated,
  onEnGestion,
  onClose,
  registerAnchor,
  onLayoutChange,
  authed,
}: Props) {
  const closed = !!requerimiento.closedAt;
  const [descripcion, setDescripcion] = useState(requerimiento.descripcion);
  const [prioridad, setPrioridad] = useState<string | number | null>(
    requerimiento.prioridad,
  );
  const [location, setLocation] = useState(
    requerimiento.locationDescription ?? '',
  );
  const [locationGeometry, setLocationGeometry] =
    useState<CaseLocationGeometry | null>(
      requerimiento.locationGeometry ?? null,
    );
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setDescripcion(requerimiento.descripcion);
    setPrioridad(requerimiento.prioridad);
    setLocation(requerimiento.locationDescription ?? '');
    setLocationGeometry(requerimiento.locationGeometry ?? null);
  }, [requerimiento]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!canEdit || closed) return;
    const trimmed = descripcion.trim();
    if (!trimmed) {
      setLocalError('La descripción es requerida');
      return;
    }
    setSaving(true);
    setLocalError(null);
    const { ok, data } = await authed(
      `/api/operational-cases/requerimientos/${encodeURIComponent(requerimiento.code)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          descripcion: trimmed,
          prioridad: prioridad ? String(prioridad) : 'P2',
          locationDescription: location.trim() || null,
          locationGeometry,
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
    onUpdated(data as RequerimientoRow);
  }

  return (
    <OpsTriageExpandableCard
      kind="req"
      id={requerimiento.id}
      code={requerimiento.code}
      subtitle={formatOpsDateTime(
        requerimiento.occurredAt || requerimiento.createdAt,
      )}
      headerEnd={
        <Badge
          variant="secondary-outlined"
          className={`ops-triage-priority ops-triage-priority--${requerimiento.prioridad}`}
        >
          {priorityLabel(requerimiento.prioridad)}
        </Badge>
      }
      summary={
        <>
          <p className="ops-triage-summary">
            {clampText(requerimiento.descripcion, 110)}
          </p>
          <div className="ops-triage-badges">
            <Badge
              variant={REQ_STATUS_BADGE[requerimiento.status] ?? 'secondary'}
            >
              {REQ_STATUS_LABELS[requerimiento.status] ?? requerimiento.status}
            </Badge>
            {requerimiento.incidenciaId ? (
              <Badge variant="info">Inc vinculada</Badge>
            ) : null}
            {requerimiento.locationGeometry ? (
              <Badge variant="secondary-outlined">Ubicación</Badge>
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

      {canEdit && !closed ? (
        <form className="ops-triage-edit" onSubmit={save}>
          <TextField
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            required
          />
          <Select
            label="Prioridad"
            options={[...PRIORITY_OPTIONS]}
            value={prioridad}
            onChange={(id) => setPrioridad(id)}
          />
          <LocationGeometryPicker
            value={locationGeometry}
            onChange={setLocationGeometry}
            description={location}
            onDescriptionChange={setLocation}
            showDescription
          />
          <div className="ops-triage-actions">
            <Button type="submit" variant="primary" disabled={saving || pending}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      ) : (
        <>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            {requerimiento.descripcion}
          </p>
          {requerimiento.locationGeometry || requerimiento.locationDescription ? (
            <LocationGeometryPicker
              value={requerimiento.locationGeometry ?? null}
              onChange={() => undefined}
              description={requerimiento.locationDescription ?? ''}
              showDescription={!!requerimiento.locationDescription}
              onDescriptionChange={() => undefined}
              readOnly
            />
          ) : null}
        </>
      )}

      {canClose && !closed ? (
        <div className="ops-triage-actions">
          {requerimiento.status === 'ingresado' ? (
            <Button
              type="button"
              variant="primary"
              disabled={pending}
              onClick={() => onEnGestion(requerimiento.code)}
            >
              En gestión
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outlined"
            onClick={() => onClose(requerimiento.code)}
          >
            Cerrar
          </Button>
        </div>
      ) : null}
    </OpsTriageExpandableCard>
  );
}
