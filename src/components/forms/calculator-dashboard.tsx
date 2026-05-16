"use client";

import { useState, useMemo, useEffect } from "react";
import { CalculatorInputs } from "@/lib/calculator/types";
import { calculateSolarSystem } from "@/lib/calculator/calculations";
import CalcInputSidebar from "./calc-input-sidebar";
import CalcResultsView from "./calc-results-view";
import CalcStickyBar from "./calc-sticky-bar";

const DEFAULT_INPUTS: CalculatorInputs = {
  ownershipStatus: "owner",
  state: "",
  monthlyBill: 45000,
  generatorSpend: 60000,
  propertyType: "home",
  roofType: "flat_concrete",
  roofDirection: "South",
  roofPitch: "Low (10-15°)",
  coveragePct: 100,
  appliances: [],
  shadeObstruction: 10,
  panelDegradation: 0.5,
  fuelInflation: 15,
  nepaInflation: 20,
  discountRate: 22,
  batteryScenario: "overnight",
  batteryType: "lithium",
  autonomyDays: 1,
};

export default function CalculatorDashboard() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [debouncedInputs, setDebouncedInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Debounce input changes for recalculation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInputs(inputs);
      if (hasCalculated && inputs.state && inputs.monthlyBill > 0) {
        showToast("Results updated");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputs, hasCalculated]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  const results = useMemo(() => {
    if (!debouncedInputs.state || debouncedInputs.monthlyBill === 0) return null;
    return calculateSolarSystem(debouncedInputs);
  }, [debouncedInputs]);

  function updateInputs(updates: Partial<CalculatorInputs>) {
    setInputs((prev) => ({ ...prev, ...updates }));
  }

  function handleCalculate() {
    if (!inputs.state) {
      alert("Please select your state first.");
      return;
    }
    setHasCalculated(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleLeadSubmit(lead: { full_name: string; whatsapp: string; timeline: string; landlord_consent?: boolean }) {
    if (!results) return;
    const payload = {
      ...inputs,
      system_pv_kwp: results.systemSize.pvKwp,
      system_inverter_kva: results.systemSize.inverterKva,
      system_battery_kwh: results.systemSize.batteryKwh,
      cost_low: results.costs.low,
      cost_mid: results.costs.mid,
      cost_high: results.costs.high,
      monthly_savings: results.savings.monthlySavings,
      payback_months: results.savings.paybackMonths,
      five_year_savings: results.savings.fiveYearSavings,
      full_name: lead.full_name,
      whatsapp: lead.whatsapp,
      timeline: lead.timeline,
      landlord_consent: lead.landlord_consent,
      appliances_with_qty: inputs.appliances, // passing JSON array of {id, qty}
    };

    const res = await fetch("/api/calculator/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Submit failed");
    setLeadSubmitted(true);
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative pb-24">
      {/* Recalculation Toast */}
      <div className={`fixed top-24 right-4 z-50 transition-all duration-300 ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg font-medium text-sm flex items-center gap-2">
          <span>✓</span> {toastMessage}
        </div>
      </div>

      {hasCalculated && results && (
        <CalcStickyBar inputs={inputs} results={results} onRecalculate={() => setHasCalculated(false)} />
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column - 1/3 Width */}
        <div className="w-full lg:w-1/3 space-y-6 shrink-0 lg:sticky lg:top-24 max-h-[calc(100vh-6rem)] lg:overflow-y-auto pb-8 custom-scrollbar">
          <CalcInputSidebar
            inputs={inputs}
            onChange={updateInputs}
            onCalculate={handleCalculate}
            hasCalculated={hasCalculated}
          />
        </div>

        {/* Right Columns - 2/3 Width */}
        <div className="w-full lg:w-2/3 space-y-8">
          {hasCalculated && results ? (
            <CalcResultsView
              inputs={inputs}
              results={results}
              onChange={updateInputs}
              leadSubmitted={leadSubmitted}
              onLeadSubmit={handleLeadSubmit}
            />
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center h-full min-h-[500px] border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 text-center p-12">
              <div className="text-6xl mb-4 opacity-50">☀️</div>
              <h3 className="text-xl font-bold text-gray-400">Ready to see your solar potential?</h3>
              <p className="text-gray-400 mt-2 max-w-sm">Fill out the details on the left and click calculate to generate your custom solar sizing and savings report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
