"use client";

import { useState } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { CalculatorInputs, OwnershipStatus, RoofType, RoofDirection, RoofPitch, PropertyType } from "@/lib/calculator/types";
import { NIGERIAN_STATES } from "@/lib/validations";
import { DISCO_BY_STATE, APPLIANCES, PETROL_PRICE_PER_LITRE } from "@/lib/calculator/calculations";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  inputs: CalculatorInputs;
  onChange: (updates: Partial<CalculatorInputs>) => void;
  onCalculate: () => void;
  hasCalculated: boolean;
}

export default function CalcInputSidebar({ inputs, onChange, onCalculate, hasCalculated }: Props) {
  const disco = inputs.state ? DISCO_BY_STATE[inputs.state] : null;

  const [showAppliances, setShowAppliances] = useState(false);
  const [openAssumptions, setOpenAssumptions] = useState<string | null>(null);

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
    if (next > (appDef.maxQuantity || 10)) next = appDef.maxQuantity || 10;

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

  const totalApplianceKwh = inputs.appliances.reduce((sum, app) => {
    const def = APPLIANCES.find(a => a.id === app.id);
    return sum + (def ? def.kwhPerDay * app.qty : 0);
  }, 0);

  const totalApplianceCount = inputs.appliances.reduce((sum, app) => sum + app.qty, 0);

  const CATEGORIES = Array.from(new Set(APPLIANCES.map(a => a.category)));

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
        <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <span>🏠</span> Enter Your Home Details
        </h2>

        {/* 1. Ownership */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-semibold text-text-primary">Ownership Status</label>
          <div className="grid grid-cols-2 gap-3">
            {(['owner', 'tenant'] as OwnershipStatus[]).map(status => (
              <button
                key={status}
                type="button"
                onClick={() => onChange({ ownershipStatus: status })}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  inputs.ownershipStatus === status
                    ? "border-primary bg-primary/10"
                    : "border-border bg-white hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-1">{status === 'owner' ? '🏠' : '🔑'}</div>
                <div className="text-sm font-bold text-text-primary uppercase">I {status === 'owner' ? 'Own' : 'Rent'}</div>
              </button>
            ))}
          </div>
          {inputs.ownershipStatus === 'tenant' && (
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
            onChange={e => onChange({ state: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          >
            <option value="">Select your state</option>
            {NIGERIAN_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {disco && (
            <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
              Your DISCO: {disco}
            </p>
          )}
        </div>

        {/* 3. NEPA Bill */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-end">
            <label className="block text-sm font-semibold text-text-primary">Monthly NEPA Bill</label>
            <span className="text-sm font-bold text-primary">₦{inputs.monthlyBill.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={5000} max={500000} step={5000}
            value={inputs.monthlyBill}
            onChange={e => onChange({ monthlyBill: Number(e.target.value) })}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* 4. Generator Spend */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-end">
            <div>
              <label className="block text-sm font-semibold text-text-primary">Generator Fuel Spend</label>
              <p className="text-xs text-text-muted mt-0.5">Incl. maintenance</p>
            </div>
            <span className="text-sm font-bold text-amber-600">₦{inputs.generatorSpend.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={0} max={500000} step={5000}
            value={inputs.generatorSpend}
            onChange={e => onChange({ generatorSpend: Number(e.target.value) })}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* 5. Property Type */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-semibold text-text-primary">Property Type</label>
          <div className="flex gap-2 text-sm">
            {(['home', 'small-business', 'large-business'] as PropertyType[]).map(pt => (
              <label key={pt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="propertyType"
                  checked={inputs.propertyType === pt}
                  onChange={() => onChange({ propertyType: pt })}
                  className="accent-primary"
                />
                <span className="capitalize">{pt.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 6. Roof Type */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-semibold text-text-primary">Roof Type</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {([
              { id: 'flat_concrete', icon: '🏠', label: 'Flat Concrete' },
              { id: 'corrugated_iron', icon: '🏚️', label: 'Corrugated Iron' },
              { id: 'aluminum_deck', icon: '🏗️', label: 'Aluminum/Deck' },
              { id: 'clay_tiles', icon: '🏛️', label: 'Clay Tiles' },
              { id: 'not_sure', icon: '🤷', label: 'Not Sure' }
            ] as const).map(rt => (
              <button
                key={rt.id} type="button"
                onClick={() => onChange({ roofType: rt.id as RoofType })}
                className={`p-2 rounded-lg border flex items-center gap-2 text-left transition-all ${
                  inputs.roofType === rt.id ? "border-primary bg-primary/10 font-bold" : "border-border bg-white"
                }`}
              >
                <span>{rt.icon}</span> <span>{rt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 7 & 8. Roof Direction & Pitch */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text-primary">Roof Direction</label>
            <select
              value={inputs.roofDirection}
              onChange={e => onChange({ roofDirection: e.target.value as RoofDirection })}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:border-primary"
            >
              {['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'].map(d => (
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
              {['Flat (0°)', 'Low (10-15°)', 'Medium (20-30°)', 'Steep (35-45°)'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 9. Coverage % */}
        <div className="space-y-3 mb-6">
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

        {!hasCalculated && (
          <button
            onClick={onCalculate}
            className="btn-primary w-full py-4 text-base font-bold shadow-lg"
          >
            Calculate My Solar Savings →
          </button>
        )}
      </div>

      {/* Appliances Collapsible */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <button
          onClick={() => setShowAppliances(!showAppliances)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div>
            <h3 className="font-bold text-text-primary text-sm flex items-center gap-2">
              <span>🔌</span> Add Your Appliances
              <span className="text-xs font-normal text-text-muted bg-gray-100 px-2 py-0.5 rounded-full">(Optional)</span>
            </h3>
            {totalApplianceCount > 0 && (
              <p className="text-xs text-primary font-semibold mt-1">
                {totalApplianceCount} selected — {totalApplianceKwh.toFixed(1)} kWh/day
              </p>
            )}
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showAppliances ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {showAppliances && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="p-4 space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                {CATEGORIES.map(cat => (
                  <div key={cat} className="space-y-3">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">{cat}</h4>
                    <div className="space-y-2">
                      {APPLIANCES.filter(a => a.category === cat).map(app => {
                        const qty = getQty(app.id);
                        return (
                          <div key={app.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{app.icon}</span>
                              <div>
                                <p className="text-sm font-semibold text-text-primary leading-tight">{app.label}</p>
                                <p className="text-xs text-text-muted">{app.kwhPerDay} kWh/day</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white border border-border rounded-lg p-1">
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
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Assumptions Sidebar Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary px-2">Assumptions</h3>
        
        {/* PRODUCTION */}
        <div className="bg-white rounded-xl border border-border overflow-hidden text-sm">
          <button onClick={() => toggleAssumptions('production')} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 font-semibold">
            <span>☀️ Production</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${openAssumptions === 'production' ? 'rotate-180' : ''}`} />
          </button>
          {openAssumptions === 'production' && (
            <div className="p-4 pt-0 space-y-4 border-t border-border mt-2">
              <div className="space-y-2 pt-2">
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
          <button onClick={() => toggleAssumptions('savings')} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 font-semibold">
            <span>💰 Savings & Inflation</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${openAssumptions === 'savings' ? 'rotate-180' : ''}`} />
          </button>
          {openAssumptions === 'savings' && (
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

      <p className="text-xs text-text-muted text-center pt-4">
        Fuel price assumption: ₦{PETROL_PRICE_PER_LITRE.toLocaleString()}/L (petrol)<br />
        Last updated: May 2026
      </p>
    </div>
  );
}
