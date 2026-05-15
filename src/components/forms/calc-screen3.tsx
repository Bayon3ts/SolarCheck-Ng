"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import { CalculatorResults } from "@/lib/calculator/types";
import { fmt, fmtM, PETROL_PRICE_PER_LITRE } from "@/lib/calculator/calculations";
import AnimatedCounter from "@/components/animations/animated-counter";

interface Props {
  results: CalculatorResults;
  state: string;
  onBack: () => void;
  onLeadSubmit: (lead: { full_name: string; whatsapp: string; timeline: string }) => Promise<void>;
  leadSubmitted: boolean;
}

export default function CalcScreen3({ results, state, onBack, onLeadSubmit, leadSubmitted }: Props) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [timeline, setTimeline] = useState("asap");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const { systemSize, costs, savings, usage, environmental, costBreakdown } = results;

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) {
      setFormError("Please enter your name and WhatsApp number.");
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      await onLeadSubmit({ full_name: name, whatsapp, timeline });
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const kpiTiles = [
    {
      label: "Recommended System",
      value: `${systemSize.inverterSize} · ${systemSize.pvKwp}kWp`,
      sub: systemSize.batteryKwh > 0
        ? `${systemSize.batteryKwh}kWh ${systemSize.batteryType === "lithium" ? "Lithium" : "Lead Acid"} battery`
        : "No battery (grid-tied)",
      color: "from-primary to-primary-dark",
      icon: "☀️",
    },
    {
      label: "Estimated Cost",
      value: `${fmtM(costs.low)} – ${fmtM(costs.high)}`,
      sub: `Median ${fmtM(costs.mid)}`,
      color: "from-amber-500 to-orange-600",
      icon: "💰",
    },
    {
      label: "Monthly Savings",
      value: fmt(savings.monthlySavings),
      sub: "vs generator + maintenance",
      color: "from-emerald-500 to-teal-600",
      icon: "📉",
    },
    {
      label: "Payback Period",
      value: `${savings.paybackMonths} months`,
      sub: `${savings.paybackYears} years`,
      color: "from-blue-500 to-indigo-600",
      icon: "⏱️",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          System sized for {state}
        </div>
        <h2 className="text-2xl font-bold text-text-primary">Your Solar Estimate</h2>
        <p className="text-text-muted text-sm">{usage.dailyKwh} kWh/day · {usage.peakSunHours} peak sun hours</p>
      </div>

      {/* KPI Tiles 2x2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {kpiTiles.map((tile, i) => (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className={`rounded-2xl bg-gradient-to-br ${tile.color} p-5 text-white shadow-lg`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{tile.label}</span>
              <span className="text-2xl">{tile.icon}</span>
            </div>
            <div className="text-xl font-bold leading-tight">{tile.value}</div>
            <div className="text-xs opacity-70 mt-1">{tile.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Generator Comparison Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="bg-gradient-to-r from-primary-dark to-primary rounded-2xl p-5 text-white"
      >
        <p className="text-sm font-semibold opacity-80 mb-1">Generator vs Solar</p>
        <p className="text-base font-medium leading-relaxed">
          You currently spend{" "}
          <span className="font-bold text-accent">
            <AnimatedCounter target={savings.monthlyGenCostNow} prefix="₦" />
          </span>
          /month on generator fuel &amp; maintenance. After solar, your monthly energy cost drops to{" "}
          <span className="font-bold text-green-300">{fmt(Math.round(savings.monthlySolarCost))}/month</span>.
        </p>
        {leadSubmitted && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-sm font-semibold opacity-80 mb-0.5">5-Year Savings</p>
            <p className="text-2xl font-bold text-accent">
              <AnimatedCounter target={savings.fiveYearSavings} prefix="₦" />
            </p>
          </div>
        )}
      </motion.div>

      {/* Environmental Badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
      >
        <span className="text-2xl">🌱</span>
        <p className="text-sm text-green-800 font-medium">
          This system saves ~<strong>{environmental.co2SavedTonnesPerYear} tonnes</strong> of CO₂ per year —
          equivalent to planting {Math.round(Number(environmental.co2SavedTonnesPerYear) * 45)} trees.
        </p>
      </motion.div>

      {/* Lead Capture Gate OR Full Breakdown */}
      <AnimatePresence mode="wait">
        {!leadSubmitted ? (
          <motion.div
            key="lead-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white border-2 border-primary/20 rounded-2xl p-6 space-y-5 shadow-md"
          >
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-text-primary">
                Get quotes from 3 verified installers who can install this exact system
              </h3>
              <p className="text-sm text-text-muted">
                100% free. No spam. 3 verified installers will contact you within 2 hours.
              </p>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="input-field w-full"
              />
              <input
                type="tel"
                placeholder="WhatsApp number (e.g. 08012345678)"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                required
                className="input-field w-full"
              />
              <select
                value={timeline}
                onChange={e => setTimeline(e.target.value)}
                className="select-field w-full"
                required
              >
                <option value="asap">Ready to install ASAP</option>
                <option value="1-3months">Within 1–3 months</option>
                <option value="researching">Just researching for now</option>
              </select>

              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-4 font-semibold text-base flex items-center justify-center gap-2"
              >
                {isSubmitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting you...</>
                  : "Show Full Breakdown + Connect Me with Installers →"
                }
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="breakdown"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Cost Breakdown Accordion */}
            <div className="border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowBreakdown(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors font-semibold text-text-primary"
              >
                <span>📊 Full Cost Breakdown</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showBreakdown ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showBreakdown && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 py-4 space-y-3 text-sm">
                      {[
                        { label: `Solar Panels (${systemSize.pvKwp}kWp)`,   band: costBreakdown.panels    },
                        { label: `Inverter (${systemSize.inverterSize})`,    band: costBreakdown.inverter  },
                        { label: `Batteries (${systemSize.batteryKwh}kWh)`, band: costBreakdown.batteries },
                        { label: "Wiring, mounting, BOS",                    band: costBreakdown.bos      },
                        { label: "Installation labour",                      band: costBreakdown.install  },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                          <span className="text-text-primary">{row.label}</span>
                          <span className="font-medium text-right tabular-nums text-text-muted">
                            {fmt(row.band.low)} – {fmt(row.band.high)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t-2 border-primary/30">
                        <span className="font-bold text-text-primary">Total</span>
                        <span className="font-bold text-primary tabular-nums">
                          {fmt(costs.low)} – {fmt(costs.high)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 5-Year Savings Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white text-center">
              <p className="text-sm font-semibold opacity-80 mb-1">Your 5-Year Net Savings</p>
              <p className="text-3xl font-bold">
                <AnimatedCounter target={savings.fiveYearSavings} prefix="₦" />
              </p>
              <p className="text-xs opacity-70 mt-1">After system cost, O&amp;M, and any battery replacement</p>
            </div>

            {/* Get Formal Quotes */}
            <a
              href={`/get-quotes?state=${state}`}
              className="btn-primary w-full py-4 font-semibold text-center block"
            >
              Get Firm Quotes from Verified Installers →
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assumptions Collapsible */}
      <div className="border border-border rounded-2xl overflow-hidden text-sm">
        <button
          onClick={() => setShowAssumptions(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-text-muted"
        >
          <span>How we calculated this</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showAssumptions ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {showAssumptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 py-4 space-y-2 text-text-muted">
                <p>🌞 Peak sun hours for {state}: <strong>{usage.peakSunHours} hrs/day</strong></p>
                <p>⚡ DISCO tariff used: <strong>₦200/kWh (NERC Band A avg)</strong></p>
                <p>🔋 Battery depth of discharge: <strong>{results.systemSize.batteryType === "lithium" ? "80%" : "50%"}</strong></p>
                <p>⛽ Petrol price assumption: <strong>₦{PETROL_PRICE_PER_LITRE.toLocaleString()}/L</strong></p>
                <p>🏭 System efficiency factor: <strong>80%</strong></p>
                <p className="text-xs pt-1 border-t border-border">Last updated: May 2026. Actual savings may vary.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fuel price note */}
      <p className="text-xs text-text-muted text-center">
        💡 Fuel price assumption: ₦{PETROL_PRICE_PER_LITRE.toLocaleString()}/L (petrol). Last updated: May 2026.
        Actual savings may vary.
      </p>

      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl border border-border text-text-muted text-sm hover:border-gray-400 transition-all"
      >
        ← Adjust my inputs
      </button>
    </div>
  );
}
