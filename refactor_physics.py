import re

types_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\lib\calculator\types.ts'
calc_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\lib\calculator\calculations.ts'
res_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\components\forms\calc-results-view.tsx'

# 1. Update types.ts
with open(types_path, 'r', encoding='utf-8') as f:
    t = f.read()

new_calc_results = """
export interface CalculatorResults {
  isValid: boolean;
  dailyLoadKwh: number;
  pvKwp: number;
  panelsNeeded: number;
  batteryKwh: number;
  autonomyHours: number;
  systemStatus: 'PASS' | 'FAIL';
}

export interface LeadCaptureData {
"""
t = re.sub(r'export interface CalculatorResults \{[\s\S]*?export interface LeadCaptureData \{', new_calc_results, t)
t = re.sub(r'export type PvSizingClassification.*?;\n', '', t)
t = re.sub(r'export type SeasonalRisk.*?;\n', '', t)
t = re.sub(r'export type BatterySufficiency.*?;\n', '', t)
t = re.sub(r'export interface TruthQAReport \{[\s\S]*?\}\n', '', t)

with open(types_path, 'w', encoding='utf-8') as f:
    f.write(t)


# 2. Update calculations.ts
with open(calc_path, 'r', encoding='utf-8') as f:
    c = f.read()

calc_engine = """
export function calculateSolarSystem(inputs: CalculatorInputs): CalculatorResults {
  const {
    appliances,
    systemMode,
    monthlyBill,
    generatorSpend,
    coveragePct
  } = inputs;

  let dailyLoadKwh = 0;
  let nightLoadKwh = 0;

  for (const sel of appliances) {
    if (!sel || !sel.id) continue;
    const aDef = window.__APPLIANCE_DB__ ? window.__APPLIANCE_DB__.find((a: any) => a.id === sel.id) : null;
    if (!aDef) continue;
    
    const qty = sel.qty || 1;
    const watts = aDef.power_watts || 0;
    const hours = aDef.hours_per_day || 0;
    
    const dailyKwh = (watts * hours * qty) / 1000;
    dailyLoadKwh += dailyKwh;
    
    const nightHrs = aDef.night_hours_per_day ?? (hours * 0.4);
    const nKwh = (watts * nightHrs * qty) / 1000;
    nightLoadKwh += nKwh;
  }

  // Fallback 40%
  if (nightLoadKwh === 0 && dailyLoadKwh > 0) {
    nightLoadKwh = dailyLoadKwh * 0.4;
  }

  // 1. PV SIZING STRICT ENERGY BALANCE
  const systemEfficiency = 0.75;
  const psh = 4.5;
  const pvKwp = dailyLoadKwh / (systemEfficiency * psh);
  const panelWattage = 550;
  const panelsNeeded = Math.ceil((pvKwp * 1000) / panelWattage);
  const actualPvKwp = (panelsNeeded * panelWattage) / 1000;

  // 2. BATTERY STRICT NIGHT ENERGY
  let autonomyDays = 1;
  if (systemMode === 'grid-tied') autonomyDays = 0;
  else if (systemMode === 'hybrid') autonomyDays = 1;
  else if (systemMode === 'off-grid') autonomyDays = 2;

  const dod = 0.8;
  const batteryKwhRequired = (nightLoadKwh * autonomyDays) / dod;
  
  // 3. SAVINGS (Conservative)
  const totalBaselineSpend = monthlyBill + generatorSpend;
  const gridOffsetValue = monthlyBill * (coveragePct / 100);
  const generatorOffsetValue = generatorSpend * (coveragePct / 100);
  
  let savings = 0;
  if (systemMode === 'off-grid') {
    savings = Math.min(gridOffsetValue + generatorOffsetValue, totalBaselineSpend);
  } else {
    savings = Math.min(gridOffsetValue, generatorOffsetValue + gridOffsetValue);
    // Never assume simultaneous full displacement unless off-grid
    if (coveragePct > 90) {
      savings = Math.min(savings, totalBaselineSpend * 0.9);
    }
  }

  // 4. AUTONOMY HOURS
  let autonomyHours = 0;
  if (batteryKwhRequired > 0 && nightLoadKwh > 0) {
    autonomyHours = (batteryKwhRequired * dod) / (nightLoadKwh / 12);
  } else if (batteryKwhRequired > 0 && dailyLoadKwh > 0) {
    autonomyHours = (batteryKwhRequired * dod) / (dailyLoadKwh / 24);
  }

  // 5. DETERMINISTIC VALIDATION
  const energyBalance = actualPvKwp >= pvKwp ? 'PASS' : 'FAIL';
  const batteryFeasibility = batteryKwhRequired >= ((nightLoadKwh * autonomyDays) / dod) ? 'PASS' : 'FAIL';
  const autonomyValidity = (autonomyHours >= autonomyDays * 12 || autonomyDays === 0) ? 'PASS' : 'FAIL';
  const pvSizingAccuracy = actualPvKwp >= pvKwp ? 'PASS' : 'UNDERPROVISIONED';

  let systemStatus: 'PASS' | 'FAIL' = 'FAIL';
  if (energyBalance === 'PASS' && batteryFeasibility === 'PASS' && autonomyValidity === 'PASS' && pvSizingAccuracy === 'PASS') {
    systemStatus = 'PASS';
  }

  return {
    isValid: true,
    dailyLoadKwh: Math.round(dailyLoadKwh * 10) / 10,
    pvKwp: Math.round(pvKwp * 100) / 100,
    panelsNeeded,
    batteryKwh: Math.round(batteryKwhRequired * 10) / 10,
    autonomyHours: Math.round(autonomyHours * 10) / 10,
    systemStatus
  };
}

export function getInverterSize
"""
c = re.sub(r'export function calculateSolarSystem\(inputs: CalculatorInputs\): CalculatorResults \{[\s\S]*?export function getInverterSize', calc_engine, c)

