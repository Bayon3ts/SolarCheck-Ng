'use client';

import { useRef, useState, useEffect } from 'react';

interface AddressSearchProps {
  onAddressSelect: (result: { address: string; lat: number; lng: number }) => void;
}

interface Prediction {
  placeId: string;
  description: string;
}

export function AddressSearch({ onAddressSelect }: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete: calls our server-side proxy (no billing wall)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const res = await fetch(`/api/geocode?input=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.error) {
          // Google API error — surface it but don't crash
          setError('Address search unavailable. Try GPS instead.');
          setPredictions([]);
          setShowDropdown(false);
        } else {
          setPredictions(data.predictions ?? []);
          setShowDropdown((data.predictions ?? []).length > 0);
        }
      } catch {
        setError('Search failed. Check your connection.');
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (prediction: Prediction) => {
    setQuery(prediction.description);
    setShowDropdown(false);
    setIsResolving(true);
    setError(null);

    try {
      const res = await fetch(`/api/geocode/details?placeId=${prediction.placeId}`);
      const data = await res.json();

      if (data.error || typeof data.lat !== 'number') {
        setError('Could not resolve coordinates. Try searching again.');
        return;
      }

      onAddressSelect({ address: data.address, lat: data.lat, lng: data.lng });
    } catch {
      setError('Could not get location. Please try again.');
    } finally {
      setIsResolving(false);
    }
  };

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
          'Could not get your location. Please allow location access in browser settings, ' +
          'or try the address search instead.'
        ),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="text-sm font-semibold text-gray-900 block mb-2">
        Enter your installation address
      </label>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (predictions.length > 0) setShowDropdown(true); }}
          placeholder="Start typing your building address in Nigeria…"
          autoComplete="off"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-emerald-600 focus:outline-none transition-colors bg-white"
        />

        {/* Spinner: searching or resolving */}
        {(isSearching || isResolving) && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Autocomplete dropdown */}
        {showDropdown && predictions.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border border-gray-200 shadow-xl rounded-xl mt-1 max-h-64 overflow-y-auto">
            {predictions.map((p) => (
              <li
                key={p.placeId}
                onMouseDown={() => handleSelect(p)}
                className="px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 cursor-pointer border-b last:border-b-0 border-gray-100 leading-snug"
              >
                <span className="mr-2 text-gray-400">📍</span>
                {p.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-1.5">{error}</p>
      )}

      <button
        type="button"
        onClick={handleUseGPS}
        className="text-xs text-emerald-700 font-semibold mt-2.5 flex items-center gap-1.5 hover:text-emerald-900 transition-colors"
      >
        📍 Or use my current GPS location instead
      </button>
      <p className="text-xs text-gray-500 mt-1.5">
        Can&apos;t find your exact street? Try a nearby landmark, estate name, or use GPS above.
      </p>
    </div>
  );
}
