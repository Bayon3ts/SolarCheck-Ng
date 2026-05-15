"use client";

import { useState } from "react";
import { APPLIANCES } from "@/lib/calculator/calculations";
import { CalculatorInputs, BatteryType, PropertyType } from "@/lib/calculator/types";

interface Props {
  data: Pick<CalculatorInputs, "propertyType" | "appliances" | "coveragePct" | "autonomyDays" | "batteryType">;
  onChange: (updates: Partial<CalculatorInputs>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PROPERTY_TYPES: { id: PropertyType; icon: string; label: string; sub: string }[] = [
  { id: "home",           icon: "🏠", label: "Home / Residential", sub: "Family home or apartment"   },
  { id: "small-business", icon: "🏪", label: "Small Business",     sub: "Shop, office <10 staff"     },
  { id: "large-business", icon: "🏢", label: "Large Business",     sub: "Factory, hotel, school"     },
];

const COVERAGE_OPTIONS = [50, 75, 100];
const AUTONOMY_OPTIONS  = [0, 1, 2, 3];

// Derive unique category order from the APPLIANCES array
const CATEGORIES = Array.from(new Set(APPLIANCES.map(a => a.category)));

export default function CalcScreen2({ data, onChange, onNext, onBack }: Props) {
  const [openCategory, setOpenCategory] = useState<string>(CATEGORIES[0]);

  const dailyKwh = data.appliances.reduce(
    (sum, id) => sum + (APPLIANCES.find(a => a.id === id)?.kwhPerDay ?? 0), 0
  );

  function toggleAppliance(id: string) {
    const next = data.appliances.includes(id)
      ? data.appliances.filter(a => a !== id)
      : [...data.appliances, id];
    onChange({ appliances: next });
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-text-primary">Tell us about your property</h2>
        <p className="text-text-muted text-sm">Select your appliances for a precise system size</p>
      </div>

      {/* Property Type */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-text-primary">Property Type</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PROPERTY_TYPES.map(pt => (
            <button
              key={pt.id}
              type="button"
              onClick={() => onChange({ propertyType: pt.id })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.propertyType === pt.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-1">{pt.icon}</div>
              <div className="text-sm font-semibold text-text-primary">{pt.label}</div>
              <div className="text-xs text-text-muted">{pt.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Appliance Checklist — grouped by category */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-text-primary">Select Your Appliances</label>
          <div className={`text-sm font-bold px-3 py-1 rounded-full transition-all ${
            dailyKwh > 0 ? "bg-primary text-white" : "bg-gray-100 text-text-muted"
          }`}>
            {dailyKwh > 0 ? `${dailyKwh.toFixed(1)} kWh/day` : "0 kWh/day"}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => {
            const catAppliances = APPLIANCES.filter(a => a.category === cat);
            const selectedCount = catAppliances.filter(a => data.appliances.includes(a.id)).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setOpenCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${
                  openCategory === cat
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-text-muted border-border hover:border-gray-400"
                }`}
              >
                {cat}
                {selectedCount > 0 && (
                  <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold ${
                    openCategory === cat ? "bg-white text-primary" : "bg-primary text-white"
                  }`}>
                    {selectedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Appliance grid for open category */}
        <div className="grid grid-cols-2 gap-2">
          {APPLIANCES.filter(a => a.category === openCategory).map(app => {
            const selected = data.appliances.includes(app.id);
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => toggleAppliance(app.id)}
                className={`flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-lg flex-shrink-0 mt-0.5">{app.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-text-primary leading-tight">{app.label}</div>
                  <div className="text-xs text-text-muted mt-0.5">{app.kwhPerDay} kWh · {app.note}</div>
                </div>
              </button>
            );
          })}
        </div>

        {data.appliances.length > 0 && (
          <p className="text-xs text-primary font-medium bg-primary/5 rounded-lg px-3 py-2">
            ⚡ {data.appliances.length} appliance{data.appliances.length !== 1 ? "s" : ""} selected — estimated daily usage:{" "}
            <span className="font-bold">{dailyKwh.toFixed(1)} kWh/day</span>
          </p>
        )}
      </div>

      {/* Coverage % */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-text-primary">Solar Coverage</label>
          <p className="text-xs text-text-muted mt-0.5">How much of your load should solar cover? 100% = fully off-grid capable.</p>
        </div>
        <div className="flex gap-2">
          {COVERAGE_OPTIONS.map(pct => (
            <button
              key={pct}
              type="button"
              onClick={() => onChange({ coveragePct: pct })}
              className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                data.coveragePct === pct
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-text-primary hover:border-gray-300"
              }`}
            >
              {pct}%
              {pct === 100 && <div className="text-xs font-normal opacity-80">off-grid</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Autonomy Days */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-text-primary">Battery Backup Days</label>
          <p className="text-xs text-text-muted mt-0.5">Days of autonomy without sun. Most homes choose 1–2 days.</p>
        </div>
        <div className="flex gap-2">
          {AUTONOMY_OPTIONS.map(days => (
            <button
              key={days}
              type="button"
              onClick={() => onChange({ autonomyDays: days })}
              className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                data.autonomyDays === days
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-text-primary hover:border-gray-300"
              }`}
            >
              {days === 0 ? "Grid-tied" : `${days} day${days > 1 ? "s" : ""}`}
            </button>
          ))}
        </div>
      </div>

      {/* Battery Type */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-text-primary">Battery Type</label>
        <div className="grid grid-cols-2 gap-3">
          {([
            { id: "lead-acid" as BatteryType, icon: "🔋", label: "Lead Acid",         sub: "Lower cost, shorter life (3–4 yrs)" },
            { id: "lithium"   as BatteryType, icon: "⚡", label: "Lithium (LiFePO4)", sub: "Higher cost, longer life — recommended" },
          ] as const).map(bt => (
            <button
              key={bt.id}
              type="button"
              onClick={() => onChange({ batteryType: bt.id })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.batteryType === bt.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-1">{bt.icon}</div>
              <div className="text-sm font-semibold text-text-primary">{bt.label}</div>
              <div className="text-xs text-text-muted">{bt.sub}</div>
              {bt.id === "lithium" && (
                <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Recommended
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded-xl border-2 border-border text-text-primary font-semibold hover:border-gray-400 transition-all"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="btn-primary flex-[2] py-4 font-semibold"
        >
          See My Results →
        </button>
      </div>
    </div>
  );
}
