"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { CalculatorInputs } from "@/lib/calculator/types";
import { calculateSolarSystem } from "@/lib/calculator/calculations";
import CalcInputSidebar from "./calc-input-sidebar";
import CalcResultsView from "./calc-results-view";
import CalcStickyBar from "./calc-sticky-bar";
import { SYSTEM_PACKAGES, SystemTier, formatTierPrice } from "@/data/system-packages";

import { useSearchParams } from "next/navigation";

const DEFAULT_INPUTS: CalculatorInputs = {
  systemTier: "standard",
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
    if (debouncedInputs.state === "Lagos" && !debouncedInputs.lagosElectricityBand) return null;
    return calculateSolarSystem(debouncedInputs);
  }, [debouncedInputs]);

  function updateInputs(updates: Partial<CalculatorInputs>) {
    setInputs(prev => ({ ...prev, ...updates }));
  }

  function handleCalculate() {
    if (!inputs.state) {
      alert("Please select your state first.");
      return;
    }
    if (inputs.state === "Lagos" && !inputs.lagosElectricityBand) {
      alert("Please select your electricity supply level first.");
      return;
    }
    setHasCalculated(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** Jump to calculator and pre-select a tier */
  function jumpToCalculator(tier: SystemTier) {
    setInputs(prev => ({ ...prev, systemTier: tier }));
    setTimeout(() => {
      calcRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function handleLeadSubmit(lead: { full_name: string; whatsapp: string; timeline: string; landlord_consent?: boolean }) {
    if (!results) return;
    const payload = {
      ...inputs,
      system_pv_kwp: results.pvKwp,
      system_inverter_kva: results.inverterKva,
      system_battery_kwh: results.batteryKwh,
      cost_low: results.systemCostMin,
      cost_mid: (results.systemCostMin + results.systemCostMax) / 2,
      cost_high: results.systemCostMax,
      monthly_savings: results.monthlyCurrentSpend - results.afterSolarMonthlyCost,
      payback_months: results.paybackMonths,
      five_year_savings: results.fiveYearSavings,
      full_name: lead.full_name,
      whatsapp: lead.whatsapp,
      timeline: lead.timeline,
      landlord_consent: lead.landlord_consent,
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

      {/* ── PACKAGE CARDS SECTION ─────────────────────────────── */}
      <section className="mb-12">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-1">
            Know your budget? Start here.
          </h2>
          <p className="text-sm text-text-muted">
            Pick your system size — we&apos;ll show you exactly what it costs, what it powers, and when you&apos;ll break even.
          </p>
        </div>

        {/* 5 package cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {Object.values(SYSTEM_PACKAGES).map(pkg => (
            <div
              key={pkg.tier}
              onClick={() => jumpToCalculator(pkg.tier)}
              className={`bg-white rounded-2xl border-2 p-4 cursor-pointer hover:border-primary hover:shadow-lg transition-all group ${
                inputs.systemTier === pkg.tier
                  ? "border-primary shadow-md"
                  : "border-border"
              }`}
            >
              {/* Emoji + label */}
              <div className="text-2xl mb-1.5">{pkg.emoji}</div>
              <h3 className={`font-bold text-xs mb-0.5 transition-colors ${
                inputs.systemTier === pkg.tier ? "text-primary" : "text-text-primary group-hover:text-primary"
              }`}>
                {pkg.label}
              </h3>
              <p className="text-[10px] text-text-muted mb-2 leading-relaxed">{pkg.tagline}</p>

              {/* Price range */}
              <div className="bg-primary/5 rounded-xl px-2 py-1.5 mb-2">
                <p className="text-[9px] text-text-muted mb-0.5">System cost</p>
                <p className="font-bold text-xs text-primary">
                  {formatTierPrice(pkg.priceMin)}–{formatTierPrice(pkg.priceMax)}
                </p>
              </div>

              {/* Top 3 "can power" */}
              <div className="space-y-0.5">
                {pkg.canPower.slice(0, 3).map((item, i) => (
                  <p key={i} className="text-[10px] text-text-muted flex items-start gap-1">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                    <span className="leading-tight">{item}</span>
                  </p>
                ))}
              </div>

              {/* Payback */}
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-[10px] text-text-muted">~{pkg.paybackYears}yr payback</p>
              </div>

              {/* CTA */}
              <div className="mt-1.5">
                <span className="text-[10px] font-semibold text-primary group-hover:underline">
                  Calculate savings →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-muted font-medium whitespace-nowrap">
            or enter your details below for a precise estimate
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
      </section>

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
    </div>
  );
}
