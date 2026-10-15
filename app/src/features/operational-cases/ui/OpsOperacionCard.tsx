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
import type { CaseLocationGeometry, FieldOperationRow } from './ops-types';
import {
  OP_STATUS_BADGE,
  OP_STATUS_LABELS,
  PRIORITY_OPTIONS,
  clampText,
  formatOpsDateTime,
  priorityLabel,
} from './ops-types';

type Props = {
  operation: FieldOperationRow;
  focused: boolean;
  linked: boolean;
  expanded: boolean;
  canEdit: boolean;
  pending: boolean;
  nextStatuses: string[];
  onSelect: () => void;
  onToggleExpand: () => void;
  onUpdated: (row: FieldOperationRow) => void;
  onPatchStatus: (code: string, status: string) => void;
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

export function OpsOperacionCard({
  operation,
  focused,
  linked,
  expanded,
  canEdit,
  pending,
  nextStatuses,
  onSelect,
  onToggleExpand,
  onUpdated,
  onPatchStatus,
  registerAnchor,
  onLayoutChange,
  authed,
}: Props) {
  const [briefing, setBriefing] = useState(operation.briefing ?? '');
  const [prioridad, setPrioridad] = useState<string | number | null>(
    operation.prioridad,
  );
  const [locationGeometry, setLocationGeometry] =
    useState<CaseLocationGeometry | null>(
      operation.locationGeometry ?? null,
    );
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setBriefing(operation.briefing ?? '');
    setPrioridad(operation.prioridad);
    setLocationGeometry(operation.locationGeometry ?? null);
  }, [operation]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    setLocalError(null);
    const { ok, data } = await authed(
      `/api/operational-cases/operations/${encodeURIComponent(operation.code)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          briefing: briefing.trim() || null,
          prioridad: prioridad ? String(prioridad) : 'P2',
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
    onUpdated(data as FieldOperationRow);
  }

  return (
    <OpsTriageExpandableCard
      kind="op"
      id={operation.id}
      code={operation.code}
      subtitle={formatOpsDateTime(operation.createdAt)}
      headerEnd={
        <Badge
          variant="secondary-outlined"
          className={`ops-triage-priority ops-triage-priority--${operation.prioridad}`}
        >
          {priorityLabel(operation.prioridad)}
        </Badge>
      }
      summary={
        <>
          <p className="ops-triage-summary">
            {operation.operationType?.name ?? operation.triggerType}
          </p>
          {operation.briefing ? (
            <p
              className="ops-triage-summary"
              style={{
                marginTop: '0.2rem',
                fontWeight: 400,
                opacity: 0.85,
                WebkitLineClamp: 1,
              }}
            >
              {clampText(operation.briefing, 80)}
            </p>
          ) : null}
          <div className="ops-triage-badges">
            <Badge variant={OP_STATUS_BADGE[operation.status] ?? 'secondary'}>
              {OP_STATUS_LABELS[operation.status] ?? operation.status}
            </Badge>
            <Badge variant="secondary-outlined">{operation.triggerType}</Badge>
            {operation.locationGeometry ? (
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

      {canEdit ? (
        <form className="ops-triage-edit" onSubmit={save}>
          <TextField
            label="Briefing"
            value={briefing}
            onChange={(e) => setBriefing(e.target.value)}
            rows={3}
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
            {operation.briefing || 'Sin briefing'}
          </p>
          {operation.locationGeometry ? (
            <LocationGeometryPicker
              value={operation.locationGeometry}
              onChange={() => undefined}
              readOnly
            />
          ) : null}
        </>
      )}

      {canEdit && nextStatuses.length ? (
        <div className="ops-triage-actions">
          {nextStatuses.map((s) => (
            <Button
              key={s}
              type="button"
              variant="outlined"
              disabled={pending}
              onClick={() => onPatchStatus(operation.code, s)}
            >
              {OP_STATUS_LABELS[s] ?? s}
            </Button>
          ))}
        </div>
      ) : null}
    </OpsTriageExpandableCard>
  );
}
