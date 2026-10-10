'use client';

import { Alert, Button, Select, TextField } from '@felipechandiadev/ui';
import type { AreaTypeRow, OperationAreaRow } from './territory-types';

export type AreaEditorDraft = {
  name: string;
  typeId: string;
  parentId: string;
  notes: string;
  status: string;
};

type AreaEditorPanelProps = {
  draft: AreaEditorDraft;
  types: AreaTypeRow[];
  areas: OperationAreaRow[];
  isNew: boolean;
  hasGeometry: boolean;
  canWrite: boolean;
  saving: boolean;
  error: string | null;
  onChange: (patch: Partial<AreaEditorDraft>) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function AreaEditorPanel({
  draft,
  types,
  areas,
  isNew,
  hasGeometry,
  canWrite,
  saving,
  error,
  onChange,
  onSave,
  onCancel,
}: AreaEditorPanelProps) {
  const activeTypes = types.filter((t) => t.status === 'active');
  const parentOptions = areas.filter((a) => a.status === 'active');
  const typeOptions = activeTypes.map((t) => ({ id: t.id, label: t.name }));
  const parentSelectOptions = parentOptions.map((a) => ({
    id: a.id,
    label: `${a.name} (${a.code})`,
  }));
  const statusOptions = [
    { id: 'active', label: 'Activa' },
    { id: 'inactive', label: 'Inactiva' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gap: '0.75rem',
        padding: '1rem',
        border: '1px solid var(--color-border, #e5e5e5)',
        borderRadius: '0.5rem',
        background: 'var(--color-surface, #fff)',
      }}
    >
      <h3 style={{ margin: 0, fontSize: '1.05rem' }}>
        {isNew ? 'Nueva área' : 'Editar área'}
      </h3>

      {!canWrite ? (
        <Alert variant="info">
          Solo dirección, prevención o administrativo pueden guardar cambios.
        </Alert>
      ) : null}

      {error ? <Alert variant="error">{error}</Alert> : null}

      <TextField
        label="Nombre"
        value={draft.name}
        onChange={(e) => onChange({ name: e.target.value })}
        disabled={!canWrite || saving}
        required
      />

      <Select
        label="Tipo"
        options={typeOptions}
        value={draft.typeId || null}
        onChange={(id) => onChange({ typeId: id == null ? '' : String(id) })}
        disabled={!canWrite || saving}
        required
        placeholder="Seleccionar…"
      />

      <Select
        label="Área padre (opcional)"
        options={parentSelectOptions}
        value={draft.parentId || null}
        onChange={(id) => onChange({ parentId: id == null ? '' : String(id) })}
        disabled={!canWrite || saving}
        allowClear
        placeholder="Sin padre"
      />

      <Select
        label="Estado"
        options={statusOptions}
        value={draft.status}
        onChange={(id) =>
          onChange({ status: id == null ? 'active' : String(id) })
        }
        disabled={!canWrite || saving}
      />

      <TextField
        label="Notas"
        value={draft.notes}
        onChange={(e) => onChange({ notes: e.target.value })}
        disabled={!canWrite || saving}
        rows={3}
      />

      {!hasGeometry ? (
        <Alert variant="warning">
          Dibuja o ajusta el polígono en el mapa antes de guardar.
        </Alert>
      ) : null}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {canWrite ? (
          <Button
            type="button"
            variant="primary"
            onClick={onSave}
            disabled={
              saving || !draft.name.trim() || !draft.typeId || !hasGeometry
            }
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outlined"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
