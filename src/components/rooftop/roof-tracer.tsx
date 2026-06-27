'use client';
import { useEffect, useRef, useState } from 'react';
import { LatLng, calculatePolygonAreaM2, calculateUsableRoofAreaM2 } from '@/lib/rooftop/roof-area';

interface RoofTracerProps {
  lat: number;
  lng: number;
  onAreaCalculated: (result: { points: LatLng[]; totalAreaM2: number; usableAreaM2: number }) => void;
}

export function RoofTracer({ lat, lng, onAreaCalculated }: RoofTracerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<LatLng[]>([]);
  const [isDrawing, setIsDrawing] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;
    if (!google || !google.maps || !mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 20,
      mapTypeId: 'satellite',
      tilt: 0,
      disableDefaultUI: true,
      zoomControl: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let polygon: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let markers: any[] = [];
    let currentPoints: LatLng[] = [];

    const clickListener = map.addListener('click', (e: any) => {
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

    return () => {
      clickListener.remove();
      markers.forEach((m) => m.setMap(null));
      if (polygon) polygon.setMap(null);
    };
  }, [lat, lng, isDrawing]);

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
        Click each corner of your roof in sequence on the satellite view, then click "Finish Outline".
      </p>

      <div ref={mapRef} className="w-full h-64 md:h-80 rounded-xl border border-gray-200 overflow-hidden" />

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
