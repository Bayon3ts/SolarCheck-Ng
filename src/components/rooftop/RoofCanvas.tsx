'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Marker, useMap, useMapEvents } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import area from '@turf/area';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// ── Leaflet default icon patch (Webpack strips _getIconUrl) ───────────────────
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

// ── Draggable center-pin icon ─────────────────────────────────────────────────
const pinIcon = typeof window !== 'undefined'
  ? new L.DivIcon({
      className: '',
      html: `<div style="
        width:32px;height:32px;
        background:#10b981;border:3px solid #fff;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
        cursor:grab;
      "></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    })
  : new L.Icon.Default();

// ── MapResizer: force Leaflet to re-read container dimensions after mount ──────
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

// ── MapFlyTo: smoothly animate camera to new coordinates when address changes ─
// MapContainer's `center` prop is read-once at mount. To move the map when the
// user selects a new address we call map.flyTo() from a child that has access
// to the live map instance.
function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (!lat || !lng) return;
    map.flyTo([lat, lng], 19, { animate: true, duration: 1.2 });
    // Re-invalidate after the flyTo animation settles (~1.4 s)
    const t = setTimeout(() => map.invalidateSize(), 1400);
    return () => clearTimeout(t);
  }, [lat, lng, map]);
  return null;
}

// ── MapClickSync: keep center-pin in sync when user pans/clicks the map ───────
function MapClickSync({ onCenter }: { onCenter: (lat: number, lng: number) => void }) {
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter();
      onCenter(c.lat, c.lng);
    },
  });
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────

interface RoofCanvasProps {
  lat: number;
  lng: number;
  onRoofDrawn: (result: { areaSqm: number; estimatedPanels: number; geoJson: any }) => void;
}

export default function RoofCanvas({ lat, lng, onRoofDrawn }: RoofCanvasProps) {
  const [mapReady, setMapReady] = useState(false);
  // Center pin follows the map center and can be dragged to refine location.
  const [pinPos, setPinPos] = useState<[number, number]>([lat, lng]);
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  // Sync pin when parent sends a new address
  useEffect(() => { setPinPos([lat, lng]); }, [lat, lng]);

  // Only render Leaflet on the client (avoids SSR hydration crash)
  useEffect(() => { setMapReady(true); }, []);

  const handleCreated = useCallback((e: any) => {
    const { layer } = e;
    const featureGroup = featureGroupRef.current;
    if (featureGroup) {
      featureGroup.eachLayer((l) => { if (l !== layer) featureGroup.removeLayer(l); });
    }
    const geoJson = layer.toGeoJSON();
    const areaSqm = area(geoJson);
    const estimatedPanels = Math.floor((areaSqm * 0.85) / 2.5);
    onRoofDrawn({ areaSqm, estimatedPanels, geoJson });
  }, [onRoofDrawn]);

  const handleDeleted = useCallback(() => {
    onRoofDrawn({ areaSqm: 0, estimatedPanels: 0, geoJson: null });
  }, [onRoofDrawn]);

  if (!mapReady) {
    return (
      <div className="h-[420px] w-full rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading satellite view…</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-900">Trace your roof outline</p>
      <p className="text-xs text-gray-500">
        Drag the <span className="text-emerald-600 font-semibold">green pin</span> to centre the view on your exact roof, then use the drawing tools to trace its outline.
      </p>

      <div className="h-[420px] w-full rounded-xl border border-gray-200 overflow-hidden relative z-0">
        <MapContainer
          center={[lat, lng]}
          zoom={19}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          attributionControl={true}
        >
          <MapResizer />
          <MapFlyTo lat={lat} lng={lng} />
          <MapClickSync onCenter={(lt, lg) => setPinPos([lt, lg])} />

          {/*
            High-resolution Google Satellite tiles:
            - 'lyrs=s' requests the pure-satellite layer (no labels).
            - maxNativeZoom=20 + maxZoom=21 lets Leaflet stretch tiles gracefully
              without going blank at high zoom levels.
            - Using mt0–mt3 mirrors prevents rate limiting from a single host.
          */}
          <TileLayer
            url="https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            subdomains={['0', '1', '2', '3']}
            attribution="&copy; Google Satellite"
            maxZoom={21}
            maxNativeZoom={20}
          />

          {/* Draggable center pin — lets user refine position before drawing */}
          <Marker
            position={pinPos}
            icon={pinIcon}
            draggable={true}
            eventHandlers={{
              dragend(e) {
                const { lat: lt, lng: lg } = (e.target as L.Marker).getLatLng();
                setPinPos([lt, lg]);
              },
            }}
          />

          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topright"
              onCreated={handleCreated}
              onDeleted={handleDeleted}
              draw={{
                rectangle: true,
                polygon: {
                  allowIntersection: false,
                  drawError: { color: '#e1e100', message: '<strong>Oh snap!</strong> Lines cannot cross.' },
                  shapeOptions: { color: '#10b981', fillColor: '#10b981', fillOpacity: 0.25, weight: 2 },
                },
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </div>

      {/* Pin coordinate readout */}
      <p className="text-[11px] text-gray-400 font-mono">
        📍 Pin: {pinPos[0].toFixed(6)}, {pinPos[1].toFixed(6)}
      </p>
    </div>
  );
}
