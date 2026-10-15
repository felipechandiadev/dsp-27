'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { TextField } from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';
import type { OperationAreaRow } from '@/features/territory/ui/territory-types';
import {
  LOCATION_MODE_LABELS,
  modeFromGeometry,
  type CaseLocationGeometry,
  type LocationDrawMode,
} from './location-geometry-types';
import './location-geometry-map.css';

const LocationGeometryMap = dynamic(
  () => import('./LocationGeometryMap').then((m) => m.LocationGeometryMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[240px] items-center justify-center rounded-lg border text-sm opacity-70"
        aria-hidden
      >
        Cargando mapa…
      </div>
    ),
  },
);

const MODE_HINT: Record<LocationDrawMode, string> = {
  point: 'Usa el marcador para ubicar el punto en el mapa.',
  line: 'Dibuja una línea con dos o más puntos.',
  area: 'Dibuja un polígono del área del evento.',
};

type LocationGeometryPickerProps = {
  value: CaseLocationGeometry | null;
  onChange: (geometry: CaseLocationGeometry | null) => void;
  description?: string;
  onDescriptionChange?: (value: string) => void;
  showDescription?: boolean;
  readOnly?: boolean;
  label?: string;
};

export function LocationGeometryPicker({
  value,
  onChange,
  description = '',
  onDescriptionChange,
  showDescription = false,
  readOnly = false,
  label = 'Ubicación en mapa',
}: LocationGeometryPickerProps) {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const [mode, setMode] = useState<LocationDrawMode>(() =>
    modeFromGeometry(value),
  );
  const [areas, setAreas] = useState<OperationAreaRow[]>([]);

  useEffect(() => {
    setMode(modeFromGeometry(value));
  }, [value]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiBase()}/api/territory/areas?status=active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => null);
        if (!cancelled && res.ok && Array.isArray(data)) {
          setAreas(data as OperationAreaRow[]);
        }
      } catch {
        // Context layer is optional
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  function selectMode(next: LocationDrawMode) {
    if (readOnly || next === mode) return;
    setMode(next);
    onChange(null);
  }

  return (
    <div className="location-geometry-picker">
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          opacity: 0.85,
        }}
      >
        {label}
      </div>
      <div className="location-geometry-picker__modes" role="group" aria-label="Tipo de ubicación">
        {(Object.keys(LOCATION_MODE_LABELS) as LocationDrawMode[]).map((m) => (
          <button
            key={m}
            type="button"
            className="location-geometry-picker__mode"
            aria-pressed={mode === m}
            disabled={readOnly}
            onClick={() => selectMode(m)}
          >
            {LOCATION_MODE_LABELS[m]}
          </button>
        ))}
      </div>
      <p className="location-geometry-picker__hint">{MODE_HINT[mode]}</p>
      <LocationGeometryMap
        mode={mode}
        value={value}
        contextAreas={areas}
        readOnly={readOnly}
        onChange={onChange}
      />
      {value ? (
        <button
          type="button"
          className="location-geometry-picker__mode"
          disabled={readOnly}
          onClick={() => onChange(null)}
        >
          Quitar ubicación
        </button>
      ) : null}
      {showDescription && onDescriptionChange ? (
        <TextField
          label="Descripción de ubicación"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={readOnly}
        />
      ) : null}
    </div>
  );
}
