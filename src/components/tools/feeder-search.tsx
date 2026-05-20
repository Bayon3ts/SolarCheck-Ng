"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { LAGOS_FEEDERS, LagosFeed } from "@/data/lagos-feeders";
import { MapPin, Zap, Banknote, ChevronRight } from "lucide-react";

export default function FeederSearch() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];

    return LAGOS_FEEDERS.filter(
      (f) =>
        f.feederName.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.streets.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [query]);

  return (
    <div className="space-y-12">
      {/* Search Input */}
      <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-border p-2 flex items-center gap-3">
          <span className="text-2xl pl-3">🔍</span>
          <input
            type="text"
            placeholder="Search your street, estate or area... e.g. 'Allen Avenue', 'Omole', 'Lekki'"
            className="flex-1 py-4 text-lg outline-none text-text-primary placeholder:text-text-muted"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-text-muted hover:text-text-primary px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-3xl mx-auto px-4 pb-12">
        {query.length >= 2 && results.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl font-bold text-text-primary">
              No feeders found for &quot;{query}&quot;
            </p>
            <p className="text-text-muted mt-2">
              Try searching by street name, estate, area or substation (e.g. &quot;IKEJA&quot;)
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider px-2">
              Matching Feeders Nearby
            </h2>
            <div className="space-y-4">
              {results.map((feeder) => (
                <FeederCard key={feeder.id} feeder={feeder} />
              ))}
            </div>
          </div>
        )}

        {query.length < 2 && (
          <div className="text-center py-12 text-text-muted">
            <p className="text-sm italic">Type at least 2 characters to start searching 317 Lagos feeders...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FeederCard({ feeder }: { feeder: LagosFeed }) {
  const bandStyles = {
    A: { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-600", text: "text-green-900" },
    B: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-600", text: "text-blue-900" },
    C: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-600", text: "text-amber-900" },
    D: { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-600", text: "text-orange-900" },
    E: { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-600", text: "text-red-900" },
  };

  const style = bandStyles[feeder.band];

  return (
    <div className={`card overflow-hidden border-2 transition-all hover:shadow-md ${style.bg} ${style.border}`}>
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`${style.badge} text-white text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-widest`}>
            Band {feeder.band}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${feeder.disco === 'EKEDC' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
            {feeder.disco}
          </span>
          {feeder.feederType === '33kV' && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              33kV
            </span>
          )}
          <span className="bg-white/50 border border-black/5 px-3 py-1 rounded-full text-xs font-bold text-text-primary flex items-center gap-1.5">
            <MapPin className="h-3 w-3" /> {feeder.location}
          </span>
        </div>

        <h3 className="text-lg font-bold text-text-primary mb-4 font-mono text-sm md:text-base break-all">
          {feeder.feederName}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-black/5 pt-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-muted leading-none mb-1">Guaranteed Supply</p>
              <p className="font-bold text-text-primary">{feeder.minHours} hours/day</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Banknote className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-muted leading-none mb-1">Official Tariff</p>
              <p className="font-bold text-text-primary">₦{feeder.tariff.toFixed(2)}/kWh</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[10px] uppercase font-bold text-text-muted leading-none mb-2">Streets Served</p>
          <p className="text-sm text-text-primary leading-relaxed line-clamp-3">
            {feeder.streets}
          </p>
        </div>

        <Link
          href={`/solar-calculator?state=Lagos&band=band_${feeder.band.toLowerCase()}`}
          className="btn-primary w-full py-4 text-base font-bold flex justify-center items-center gap-2 group shadow-lg"
        >
          Calculate my solar savings
          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
