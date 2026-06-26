"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { CalculatorInputs, OwnershipStatus, RoofType, RoofDirection, RoofPitch, PropertyType } from "@/lib/calculator/types";
import { NIGERIAN_STATES } from "@/lib/validations";
import { DISCO_BY_STATE, APPLIANCES, IKEDC_BANDS, getEffectiveTariff, getFuelPrice, updateFuelPriceCache, getApplianceKwh } from "@/lib/calculator/calculations";

// ── NairaInput ───────────────────────────────────────────────────
interface NairaInputProps {
  label: string
  sublabel?: string
  value: number
  onChange: (value: number) => void
  presets: number[]
  placeholder?: string
  helpText?: string
}

function NairaInput({
  label,
  sublabel,
  value,
  onChange,
  presets,
  placeholder = '0',
  helpText,
}: NairaInputProps) {
  const formatNumber = (n: number) =>
    n === 0 ? '' : n.toLocaleString('en-NG')

  const parseInput = (raw: string) => {
    const cleaned = raw.replace(/[^0-9]/g, '')
    return cleaned === '' ? 0 : parseInt(cleaned, 10)
  }

  const [displayValue, setDisplayValue] = useState(formatNumber(value))

  useEffect(() => {
    setDisplayValue(formatNumber(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setDisplayValue(raw)
    const parsed = parseInput(raw)
    onChange(parsed)
  }

  const handleBlur = () => {
    setDisplayValue(formatNumber(value))
  }

  const handlePreset = (preset: number) => {
    onChange(preset)
    setDisplayValue(formatNumber(preset))
  }

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-semibold text-text-primary">
          {label}
        </label>
        {sublabel && (
          <p className="text-xs text-text-muted mt-0.5">{sublabel}</p>
        )}
      </div>

      <div className="relative flex items-center">
        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3.5 pointer-events-none">
          <span className="text-sm font-bold text-primary">₦</span>
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-8 pr-16 py-3 bg-white border-2 border-border rounded-xl text-sm font-bold text-text-primary focus:border-primary focus:outline-none transition-colors placeholder:text-text-muted placeholder:font-normal"
        />
        {value > 0 && (
          <div className="absolute right-3 top-0 bottom-0 flex items-center pointer-events-none">
            <span className="text-xs text-text-muted font-medium">
              {value >= 1000000
                ? `₦${(value / 1000000).toFixed(1)}M`
                : value >= 1000
                  ? `₦${(value / 1000).toFixed(0)}k`
                  : ''}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map(preset => (
          <button
            key={preset}
            type="button"
            onClick={() => handlePreset(preset)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${value === preset
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-text-muted border-border hover:border-primary/40 hover:text-primary'
              }`}
          >
            {preset >= 1000000
              ? `₦${(preset / 1000000).toFixed(1)}M`
              : `₦${(preset / 1000).toFixed(0)}k`}
          </button>
        ))}
      </div>

      {helpText && (
        <p className="text-xs text-text-muted leading-relaxed">{helpText}</p>
      )}
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────

interface Props {
  inputs: CalculatorInputs;
  onChange: (updates: Partial<CalculatorInputs>) => void;
  onCalculate: () => void;
  hasCalculated: boolean;
}

export default function CalcInputSidebar({ inputs, onChange, onCalculate, hasCalculated }: Props) {
  const disco = inputs.state ? DISCO_BY_STATE[inputs.state] : null;

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openAssumptions, setOpenAssumptions] = useState<string | null>(null);
  const [applianceSearch, setApplianceSearch] = useState("");
    const [fuelData, setFuelData] = useState<{
    price: number;
    updatedAt: string;
    source: string;
  }>({
    price: 1000,
    updatedAt: "",
    source: "",
  });

  useEffect(() => {
    getFuelPrice().then(data => {
      setFuelData(data);
      updateFuelPriceCache(data.price);
    });
  }, []);

  const toggleAssumptions = (section: string) => {
    setOpenAssumptions(openAssumptions === section ? null : section);
  };

  const getQty = (id: string) => inputs.appliances.find(a => a.id === id)?.qty || 0;

  const updateApplianceQty = (id: string, delta: number) => {
    const appDef = APPLIANCES.find(a => a.id === id);
    if (!appDef) return;

    const current = getQty(id);
    let next = current + delta;
    if (next < 0) next = 0;
    if (next > 20) next = 20;

    let newApps = [...inputs.appliances];
    if (next === 0) {
      newApps = newApps.filter(a => a.id !== id);
    } else {
      const existing = newApps.find(a => a.id === id);
      if (existing) {
        existing.qty = next;
      } else {
        newApps.push({ id, qty: next });
      }
    }
    onChange({ appliances: newApps });
  };

  const updateApplianceDaytimeHours = (id: string, hours: number) => {
    const existingIdx = inputs.appliances.findIndex(a => a.id === id);
    if (existingIdx !== -1) {
      const newApps = [...inputs.appliances];
      const appDef = APPLIANCES.find(a => a.id === id);
      const maxHours = appDef?.typicalHours || 24;
      const validHours = hours < 0 ? 0 : hours > maxHours ? maxHours : hours;
      newApps[existingIdx] = { ...newApps[existingIdx], daytimeHours: validHours };
      onChange({ appliances: newApps });
    }
  };

  // Bug fix: use live W×h÷1000 formula, NOT static catalog kwhPerDay which is a single default
  const totalApplianceKwh = inputs.appliances.reduce((sum, app) => {
    const def = APPLIANCES.find(a => a.id === app.id);
    if (!def) return sum;
    const dayHrs = app.daytimeHours ?? Math.min(def.typicalHours, 8);
    return sum + getApplianceKwh(def, dayHrs, 0) * app.qty;
  }, 0);

  const totalApplianceCount = inputs.appliances.reduce((sum, app) => sum + app.qty, 0);

  // ── Summary: watts (instantaneous) + day/night energy split ──────────────
  // totalWatts: peak simultaneous draw — what installers size inverters/wiring against
  // dayKwh:    energy consumed 6am–6pm (mirrors engine's daytimeHours logic)
  // nightKwh:  remaining load that requires battery backup in a hybrid system
  const totalWatts = inputs.appliances.reduce((sum, app) => {
    const def = APPLIANCES.find(a => a.id === app.id);
    if (!def || app.qty <= 0) return sum;
    return sum + def.watts * app.qty;
  }, 0);

  const applianceDayKwh = inputs.appliances.reduce((sum, app) => {
    const def = APPLIANCES.find(a => a.id === app.id);
    if (!def || app.qty <= 0) return sum;
    const dayHrs = app.daytimeHours ?? Math.min(def.typicalHours, 8);
    return sum + getApplianceKwh(def, dayHrs, 0) * app.qty;
  }, 0);

  const applianceNightKwh = inputs.appliances.reduce((sum, app) => {
    const def = APPLIANCES.find(a => a.id === app.id);
    if (!def || app.qty <= 0) return sum;
    const dayHrs = app.daytimeHours ?? Math.min(def.typicalHours, 8);
    const nightHrs = Math.max(0, def.typicalHours - dayHrs);
    return sum + getApplianceKwh(def, 0, nightHrs) * app.qty;
  }, 0);

  // True daily total = day + night (totalApplianceKwh only tracks day portion)
  const applianceTotalKwh = applianceDayKwh + applianceNightKwh;

  const CATEGORIES = Array.from(new Set(APPLIANCES.map(a => a.category)));

  

  return (
    <div className="space-y-4">

      {/* Appliances Section */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div>
            <h3 className="font-bold text-text-primary text-sm flex items-center gap-2">
              <span>⚡</span> What appliances do you power?
            </h3>
            <p className="text-xs text-text-muted mt-1 mb-4">
              Add appliances for a precise system size. Skip to use our standard estimate.
            </p>
            {totalApplianceCount > 0 && (
              <div className="space-y-1.5 mb-1">
                {/* Top line — count + instantaneous connected load in watts */}
                <p className="text-sm font-semibold text-primary">
                  {totalApplianceCount} selected — {totalWatts.toLocaleString()}W connected load
                </p>
                {/* Day/night energy breakdown + daily total */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <span>☀️</span>
                    Day:{" "}<span className="font-semibold text-text-primary">{applianceDayKwh.toFixed(1)} kWh</span>
                  </span>
                  <span className="text-border hidden sm:inline">|</span>
                  <span className="flex items-center gap-1">
                    <span>🌙</span>
                    Night:{" "}<span className="font-semibold text-text-primary">{applianceNightKwh.toFixed(1)} kWh</span>
                  </span>
                  <span className="text-border hidden sm:inline">|</span>
                  <span>
                    Total:{" "}<span className="font-semibold text-text-primary">{applianceTotalKwh.toFixed(1)} kWh/day</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                <input
                  type="text"
                  placeholder="Search appliances..."
                  value={applianceSearch}
                  onChange={e => setApplianceSearch(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border text-sm outline-none focus:border-primary transition-all"
                />
                {CATEGORIES.map(cat => {
                  const filteredApps = APPLIANCES.filter(
                    a => a.category === cat && a.name.toLowerCase().includes(applianceSearch.toLowerCase())
                  );
                  if (filteredApps.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-3">
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">{cat}</h4>
                      <div className="space-y-2">
                        {filteredApps.map(app => {
                          const quantityItem = inputs.appliances.find(a => a.id === app.id) as { id: string, qty: number, daytimeHours?: number } | undefined;
                          const qty = quantityItem?.qty || 0;
                          const daytimeHours = quantityItem?.daytimeHours ?? Math.min(app.typicalHours, 8);
                          const supported = true;
                          const upgradeTo = null;
                          return (
                            <div
                              key={app.id}
                              
                              className={`flex items-center justify-between p-3 rounded-xl border bg-gray-50 transition-opacity border-gray-100 opacity-100`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xl flex-shrink-0">{app.icon}</span>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-text-primary leading-tight truncate">
                                    {app.name}
                                    {app.isInverter && (
                                      <span className="ml-2 text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase">Inverter</span>
                                    )}
                                  </p>
                                  <p className="text-xs text-text-muted">
                                    {supported
                                      ? `${getApplianceKwh(app, daytimeHours, 0).toFixed(2)} kWh/day • ${app.watts}W`
                                      : `⬆ Needs ${upgradeTo}`}
                                  </p>
                                  {qty > 0 && supported && (
                                    <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                                      <span>Daytime use:</span>
                                      <input
                                        type="number"
                                        min={0}
                                        max={app.typicalHours}
                                        value={daytimeHours}
                                        onChange={(e) => updateApplianceDaytimeHours(app.id, parseInt(e.target.value) || 0)}
                                        className="w-14 border border-border rounded px-2 py-0.5 text-xs text-center outline-none bg-white"
                                      />
                                      <span>hrs (6am–6pm)</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className={`flex items-center gap-3 bg-white border border-border rounded-lg p-1 flex-shrink-0 `}>
                                <button onClick={() => updateApplianceQty(app.id, -1)} className="p-1 hover:bg-gray-100 rounded-md text-text-muted">
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-4 text-center text-sm font-bold">{qty}</span>
                                <button onClick={() => updateApplianceQty(app.id, 1)} className="p-1 hover:bg-gray-100 rounded-md text-text-muted">
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
      </div>

      
      {/* ══════════════════════════════════════════════════ */}
      {/* HOME DETAILS                                       */}
      {/* ══════════════════════════════════════════════════ */}
      <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
        <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <span>🏠</span> Enter Your Home Details
        </h2>

        {/* 1. Ownership */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-semibold text-text-primary">Ownership Status</label>
          <div className="grid grid-cols-2 gap-3">
            {(["owner", "tenant"] as OwnershipStatus[]).map(status => (
              <button
                key={status}
                type="button"
                onClick={() => onChange({ ownershipStatus: status })}
                className={`p-4 rounded-xl border-2 text-center transition-all ${inputs.ownershipStatus === status
                  ? "border-primary bg-primary/10"
                  : "border-border bg-white hover:border-gray-300"
                  }`}
              >
                <div className="text-2xl mb-1">{status === "owner" ? "🏠" : "🔑"}</div>
                <div className="text-sm font-bold text-text-primary uppercase">I {status === "owner" ? "Own" : "Rent"}</div>
              </button>
            ))}
          </div>
          {inputs.ownershipStatus === "tenant" && (
            <div className="text-sm bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100">
              <p><strong>Note:</strong> Solar requires landlord approval. You can still use this calculator to estimate costs for your landlord discussion!</p>
            </div>
          )}
        </div>

        {/* 2. State */}
        <div className="space-y-2 mb-6">
          <label className="block text-sm font-semibold text-text-primary">State *</label>
          <select
            value={inputs.state}
            onChange={e => {
              const selectedState = e.target.value;
              onChange({
                state: selectedState,
                lagosElectricityBand: selectedState === "Lagos" ? "band_b" : undefined,
              });
            }}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          >
            <option value="">Select your state</option>
            {NIGERIAN_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {disco && !disco.includes("IKEDC / EKEDC") && (
            <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
              Using {disco.split(" ")[0]} rate: ₦{getEffectiveTariff(disco).toFixed(2)}/kWh
            </p>
          )}
        </div>

        {/* 2b. Lagos Band Selector */}
        {disco?.includes("IKEDC / EKEDC") && (
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-semibold text-text-primary">
              How many hours of electricity do you get daily?
            </label>
            <select
              value={inputs.lagosElectricityBand || ""}
              onChange={e => onChange({ lagosElectricityBand: e.target.value || undefined })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            >
              <option value="">Select your electricity supply level</option>
              {IKEDC_BANDS.map(band => (
                <option key={band.id} value={band.id}>{band.label}</option>
              ))}
            </select>

            <Link
              href="/lagos-power-bands"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-primary font-medium mt-2 hover:underline group w-fit"
            >
              <span className="text-sm">⚡</span>
              <span>
                Not sure which band you&apos;re on?
                <span className="underline ml-1 group-hover:no-underline">
                  Check your IKEDC feeder →
                </span>
              </span>
            </Link>
            {inputs.lagosElectricityBand && (() => {
              const band = IKEDC_BANDS.find(b => b.id === inputs.lagosElectricityBand);
              return band ? (
                <div className="text-xs bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                  <p className="font-bold text-green-800">
                    Your tariff: ₦{band.tariff.toFixed(2)}/kWh
                  </p>
                  <p className="text-green-700">
                    NERC approved, May 2025 — ORDER/NERC/2025/050
                  </p>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* 3. NEPA Bill */}
        <div className="mb-6">
          <NairaInput
            label="Monthly NEPA Bill"
            sublabel="Your average electricity bill per month"
            value={inputs.monthlyBill}
            onChange={(val) => onChange({ monthlyBill: val })}
            presets={[5000, 10000, 20000, 35000, 50000, 100000]}
            placeholder="Enter amount"
            helpText="Check your NEPA bill or estimate based on your tariff band. Not sure? Use ₦20,000 as a starting point."
          />
        </div>

        {/* 4. Generator Spend */}
        <div className="mb-6">
          <NairaInput
            label="Generator Fuel Spend"
            sublabel="Monthly fuel + maintenance"
            value={inputs.generatorSpend}
            onChange={(val) => onChange({ generatorSpend: val })}
            presets={[10000, 30000, 50000, 75000, 100000, 150000]}
            placeholder="Enter amount"
            helpText="Include petrol cost and servicing. 0 if you don't use a generator."
          />
        </div>

        {/* 5. Property Type */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-semibold text-text-primary">Property Type</label>
          <div className="flex gap-2 text-sm">
            {(["home", "small-business", "large-business"] as PropertyType[]).map(pt => (
              <label key={pt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="propertyType"
                  checked={inputs.propertyType === pt}
                  onChange={() => onChange({ propertyType: pt })}
                  className="accent-primary"
                />
                <span className="capitalize">{pt.replace("-", " ")}</span>
              </label>
            ))}
          </div>
        </div>

        {!hasCalculated && (() => {
          const isLagosWithoutBand = inputs.state === "Lagos" && !inputs.lagosElectricityBand;
          return (
            <button
              onClick={onCalculate}
              disabled={isLagosWithoutBand}
              className="btn-primary w-full py-4 text-base font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLagosWithoutBand ? "Please select your electricity band" : "Analyze my energy usage"}
            </button>
          );
        })()}
      </div>

      {/* Advanced Settings Accordion */}
      <div>
        <button
          onClick={() => setShowAdvanced(prev => !prev)}
          className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-border text-sm font-medium text-text-muted hover:text-text-primary transition-colors mt-4"
        >
          <span className="flex items-center gap-2">
            <span>⚙️</span>
            Advanced Settings
            <span className="text-xs text-text-muted font-normal">
              (roof type, direction, pitch)
            </span>
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}/>
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-5 p-4 bg-gray-50 rounded-xl border border-border">
            {/* 6. Roof Type */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-text-primary">Roof Type</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {([
                  { id: "flat_concrete", icon: "🏠", label: "Flat Concrete" },
                  { id: "corrugated_iron", icon: "🏚️", label: "Corrugated Iron" },
                  { id: "aluminum_deck", icon: "🏗️", label: "Aluminum/Deck" },
                  { id: "clay_tiles", icon: "🏛️", label: "Clay Tiles" },
                  { id: "not_sure", icon: "🤷", label: "Not Sure" },
                ] as const).map(rt => (
                  <button
                    key={rt.id} type="button"
                    onClick={() => onChange({ roofType: rt.id as RoofType })}
                    className={`p-2 rounded-lg border flex items-center gap-2 text-left transition-all ${inputs.roofType === rt.id ? "border-primary bg-primary/10 font-bold" : "border-border bg-white"
                      }`}
                  >
                    <span>{rt.icon}</span> <span>{rt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 7 & 8. Roof Direction & Pitch */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-text-primary">Roof Direction</label>
                <select
                  value={inputs.roofDirection}
                  onChange={e => onChange({ roofDirection: e.target.value as RoofDirection })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:border-primary"
                >
                  {["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-text-primary">Roof Pitch</label>
                <select
                  value={inputs.roofPitch}
                  onChange={e => onChange({ roofPitch: e.target.value as RoofPitch })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:border-primary"
                >
                  {["Flat (0°)", "Low (10-15°)", "Medium (20-30°)", "Steep (35-45°)"].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            
            
        {/* 10. System Mode */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-semibold text-text-primary">System Type</label>
          <div className="flex flex-col gap-3">
            {[
              { id: "grid-tied", label: "Grid-Tied", desc: "No battery, daytime savings only" },
              { id: "hybrid", label: "Hybrid", desc: "Solar + Grid + Battery (Recommended)" },
              { id: "off-grid", label: "Off-Grid", desc: "Complete independence" }
            ].map(mode => (
              <label key={mode.id} className={`p-3 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${inputs.systemMode === mode.id ? "border-primary bg-primary/5" : "border-border bg-white hover:border-gray-300"}`}>
                <input
                  type="radio"
                  name="systemMode"
                  checked={inputs.systemMode === mode.id}
                  onChange={() => onChange({ systemMode: mode.id as import("@/lib/calculator/types").SystemMode })}
                  className="accent-primary w-4 h-4"
                />
                <div>
                  <div className="font-bold text-text-primary">{mode.label}</div>
                  <div className="text-xs text-text-muted">{mode.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 11. Autonomy */}
        {inputs.systemMode !== 'grid-tied' && (
          <div className="space-y-3 mb-6 p-4 rounded-xl bg-gray-50 border border-border">
            <div className="flex justify-between items-end">
              <div>
                <label className="block text-sm font-semibold text-text-primary">Autonomy Requirement</label>
                <p className="text-xs text-text-muted mt-0.5">How long the battery lasts without sun/grid</p>
              </div>
              <span className="text-sm font-bold text-primary">{inputs.autonomyDays === 0.5 ? "Half Day" : inputs.autonomyDays === 1 ? "1 Day" : "2+ Days"}</span>
            </div>
            <input
              type="range"
              min={0.5} max={2.5} step={0.5}
              value={inputs.autonomyDays}
              onChange={e => {
                const val = Number(e.target.value);
                // Snap to valid values (0.5, 1, 2)
                const snapped = val <= 0.5 ? 0.5 : val <= 1.5 ? 1 : 2;
                onChange({ autonomyDays: snapped });
              }}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-text-muted px-1 font-medium">
              <span>0.5 Day (Night only)</span>
              <span>1 Day (Standard)</span>
              <span>2+ Days (Resilient)</span>
            </div>
          </div>
        )}

            {/* 9. Coverage % */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <label className="block text-sm font-semibold text-text-primary">Desired Electric Coverage</label>
                  <p className="text-xs text-text-muted mt-0.5">100% = fully solar powered</p>
                </div>
                <span className="text-sm font-bold text-primary">{inputs.coveragePct}%</span>
              </div>
              <input
                type="range"
                min={50} max={100} step={10}
                value={inputs.coveragePct}
                onChange={e => onChange({ coveragePct: Number(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Assumptions Sidebar Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary px-2">Assumptions</h3>

        {/* PRODUCTION */}
        <div className="bg-white rounded-xl border border-border overflow-hidden text-sm">
          <button onClick={() => toggleAssumptions("production")} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 font-semibold">
            <span>☀️ Production</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${openAssumptions === "production" ? "rotate-180" : ""}`} />
          </button>
          {openAssumptions === "production" && (
            <div className="p-4 pt-0 space-y-4 border-t border-border mt-2">
              <div className="space-y-2 pt-2">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-text-muted">Generator fuel efficiency</label>
                  <span className="text-xs font-bold">{inputs.fuelEfficiency || 2.0} kWh/L</span>
                </div>
                <input type="range" min={0.5} max={5.0} step={0.1} value={inputs.fuelEfficiency || 2.0} onChange={e => onChange({ fuelEfficiency: Number(e.target.value) })} className="w-full accent-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-text-muted">Shade/Obstruction</label>
                  <span className="text-xs font-bold">{inputs.shadeObstruction}%</span>
                </div>
                <input type="range" min={0} max={50} value={inputs.shadeObstruction} onChange={e => onChange({ shadeObstruction: Number(e.target.value) })} className="w-full accent-primary" />
              </div>
              <p className="text-xs text-text-muted">Panel degradation rate: {inputs.panelDegradation}%/year</p>
            </div>
          )}
        </div>

        {/* SAVINGS */}
        <div className="bg-white rounded-xl border border-border overflow-hidden text-sm">
          <button onClick={() => toggleAssumptions("savings")} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 font-semibold">
            <span>💰 Savings &amp; Inflation</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${openAssumptions === "savings" ? "rotate-180" : ""}`} />
          </button>
          {openAssumptions === "savings" && (
            <div className="p-4 pt-0 space-y-4 border-t border-border mt-2">
              <div className="space-y-2 pt-2">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-text-muted">Fuel Price Inflation</label>
                  <span className="text-xs font-bold">{inputs.fuelInflation}%/yr</span>
                </div>
                <input type="range" min={0} max={30} value={inputs.fuelInflation} onChange={e => onChange({ fuelInflation: Number(e.target.value) })} className="w-full accent-amber-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-text-muted">NEPA Tariff Inflation</label>
                  <span className="text-xs font-bold">{inputs.nepaInflation}%/yr</span>
                </div>
                <input type="range" min={0} max={30} value={inputs.nepaInflation} onChange={e => onChange({ nepaInflation: Number(e.target.value) })} className="w-full accent-blue-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-text-muted">Discount Rate (MPR)</label>
                  <span className="text-xs font-bold">{inputs.discountRate}%</span>
                </div>
                <input type="range" min={0} max={30} step={0.5} value={inputs.discountRate} onChange={e => onChange({ discountRate: Number(e.target.value) })} className="w-full accent-gray-500" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Fuel Price Badge */}
      <div className="flex items-center justify-between text-xs text-text-muted pt-4 border-t border-border mt-4 px-2">
        <div>
          <span className="font-medium text-text-primary">⛽ Fuel price:</span>
          <span className="text-primary font-bold ml-1">
            ₦{fuelData.price.toLocaleString()}/L
          </span>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            <a
              href="https://fueltracker.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              FuelTracker.ng
            </a>
          </div>
          <div className="text-text-muted text-xs mt-0.5">
            {fuelData.updatedAt
              ? `Updated ${formatRelativeTime(fuelData.updatedAt)}`
              : "Live crowdsourced"}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
