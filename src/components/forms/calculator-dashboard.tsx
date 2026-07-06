"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { CalculatorInputs } from "@/lib/calculator/types";
import { calculateSolarSystem } from "@/lib/calculator/calculations";
import CalcInputSidebar from "./calc-input-sidebar";
import CalcResultsView from "./calc-results-view";
import CalcStickyBar from "./calc-sticky-bar";

import { useSearchParams } from "next/navigation";
import { AddressSearch } from '@/components/rooftop/address-search';
import { RoofTracer } from '@/components/rooftop/roof-tracer';
import { FitCheckDisplay } from '@/components/rooftop/fit-check-result';
import { checkPanelFit, FitCheckResult } from '@/lib/rooftop/panel-footprint';
import { LatLng } from '@/lib/rooftop/roof-area';

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
  fuelEfficiency: 2.0,
  systemMode: "hybrid",
  batteryType: "lithium",
  autonomyDays: 1,
};

export default function CalculatorDashboard() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [debouncedInputs, setDebouncedInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isRoofStepOpen, setIsRoofStepOpen] = useState(false);
  const [geoCoords, setGeoCoords] = useState<LatLng | null>(null);
  const [fitAnalysis, setFitAnalysis] = useState<FitCheckResult | null>(null);

  const calcRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Read URL params on mount
  useEffect(() => {
    const urlState = searchParams.get("state");
    const urlBand = searchParams.get("band");

    if (urlState || urlBand) {
      const updates: Partial<CalculatorInputs> = {};
      if (urlState) updates.state = urlState;
      if (urlBand) updates.lagosElectricityBand = urlBand;

      setInputs(prev => ({ ...prev, ...updates }));

      if (urlState) {
        setHasCalculated(true);
      }
    }
  }, [searchParams]);

  // Debounce input changes for recalculation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInputs(inputs);
      if (hasCalculated && inputs.state && inputs.appliances.length > 0) {
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
    // Require state + at least one appliance — bill can be 0 (generator-only users)
    if (!debouncedInputs.state) return null;
    if (debouncedInputs.appliances.length === 0) return null;
    if (debouncedInputs.state === "Lagos" && !debouncedInputs.lagosElectricityBand) return null;
    return calculateSolarSystem(debouncedInputs);
  }, [debouncedInputs]);

  // ── CALCULATION LOADING ANIMATION ─────────────────────────────────────────
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcStep, setCalcStep] = useState(0);

  const CALC_STEPS = [
    { label: 'Analysing your daily load...', duration: 600 },
    { label: 'Sizing your solar panels...', duration: 700 },
    { label: 'Calculating battery capacity...', duration: 600 },
    { label: 'Checking Nigerian market prices...', duration: 700 },
    { label: 'Generating your system report...', duration: 500 },
  ];

  function updateInputs(updates: Partial<CalculatorInputs>) {
    setInputs(prev => ({ ...prev, ...updates }));
  }

  function handleCalculate() {
    if (inputs.appliances.length === 0) {
      alert("INSUFFICIENT LOAD DATA — PLEASE ADD APPLIANCES");
      return;
    }
    if (!inputs.state) {
      alert("Please select your state first.");
      return;
    }
    if (inputs.state === "Lagos" && !inputs.lagosElectricityBand) {
      alert("Please select your electricity supply level first.");
      return;
    }

    // Start animated loading sequence
    setIsCalculating(true);
    setCalcStep(0);

    let step = 0;
    const runStep = () => {
      if (step >= CALC_STEPS.length) {
        setIsCalculating(false);
        setHasCalculated(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setCalcStep(step);
      setTimeout(() => {
        step++;
        runStep();
      }, CALC_STEPS[step].duration);
    };
    runStep();
  }


  async function handleLeadSubmit(lead: { full_name: string; whatsapp: string; timeline: string; landlord_consent?: boolean }) {
    if (!results) return;
    const payload = {
      ...inputs,
      system_pv_kwp: results.pvKwp,
      system_inverter_kva: results.inverterKva,
      system_battery_kwh: results.batteryKwh,
      cost_low: results.systemCostMin,
      cost_mid: Math.round((results.systemCostMin + results.systemCostMax) / 2),
      cost_high: results.systemCostMax,
      roi_months: results.paybackMonths,
      payback_months: results.paybackMonths,
      five_year_savings: results.fiveYearSavings?.expected ?? 0,
      full_name: lead.full_name,
      whatsapp: lead.whatsapp,
      timeline: lead.timeline,
      lead_consent: lead.landlord_consent ?? false,
      appliances_with_qty: inputs.appliances,
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
      <div className={`fixed top-24 right-4 z-50 transition-all duration-300 ${toastMessage ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg font-medium text-sm flex items-center gap-2">
          <span>✓</span> {toastMessage}
        </div>
      </div>

      {/* ── MAIN CALCULATOR ───────────────────────────────────── */}
      <div ref={calcRef}>
        {hasCalculated && results && (
          <CalcStickyBar inputs={inputs} results={results} onRecalculate={() => setHasCalculated(false)} />
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column - 1/3 Width */}
          <div className="w-full lg:w-1/3 space-y-6 shrink-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pb-8 custom-scrollbar">
            <CalcInputSidebar
              inputs={inputs}
              onChange={updateInputs}
              onCalculate={handleCalculate}
              hasCalculated={hasCalculated}
              results={hasCalculated ? results : null}
            />
          </div>

          {/* Right Columns - 2/3 Width */}
          <div className="w-full lg:w-2/3 space-y-8">

            {/* ── CALCULATION LOADING SCREEN ──────────────────────── */}
            {isCalculating && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
                {/* Spinning solar ring */}
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1A5C38] border-r-[#F5A623] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">☀️</div>
                </div>

                {/* Step progress */}
                <div className="w-full max-w-sm space-y-3">
                  {CALC_STEPS.map((step, i) => (
                    <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i < calcStep ? 'opacity-100' :
                        i === calcStep ? 'opacity-100' :
                          'opacity-20'
                      }`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${i < calcStep
                          ? 'bg-green-500 text-white'
                          : i === calcStep
                            ? 'bg-[#1A5C38] text-white animate-pulse'
                            : 'bg-slate-100'
                        }`}>
                        {i < calcStep ? (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${i === calcStep ? 'text-[#1A5C38]' :
                          i < calcStep ? 'text-green-600' : 'text-slate-400'
                        }`}>{step.label}</span>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-sm">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1A5C38] to-[#F5A623] rounded-full transition-all duration-500"
                      style={{ width: `${((calcStep + 1) / CALC_STEPS.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 text-center mt-2">
                    {Math.round(((calcStep + 1) / CALC_STEPS.length) * 100)}% complete
                  </p>
                </div>
              </div>
            )}
            {!isCalculating && hasCalculated && results ? (
              <>
                {/* ROOFTOP FIT CHECK */}
                <div className="border border-gray-200 bg-white rounded-2xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setIsRoofStepOpen(!isRoofStepOpen)}
                    className="w-full flex items-center justify-between p-5 font-semibold text-left text-gray-900 bg-gray-50 hover:bg-gray-100/80 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      📐 <span>Will this fit on your roof? <span className="text-xs text-gray-500 font-normal">(Optional Layout Verification)</span></span>
                    </span>
                    <span className="text-xl transform transition-transform duration-200">{isRoofStepOpen ? '−' : '+'}</span>
                  </button>

                  {isRoofStepOpen && (
                    <div className="p-5 border-t border-gray-100 space-y-5">
                      {!geoCoords ? (
                        <AddressSearch
                          onAddressSelect={(res) => setGeoCoords({ lat: res.lat, lng: res.lng })}
                        />
                      ) : (
                        <div className="space-y-5">
                          <RoofTracer
                            lat={geoCoords.lat}
                            lng={geoCoords.lng}
                            onAreaCalculated={(traceData) => {
                              const assessment = checkPanelFit(
                                results.panelsNeeded,
                                results.panelSizeWatts,
                                traceData.usableAreaM2
                              );
                              setFitAnalysis(assessment);
                            }}
                          />

                          {fitAnalysis && <FitCheckDisplay result={fitAnalysis} />}

                          <button
                            type="button"
                            onClick={() => {
                              setGeoCoords(null);
                              setFitAnalysis(null);
                            }}
                            className="text-xs text-gray-500 underline hover:text-gray-800 block pt-1"
                          >
                            Change installation address
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <CalcResultsView
                  inputs={inputs}
                  results={results}
                  onChange={updateInputs}
                  leadSubmitted={leadSubmitted}
                  onLeadSubmit={handleLeadSubmit}
                />
              </>
            ) : !isCalculating ? (
              <div className="hidden lg:flex flex-col items-center justify-center h-full min-h-[500px] border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 text-center p-12">
                <div className="text-6xl mb-4 opacity-50">☀️</div>
                <h3 className="text-xl font-bold text-gray-400">Ready to see your solar potential?</h3>
                <p className="text-gray-400 mt-2 max-w-sm">Fill out the details on the left and click calculate to generate your custom solar sizing and savings report.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}