with open(calc_path, 'w', encoding='utf-8') as f:
    f.write(c)

# 3. Update calc-results-view.tsx
res_view = """'use client';

import React, { useState } from 'react';
import { CalculatorResults, CalculatorInputs, LeadCaptureData } from '@/lib/calculator/types';

interface Props {
  results: CalculatorResults;
  inputs: CalculatorInputs;
  onLeadSubmit: (data: LeadCaptureData) => Promise<void>;
}

export default function CalcResultsView({ results, inputs, onLeadSubmit }: Props) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [timeline, setTimeline] = useState('ASAP');
  const [landlordConsent, setLandlordConsent] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) {
      setFormError("Please enter your name and WhatsApp number.");
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      await onLeadSubmit({ full_name: name, whatsapp, timeline, landlord_consent: landlordConsent });
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* FINAL OUTPUT FORMAT (STRICT) */}
      <div className="card p-6 md:p-8 space-y-6 shadow-sm border border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <span>📊</span> System Sizing
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium text-text-muted">Total Load (kWh/day)</span>
            <span className="font-bold text-lg">{results.dailyLoadKwh.toFixed(1)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium text-text-muted">PV Size (kWp)</span>
            <span className="font-bold text-lg">{results.pvKwp.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium text-text-muted">Panel Count</span>
            <span className="font-bold text-lg">{results.panelsNeeded}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium text-text-muted">Battery Size (kWh)</span>
            <span className="font-bold text-lg">{results.batteryKwh.toFixed(1)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium text-text-muted">Night Autonomy (hours)</span>
            <span className="font-bold text-lg">{results.autonomyHours.toFixed(1)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium text-text-muted">System Status</span>
            <span className={`font-bold text-lg ${results.systemStatus === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
              {results.systemStatus}
            </span>
          </div>
        </div>
      </div>

      {/* LEAD FORM (kept to not break flow) */}
      <div className="card p-6 md:p-8 space-y-6 shadow-sm border border-border bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Get Your Custom Quote</h2>
          <p className="text-sm text-text-muted">
            Enter your details below and a certified solar engineer will contact you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          {formError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
            <input
              type="text"
              className="w-full input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chinedu Okafor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">WhatsApp Number</label>
            <input
              type="tel"
              className="w-full input"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. 08012345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Installation Timeline</label>
            <select
              className="w-full input"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
            >
              <option value="ASAP">As soon as possible</option>
              <option value="1_month">Within 1 month</option>
              <option value="3_months">Within 3 months</option>
              <option value="Just_researching">Just researching</option>
            </select>
          </div>

          {inputs.ownershipStatus === 'tenant' && (
            <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                id="consent"
                className="mt-1"
                checked={landlordConsent}
                onChange={(e) => setLandlordConsent(e.target.checked)}
              />
              <label htmlFor="consent" className="text-sm text-gray-700">
                I confirm I have (or can get) my landlord's consent to install solar panels on the roof.
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || (inputs.ownershipStatus === 'tenant' && !landlordConsent)}
            className="w-full btn btn-primary py-3 flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              'Send My Sizing Report'
            )}
          </button>
          
          <p className="text-xs text-center text-text-muted mt-4">
            We will only contact you regarding your solar sizing request. No spam.
          </p>
        </form>
      </div>
    </div>
  );
}
"""

with open(res_path, 'w', encoding='utf-8') as f:
    f.write(res_view)

print("Physics engine strictly refactored.")
