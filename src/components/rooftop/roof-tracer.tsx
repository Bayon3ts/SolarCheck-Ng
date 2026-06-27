'use client';
import { useEffect, useRef, useState } from 'react';
import { LatLng, calculatePolygonAreaM2, calculateUsableRoofAreaM2 } from '@/lib/rooftop/roof-area';
import { loadGoogleMaps } from '@/lib/google-maps-loader';

interface RoofTracerProps {
  lat: number;
  lng: number;
  onAreaCalculated: (result: { points: LatLng[]; totalAreaM2: number; usableAreaM2: number }) => void;
}

export function RoofTracer({ lat, lng, onAreaCalculated }: RoofTracerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<LatLng[]>([]);
  const [isDrawing, setIsDrawing] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Load the Google Maps script via shared loader (no double-load race condition).
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapReady(true))
      .catch((err: Error) => setMapError(err.message));
  }, []);

  useEffect(() => {
    if (!mapReady) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;

    if (!google?.maps || !mapRef.current) {
      setMapError('Map container not ready.');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let polygon: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let markers: any[] = [];
    let currentPoints: LatLng[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let idleListener: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let clickListener: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let centerMarker: any = null;

    try {
      map = new google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 20,
        mapTypeId: 'satellite',
        tilt: 0,
        disableDefaultUI: true,
        zoomControl: true,
      });

      // 'idle' fires once tiles have loaded — confirms the map actually rendered
      idleListener = map.addListener('idle', () => {
        console.log('[RoofTracer] Map loaded successfully');
      });

      // Draggable orange marker so the user can fine-tune the pinned location
      // before tracing — purely a visual aid, tracing still works from any click
      centerMarker = new google.maps.Marker({
        position: { lat, lng },
        map,
        draggable: true,
        title: 'Drag to your exact roof location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#F5A623',
          fillOpacity: 0.9,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clickListener = map.addListener('click', (e: any) => {
        if (!isDrawing || !e.latLng) return;

        const point = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        currentPoints = [...currentPoints, point];
        setPoints(currentPoints);

        const marker = new google.maps.Marker({
          position: point,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: '#10b981',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });
        markers.push(marker);

        if (polygon) polygon.setMap(null);
        if (currentPoints.length >= 2) {
          polygon = new google.maps.Polygon({
            paths: currentPoints,
            map,
            fillColor: '#10b981',
            fillOpacity: 0.25,
            strokeColor: '#10b981',
            strokeWeight: 2,
          });
        }
      });
    } catch (err) {
      console.error('[RoofTracer] Map init failed:', err);
      setMapError(
        `Map failed to initialize: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }

    return () => {
      if (idleListener) idleListener.remove();
      if (clickListener) clickListener.remove();
      if (centerMarker) centerMarker.setMap(null);
      markers.forEach((m) => m.setMap(null));
      if (polygon) polygon.setMap(null);
    };
  }, [lat, lng, isDrawing, mapReady]);

  const handleFinishTracing = () => {
    if (points.length < 3) return;
    const totalAreaM2 = calculatePolygonAreaM2(points);
    const usableAreaM2 = calculateUsableRoofAreaM2(totalAreaM2);
    onAreaCalculated({ points, totalAreaM2, usableAreaM2 });
    setIsDrawing(false);
  };

  const handleReset = () => {
    setPoints([]);
    setIsDrawing(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">
          Trace your roof outline
        </p>
        {!isDrawing && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100"
          >
            Redraw Outline
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Click each corner of your roof in sequence on the satellite view, then click &quot;Finish Outline&quot;.
      </p>

      {/* Loading placeholder — shown until the shared loader resolves */}
      {!mapReady && !mapError && (
        <div className="w-full h-64 md:h-80 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50">
          <p className="text-sm text-gray-500">Loading satellite view…</p>
        </div>
      )}

      {/* Error state */}
      {mapError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">Couldn&apos;t load the satellite view</p>
          <p className="text-xs">{mapError}</p>
          <p className="text-xs mt-2 text-gray-500">
            You can skip this step — it&apos;s optional and won&apos;t affect your sizing report.
          </p>
        </div>
      )}

      {/* Pin-drag instruction — only shown when map is ready */}
      {mapReady && !mapError && (
        <p className="text-xs text-gray-500">
          📍 If the orange pin isn&apos;t on your exact roof, drag it to the right spot first, then trace your roof outline below.
        </p>
      )}

      {/* Map container — hidden until loader resolves or on error */}
      <div
        ref={mapRef}
        className={`w-full h-64 md:h-80 rounded-xl border border-gray-200 overflow-hidden ${
          !mapReady || mapError ? 'hidden' : ''
        }`}
      />

      {isDrawing && points.length > 0 && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleFinishTracing}
            disabled={points.length < 3}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50"
          >
            Finish Outline ({points.length} points)
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
