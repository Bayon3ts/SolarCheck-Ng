'use client';
import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps-loader';

interface AddressSearchProps {
  onAddressSelect: (result: { address: string; lat: number; lng: number }) => void;
}

export function AddressSearch({ onAddressSelect }: AddressSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load the Google Maps script (shared loader — no double-load if RoofTracer
  // also mounts at the same time).
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setIsLoaded(true))
      .catch((err: Error) => setLoadError(err.message));
  }, []);

  // Attach Places Autocomplete once the script is ready.
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'ng' },
      fields: ['formatted_address', 'geometry'],
    });

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;
      onAddressSelect({
        address: place.formatted_address ?? '',
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    });

    return () => listener.remove();
  }, [isLoaded, onAddressSelect]);

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Location access is not available in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        onAddressSelect({
          address: 'Current GPS location',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () =>
        alert(
          'Could not get your location. Please allow location access, or try ' +
          'the address search with a nearby landmark or major road name instead.'
        ),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loadError) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">Rooftop sizing isn&apos;t available right now</p>
        <p className="text-xs">{loadError}</p>
        <p className="text-xs mt-2 text-gray-500">You can skip this step — it won&apos;t affect your sizing report.</p>
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm font-semibold text-gray-900 block mb-2">
        Enter your address
      </label>
      <input
        ref={inputRef}
        type="text"
        placeholder="Start typing your address in Nigeria..."
        disabled={!isLoaded}
        autoComplete="off"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-emerald-600 focus:outline-none disabled:opacity-50"
      />
      <button
        type="button"
        onClick={handleUseGPS}
        className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1 hover:text-emerald-900 transition-colors"
      >
        📍 Or use my current GPS location instead
      </button>
      <p className="text-xs text-gray-500 mt-1.5">
        Can&apos;t find your exact street? Try a nearby major road, landmark, or estate name — or use GPS above.
      </p>
    </div>
  );
}
