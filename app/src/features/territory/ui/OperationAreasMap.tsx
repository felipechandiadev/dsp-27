'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
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
import './operation-areas-map.css';
import {
  DEFAULT_MAP_ZOOM,
  PARRAL_CENTER,
  areaColor,
  defaultPolygon,
  type GeoJsonPolygon,
  type OperationAreaRow,
} from './territory-types';

export type OperationAreasMapHandle = {
  startNewArea: () => void;
  loadArea: (geometry: GeoJsonPolygon) => void;
  clearEdit: () => void;
};

type OperationAreasMapProps = {
  areas: OperationAreaRow[];
  selectedAreaId: string | null;
  onDraftGeometryChange: (geometry: GeoJsonPolygon | null) => void;
};

function geometryFromLayer(layer: L.Layer): GeoJsonPolygon | null {
  if (!(layer instanceof L.Polygon) && !(layer instanceof L.Rectangle)) {
    return null;
  }
  const geo = layer.toGeoJSON();
  if (geo.type === 'Feature' && geo.geometry.type === 'Polygon') {
    return geo.geometry as GeoJsonPolygon;
  }
  return null;
}

function geometryFromFeatureGroup(
  group: L.FeatureGroup,
): GeoJsonPolygon | null {
  const layers = group.getLayers();
  if (layers.length === 0) return null;
  return geometryFromLayer(layers[0]!);
}

function syncFeatureGroup(
  group: L.FeatureGroup,
  geometry: GeoJsonPolygon | null,
): void {
  group.clearLayers();
  if (!geometry) return;
  L.geoJSON(geometry).eachLayer((layer) => {
    group.addLayer(layer);
  });
}

function DrawControl({
  featureGroup,
  onGeometryChange,
}: {
  featureGroup: L.FeatureGroup;
  onGeometryChange: (geometry: GeoJsonPolygon | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup,
      },
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
        },
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
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
  }, [featureGroup, map, onGeometryChange]);

  return null;
}

export const OperationAreasMap = forwardRef<
  OperationAreasMapHandle,
  OperationAreasMapProps
>(function OperationAreasMap(
  { areas, selectedAreaId, onDraftGeometryChange },
  ref,
) {
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const [editFeatureGroup, setEditFeatureGroup] =
    useState<L.FeatureGroup | null>(null);

  useImperativeHandle(ref, () => ({
    startNewArea() {
      const group = featureGroupRef.current;
      if (!group) return;
      const geometry = defaultPolygon();
      syncFeatureGroup(group, geometry);
      onDraftGeometryChange(geometry);
    },
    loadArea(geometry) {
      const group = featureGroupRef.current;
      if (!group) return;
      syncFeatureGroup(group, geometry);
      onDraftGeometryChange(geometry);
    },
    clearEdit() {
      const group = featureGroupRef.current;
      if (!group) return;
      group.clearLayers();
      onDraftGeometryChange(null);
    },
  }));

  return (
    <MapContainer
      center={[PARRAL_CENTER.lat, PARRAL_CENTER.lng]}
      zoom={DEFAULT_MAP_ZOOM}
      className="operation-areas-map h-[420px] w-full rounded-lg border border-border"
      scrollWheelZoom
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {areas.map((area, index) =>
        area.geometry && area.id !== selectedAreaId ? (
          <GeoJSON
            key={area.id}
            data={area.geometry}
            style={{
              color: areaColor(area, index),
              weight: 2,
              fillOpacity: 0.15,
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
        {editFeatureGroup ? (
          <DrawControl
            featureGroup={editFeatureGroup}
            onGeometryChange={onDraftGeometryChange}
          />
        ) : null}
      </FeatureGroup>
    </MapContainer>
  );
});
