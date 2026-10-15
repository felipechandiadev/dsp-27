'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import {
  FeatureGroup,
  GeoJSON,
  MapContainer,
  TileLayer,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './location-geometry-map.css';
import {
  DEFAULT_MAP_ZOOM,
  PARRAL_CENTER,
  areaColor,
  type OperationAreaRow,
} from '@/features/territory/ui/territory-types';
import type {
  CaseLocationGeometry,
  LocationDrawMode,
} from './location-geometry-types';

// Leaflet default marker icons break under bundlers without this.
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type LocationGeometryMapProps = {
  mode: LocationDrawMode;
  value: CaseLocationGeometry | null;
  contextAreas: OperationAreaRow[];
  readOnly?: boolean;
  onChange: (geometry: CaseLocationGeometry | null) => void;
};

function geometryFromLayer(layer: L.Layer): CaseLocationGeometry | null {
  if (layer instanceof L.Marker) {
    const ll = layer.getLatLng();
    return { type: 'Point', coordinates: [ll.lng, ll.lat] };
  }
  if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
    const geo = layer.toGeoJSON();
    if (geo.type === 'Feature' && geo.geometry.type === 'LineString') {
      return geo.geometry as CaseLocationGeometry;
    }
  }
  if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
    const geo = layer.toGeoJSON();
    if (geo.type === 'Feature' && geo.geometry.type === 'Polygon') {
      return geo.geometry as CaseLocationGeometry;
    }
  }
  return null;
}

function geometryFromFeatureGroup(
  group: L.FeatureGroup,
): CaseLocationGeometry | null {
  const layers = group.getLayers();
  if (layers.length === 0) return null;
  return geometryFromLayer(layers[0]!);
}

function syncFeatureGroup(
  group: L.FeatureGroup,
  geometry: CaseLocationGeometry | null,
): void {
  group.clearLayers();
  if (!geometry) return;
  if (geometry.type === 'Point') {
    const [lng, lat] = geometry.coordinates;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      group.addLayer(L.marker([lat as number, lng as number]));
    }
    return;
  }
  L.geoJSON(geometry).eachLayer((layer) => {
    group.addLayer(layer);
  });
}

function FitToGeometry({
  geometry,
}: {
  geometry: CaseLocationGeometry | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!geometry) {
      map.setView([PARRAL_CENTER.lat, PARRAL_CENTER.lng], DEFAULT_MAP_ZOOM);
      return;
    }
    if (geometry.type === 'Point') {
      const [lng, lat] = geometry.coordinates;
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        map.setView([lat as number, lng as number], Math.max(map.getZoom(), 15));
      }
      return;
    }
    const layer = L.geoJSON(geometry);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.2));
    }
  }, [geometry, map]);
  return null;
}

function DrawControl({
  mode,
  featureGroup,
  onGeometryChange,
}: {
  mode: LocationDrawMode;
  featureGroup: L.FeatureGroup;
  onGeometryChange: (geometry: CaseLocationGeometry | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup,
      },
      draw: {
        polygon: mode === 'area' ? { allowIntersection: false, showArea: true } : false,
        polyline: mode === 'line' ? {} : false,
        marker: mode === 'point' ? {} : false,
        rectangle: false,
        circle: false,
        circlemarker: false,
      },
    });

    map.addControl(drawControl);

    const handleCreated = (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Created;
      featureGroup.clearLayers();
      featureGroup.addLayer(event.layer);
      onGeometryChange(geometryFromLayer(event.layer));
    };

    const handleEdited = () => {
      onGeometryChange(geometryFromFeatureGroup(featureGroup));
    };

    const handleDeleted = () => {
      onGeometryChange(null);
    };

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.EDITED, handleEdited);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.removeControl(drawControl);
    };
  }, [featureGroup, map, mode, onGeometryChange]);

  return null;
}

export function LocationGeometryMap({
  mode,
  value,
  contextAreas,
  readOnly = false,
  onChange,
}: LocationGeometryMapProps) {
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const [editFeatureGroup, setEditFeatureGroup] =
    useState<L.FeatureGroup | null>(null);
  const lastSynced = useRef<string>('');

  useEffect(() => {
    const group = featureGroupRef.current;
    if (!group) return;
    const key = `${mode}:${value ? JSON.stringify(value) : 'null'}`;
    if (key === lastSynced.current) return;
    lastSynced.current = key;
    syncFeatureGroup(group, value);
  }, [mode, value, editFeatureGroup]);

  return (
    <MapContainer
      center={[PARRAL_CENTER.lat, PARRAL_CENTER.lng]}
      zoom={DEFAULT_MAP_ZOOM}
      className="location-geometry-map h-[240px] w-full rounded-lg border border-border"
      scrollWheelZoom
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitToGeometry geometry={value} />
      {contextAreas.map((area, index) =>
        area.geometry ? (
          <GeoJSON
            key={area.id}
            data={area.geometry}
            style={{
              color: areaColor(area, index),
              weight: 1,
              fillOpacity: 0.08,
              opacity: 0.55,
            }}
          />
        ) : null,
      )}
      <FeatureGroup
        ref={(layer) => {
          featureGroupRef.current = layer;
          setEditFeatureGroup(layer);
        }}
      >
        {editFeatureGroup && !readOnly ? (
          <DrawControl
            key={mode}
            mode={mode}
            featureGroup={editFeatureGroup}
            onGeometryChange={onChange}
          />
        ) : null}
      </FeatureGroup>
    </MapContainer>
  );
}
