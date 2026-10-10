'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Alert, IconButton } from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';
import { canWriteTerritory } from '@/shared/auth/user-roles';
import {
  AreaEditorPanel,
  type AreaEditorDraft,
} from './AreaEditorPanel';
import type { OperationAreasMapHandle } from './OperationAreasMap';
import type {
  AreaTypeRow,
  GeoJsonPolygon,
  OperationAreaRow,
} from './territory-types';

const OperationAreasMap = dynamic(
  () =>
    import('./OperationAreasMap').then((mod) => mod.OperationAreasMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[420px] items-center justify-center rounded-lg border text-sm opacity-70"
        aria-hidden
      >
        Cargando mapa…
      </div>
    ),
  },
);

const EMPTY_DRAFT: AreaEditorDraft = {
  name: '',
  typeId: '',
  parentId: '',
  notes: '',
  status: 'active',
};

type AreasWorkspaceProps = {
  initialAreas: OperationAreaRow[];
  initialTypes: AreaTypeRow[];
};

export function AreasWorkspace({
  initialAreas,
  initialTypes,
}: AreasWorkspaceProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const canWrite = canWriteTerritory(session?.user?.role);
  const mapRef = useRef<OperationAreasMapHandle>(null);

  const [areas, setAreas] = useState(initialAreas);
  const [types] = useState(initialTypes);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<AreaEditorDraft>(EMPTY_DRAFT);
  const [draftGeometry, setDraftGeometry] = useState<GeoJsonPolygon | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedArea =
    areas.find((a) => a.code === selectedCode) ?? null;

  function resetEditor() {
    setSelectedCode(null);
    setIsNew(false);
    setEditorOpen(false);
    setDraft(EMPTY_DRAFT);
    setDraftGeometry(null);
    setError(null);
    mapRef.current?.clearEdit();
  }

  function startNew() {
    const defaultType =
      types.find((t) => t.code === 'sector' && t.status === 'active') ??
      types.find((t) => t.status === 'active');
    setSelectedCode(null);
    setIsNew(true);
    setEditorOpen(true);
    setDraft({
      ...EMPTY_DRAFT,
      typeId: defaultType?.id ?? '',
    });
    setError(null);
    mapRef.current?.startNewArea();
  }

  function selectArea(area: OperationAreaRow) {
    setSelectedCode(area.code);
    setIsNew(false);
    setEditorOpen(true);
    setDraft({
      name: area.name,
      typeId: area.typeId,
      parentId: area.parentId ?? '',
      notes: area.notes ?? '',
      status: area.status,
    });
    setError(null);
    if (area.geometry) {
      setDraftGeometry(area.geometry);
      mapRef.current?.loadArea(area.geometry);
    } else {
      setDraftGeometry(null);
      mapRef.current?.clearEdit();
    }
  }

  async function save() {
    if (!token || !canWrite) return;
    if (!draft.name.trim() || !draft.typeId || !draftGeometry) {
      setError('Nombre, tipo y polígono son requeridos');
      return;
    }
    setSaving(true);
    setError(null);
    const body = {
      name: draft.name.trim(),
      typeId: draft.typeId,
      parentId: draft.parentId || undefined,
      geometry: draftGeometry,
      notes: draft.notes.trim() || undefined,
      status: draft.status,
    };
    try {
      const url = isNew
        ? `${apiBase()}/api/territory/areas`
        : `${apiBase()}/api/territory/areas/${encodeURIComponent(selectedCode!)}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          isNew
            ? body
            : {
                ...body,
                parentId: draft.parentId ? draft.parentId : null,
              },
        ),
      });
      const data = (await res.json().catch(() => null)) as
        | OperationAreaRow
        | { message?: string | string[] }
        | null;
      if (!res.ok) {
        const msg = (data as { message?: string | string[] } | null)?.message;
        setError(
          Array.isArray(msg)
            ? msg.join(', ')
            : typeof msg === 'string'
              ? msg
              : 'No se pudo guardar el área',
        );
        return;
      }
      const saved = data as OperationAreaRow;
      setAreas((prev) => {
        const without = prev.filter((a) => a.code !== saved.code);
        return [...without, saved].sort((a, b) =>
          a.name.localeCompare(b.name, 'es'),
        );
      });
      resetEditor();
      router.refresh();
    } catch {
      setError('Error de red');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'minmax(220px, 280px) 1fr',
      }}
      className="areas-workspace"
    >
      <aside style={{ display: 'grid', gap: '0.75rem', alignContent: 'start' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <strong style={{ fontSize: '0.95rem' }}>Áreas</strong>
          {canWrite ? (
            <IconButton
              icon="Plus"
              variant="action"
              size="md"
              ariaLabel="Nueva área de operación"
              onClick={startNew}
            />
          ) : null}
        </div>
        {areas.length === 0 ? (
          <Alert variant="info">No hay áreas registradas.</Alert>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'grid',
              gap: '0.35rem',
            }}
          >
            {areas.map((area) => {
              const active = area.code === selectedCode;
              return (
                <li key={area.id}>
                  <button
                    type="button"
                    onClick={() => selectArea(area)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.55rem 0.65rem',
                      borderRadius: '0.4rem',
                      border: active
                        ? '1px solid var(--color-primary, #1e73ae)'
                        : '1px solid var(--color-border, #e5e5e5)',
                      background: active
                        ? 'color-mix(in srgb, var(--color-primary, #1e73ae) 12%, transparent)'
                        : 'var(--color-surface, #fff)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {area.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        opacity: 0.75,
                        marginTop: '0.15rem',
                      }}
                    >
                      {area.code}
                      {area.type ? ` · ${area.type.name}` : ''}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <div style={{ display: 'grid', gap: '0.75rem', minWidth: 0 }}>
        <OperationAreasMap
          ref={mapRef}
          areas={areas}
          selectedAreaId={selectedArea?.id ?? null}
          onDraftGeometryChange={setDraftGeometry}
        />
        {editorOpen ? (
          <AreaEditorPanel
            draft={draft}
            types={types}
            areas={areas.filter((a) => a.code !== selectedCode)}
            isNew={isNew}
            hasGeometry={Boolean(draftGeometry)}
            canWrite={canWrite}
            saving={saving}
            error={error}
            onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            onSave={save}
            onCancel={resetEditor}
          />
        ) : (
          <Alert variant="info">
            Selecciona un área de la lista o crea una nueva para dibujar el
            polígono en el mapa.
          </Alert>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .areas-workspace {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
