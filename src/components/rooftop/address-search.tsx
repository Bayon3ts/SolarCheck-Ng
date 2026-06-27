'use client';
import { useState, useEffect, useRef } from 'react';

interface AddressSearchProps {
  onAddressSelect: (result: { address: string; lat: number; lng: number }) => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function AddressSearch({ onAddressSelect }: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=ng&addressdetails=1&limit=5`);
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        setResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.error('[SolarCheck] Nominatim search failed', err);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: NominatimResult) => {
    setQuery(result.display_name);
    setShowDropdown(false);
    onAddressSelect({
      address: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-sm font-semibold text-gray-900 block mb-2">
        Enter your address
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          placeholder="Start typing your address in Nigeria..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-emerald-600 focus:outline-none"
        />
        {isLoading && (
          <div className="absolute right-4 top-3.5">
            <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.place_id}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-3 hover:bg-emerald-50 text-sm text-gray-700 border-b border-gray-100 last:border-0 transition-colors"
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500 mt-1.5">
        We'll show a satellite view so you can trace your roof outline.
      </p>
    </div>
  );
}
