"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalculatorInputs, CalculatorResults, WizardStep } from "@/lib/calculator/types";
import { calculateSolarSystem } from "@/lib/calculator/calculations";
import CalcScreen1 from "./calc-screen1";
import CalcScreen2 from "./calc-screen2";
import CalcScreen3 from "./calc-screen3";

const DEFAULT_INPUTS: CalculatorInputs = {
  state: "",
  monthlyBill: 25000,
  generatorSpend: 50000,
  propertyType: "home",
  appliances: [],
  coveragePct: 100,
  autonomyDays: 1,
  batteryType: "lithium",
};

const STEP_LABELS = ["Quick Inputs", "Your Appliances", "Your Results"];

export default function CalculatorWizard() {
  const [step, setStep]       = useState<WizardStep>(1);
  const [inputs, setInputs]   = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [screen1Error, setScreen1Error] = useState<string | null>(null);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  function updateInputs(updates: Partial<CalculatorInputs>) {
    setInputs(prev => ({ ...prev, ...updates }));
  }

  function goToScreen2() {
    if (!inputs.state) {
      setScreen1Error("Please select your state first.");
      return;
    }
    if (inputs.monthlyBill === 0) {
      setScreen1Error("Please enter your monthly electricity bill.");
      return;
    }
    setScreen1Error(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToScreen3() {
    if (inputs.monthlyBill === 0 && inputs.appliances.length === 0) {
      return; // shouldn't happen but guard
    }
    const calculated = calculateSolarSystem(inputs);
    setResults(calculated);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStep(prev => (prev > 1 ? ((prev - 1) as WizardStep) : prev));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleLeadSubmit(lead: { full_name: string; whatsapp: string; timeline: string }) {
    if (!results) return;
    const payload = {
      // Screen 1
      state:          inputs.state,
      monthly_bill:   inputs.monthlyBill,
      generator_spend: inputs.generatorSpend,
      // Screen 2
      property_type:  inputs.propertyType,
      appliances:     inputs.appliances,
      coverage_pct:   inputs.coveragePct,
      autonomy_days:  inputs.autonomyDays,
      battery_type:   inputs.batteryType,
      // Results
      system_pv_kwp:        results.systemSize.pvKwp,
      system_inverter_kva:  results.systemSize.inverterKva,
      system_battery_kwh:   results.systemSize.batteryKwh,
      cost_low:             results.costs.low,
      cost_mid:             results.costs.mid,
      cost_high:            results.costs.high,
      monthly_savings:      results.savings.monthlySavings,
      payback_months:       results.savings.paybackMonths,
      five_year_savings:    results.savings.fiveYearSavings,
      // Lead data
      full_name:  lead.full_name,
      whatsapp:   lead.whatsapp,
      timeline:   lead.timeline,
    };

    const res = await fetch("/api/calculator/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Submit failed");
    setLeadSubmitted(true);
  }

  const slideVariants = {
    enter:  { x: 60, opacity: 0 },
    center: { x: 0,  opacity: 1 },
    exit:   { x: -60, opacity: 0 },
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {STEP_LABELS.map((label, i) => {
          const s = (i + 1) as WizardStep;
          const active   = step === s;
          const complete = step > s;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  active   ? "bg-primary text-white shadow-lg scale-110" :
                  complete ? "bg-primary/20 text-primary" :
                             "bg-gray-100 text-gray-400"
                }`}>
                  {complete ? "✓" : s}
                </div>
                <span className={`text-xs hidden sm:block transition-colors ${
                  active ? "text-primary font-semibold" : "text-text-muted"
                }`}>
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`w-12 sm:w-16 h-0.5 mb-4 transition-all duration-300 ${
                  complete ? "bg-primary" : "bg-gray-200"
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Screen container */}
      <div className="card p-6 sm:p-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {step === 1 && (
              <CalcScreen1
                data={inputs}
                onChange={updateInputs}
                onNext={goToScreen2}
                error={screen1Error}
              />
            )}
            {step === 2 && (
              <CalcScreen2
                data={inputs}
                onChange={updateInputs}
                onNext={goToScreen3}
                onBack={goBack}
              />
            )}
            {step === 3 && results && (
              <CalcScreen3
                results={results}
                state={inputs.state}
                onBack={goBack}
                onLeadSubmit={handleLeadSubmit}
                leadSubmitted={leadSubmitted}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
