"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import { CalculatorInputs, CalculatorResults } from "@/lib/calculator/types";
import AnimatedCounter from "@/components/animations/animated-counter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from "recharts";

interface Props {
  inputs: CalculatorInputs;
  results: CalculatorResults;
  onChange: (updates: Partial<CalculatorInputs>) => void;
  leadSubmitted: boolean;
  onLeadSubmit: (lead: { full_name: string; whatsapp: string; timeline: string; landlord_consent?: boolean }) => Promise<void>;
}

export default function CalcResultsView({ inputs, results, onChange, leadSubmitted, onLeadSubmit }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [seasonTab, setSeasonTab] = useState<'annual'|'rainy'|'dry'>('annual');
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  // Lead form state
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [timeline, setTimeline] = useState("asap");
  const [landlordConsent, setLandlordConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { 
    pvKwp, panelsNeeded, inverterKva, batteryKwh, batteryType,
    systemCostMin, systemCostMax, paybackMonths,
    fiveYearSavings, tenYearSavings,
    monthlyCurrentSpend, afterSolarMonthlyCost,
    monthlyProduction, avgPSH, discoTariff
  } = results;

  const isTenant = inputs.ownershipStatus === 'tenant';

  const formatMillions = (num: number) => {
    if (num >= 1_000_000) {
      return `₦${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    return `₦${num.toLocaleString('en-NG')}`;
  };

  // --- CHART DATA ---
  const barData = [
    { name: 'Before Solar', cost: monthlyCurrentSpend, fill: '#F5A623' },
    { name: 'After Solar', cost: afterSolarMonthlyCost, fill: '#0A5C36' },
  ];

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Calculate average daily usage based on target
  // We can derive target monthly usage from production or inputs
  // But let's just use monthlyCurrentSpend/discoTariff for total load or just show production
  // We'll approximate monthly usage based on average production (for simple visual)
  // Actually, we can use the inputs to calculate it exactly, but let's approximate
  const averageMonthlyUsage = (monthlyProduction.reduce((a, b) => a + b, 0) / 12) / (inputs.coveragePct / 100);

  const allMonthsData = MONTHS.map((m, i) => ({
    month: m,
    usage: averageMonthlyUsage,
    production: monthlyProduction[i],
  }));

  const areaData = seasonTab === 'annual' 
    ? allMonthsData 
    : seasonTab === 'rainy' 
      ? allMonthsData.slice(4, 10) // May-Oct
      : [...allMonthsData.slice(10, 12), ...allMonthsData.slice(0, 4)]; // Nov-Apr

  // --- HANDLERS ---
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
      {/* NEW SUBSIDY WARNING BLOCK */}
      {inputs.state === 'Lagos' && inputs.lagosElectricityBand && inputs.lagosElectricityBand !== 'band_a' && inputs.lagosElectricityBand !== 'none' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start mb-6">
          <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
          <div>
            <p className="font-bold text-amber-900 text-sm">
              Your electricity bill is heavily subsidised
            </p>
            <p className="text-amber-800 text-xs mt-1 leading-relaxed">
              The true cost of your electricity is ₦189.90/kWh. You currently pay ₦{results.discoTariff.toFixed(2)}/kWh — the government covers the ₦{(189.90 - results.discoTariff).toFixed(2)}/kWh gap (₦27.85bn/month nationally). NERC is actively transitioning to cost-reflective tariffs. When subsidies phase out, your monthly bill could increase by up to {Math.round((189.90 / results.discoTariff - 1) * 100)}%. Solar locks your energy cost at ₦0 permanently.
            </p>
            <p className="text-amber-600 text-xs mt-1">
              Source: ORDER/NERC/2025/050 — May 2025
            </p>
          </div>
        </div>
      )}

      {/* SECTION: SYSTEM & SAVINGS METRICS */}
      <div className="card p-6 md:p-8 space-y-6 shadow-sm border border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <span>📊</span> System and Savings Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Metrics */}
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-text-muted text-sm font-medium">Panels Needed</span>
              <div className="text-right">
                <span className="font-bold text-primary text-lg">{panelsNeeded} panels</span>
                <p className="text-xs text-gray-400">(400W panels)</p>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-text-muted text-sm font-medium">System Size</span>
              <span className="font-bold text-text-primary">{pvKwp.toFixed(1)} kWp / {inverterKva}kVA</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-text-muted text-sm font-medium">Battery</span>
              <span className="font-bold text-text-primary">{batteryKwh} kWh ({batteryType})</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 group relative cursor-help">
              <span className="text-text-muted text-sm font-medium border-b border-dashed border-gray-300">Payback Period</span>
              <span className="font-bold text-text-primary">{paybackMonths} months</span>
              <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                Time to recover installation cost through generator fuel & NEPA savings.
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-text-muted text-sm font-medium">5-Year Net Savings</span>
              <span className="font-bold text-green-600">
                <AnimatedCounter key={fiveYearSavings} target={fiveYearSavings} prefix="₦" />
              </span>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-6 text-center">
              <p className="text-sm text-text-muted mb-1">System cost range (incl. battery):</p>
              <p className="text-2xl font-bold text-primary">
                {formatMillions(systemCostMin)}–{formatMillions(systemCostMax)}
              </p>
            </div>
            
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm font-bold text-primary flex items-center gap-1 pt-4">
              {showAdvanced ? "Hide" : "Show"} Advanced Metrics <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-gray-50 rounded-lg p-4 space-y-2 text-sm mt-2">
                  <div className="flex justify-between"><span className="text-gray-500">Annual Production:</span> <span className="font-bold">{Math.round(monthlyProduction.reduce((a,b)=>a+b,0)).toLocaleString()} kWh</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Peak Sun Hours:</span> <span className="font-bold">{avgPSH.toFixed(2)} hrs/day</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">10-Year Savings:</span> <span className="font-bold text-green-600">₦{tenYearSavings.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">DISCO Tariff:</span> <span className="font-bold text-amber-600">₦{discoTariff}/kWh</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Monthly Current Spend:</span> <span className="font-bold">₦{monthlyCurrentSpend.toLocaleString()}</span></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Bar Chart */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-center text-text-primary mb-2">Monthly Energy Cost Comparison</h3>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#6B7280' }} />
                  <YAxis hide domain={[0, 'dataMax + 20000']} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    formatter={(value: unknown) => [`₦${Math.round(Number(value)).toLocaleString()}`, 'Cost']}
                  />
                  <Bar dataKey="cost" radius={[4, 4, 0, 0]} barSize={60}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center -mt-6">
                <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-md border border-green-100 text-sm font-bold text-green-700">
                  💚 You save ₦{Math.round(monthlyCurrentSpend - afterSolarMonthlyCost).toLocaleString('en-NG')}/mo
                </div>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
              <p className="text-sm text-text-muted mb-1">Monthly savings:</p>
              <p className="text-2xl font-bold text-primary">₦{Math.round(monthlyCurrentSpend - afterSolarMonthlyCost).toLocaleString('en-NG')}</p>
            </div>
          </div>
        </div>
      </div>


      {/* SECTION: MONTHLY PRODUCTION CHART */}
      <div className="card p-6 md:p-8 shadow-sm border border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span>☀️</span> Solar Generation vs Usage
        </h2>
        
        <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg self-start">
            {(['annual', 'rainy', 'dry'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSeasonTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${seasonTab === tab ? 'bg-white shadow text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="text-right text-xs space-y-1">
            <div className="flex items-center justify-end gap-2"><span className="w-3 h-3 bg-green-500 rounded-sm opacity-50"></span> Solar Production</div>
            <div className="flex items-center justify-end gap-2"><span className="w-3 h-3 bg-gray-400 rounded-sm opacity-30"></span> Electric Usage</div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `${val/1000}k`} />
              <Tooltip formatter={(value: unknown) => [`${Math.round(Number(value))} kWh`, '']} />
              <Area type="monotone" dataKey="usage" stroke="#9CA3AF" fill="#9CA3AF" fillOpacity={0.3} strokeWidth={2} isAnimationActive={false} />
              <Area type="monotone" dataKey="production" stroke="#0A5C36" fill="#0A5C36" fillOpacity={0.5} strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION: BATTERY BACKUP DETAILS */}
      <div className="card p-6 md:p-8 shadow-sm border border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <span>🔋</span> Battery Backup Strategy
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {([
            { id: 'surplus', label: 'Store surplus solar energy', desc: 'Most economic — charges during day' },
            { id: 'overnight', label: 'Cover overnight needs', desc: 'Typical Nigerian home requirement' },
            { id: 'specific', label: 'Full backup + appliances', desc: 'Adds cost, max reliability' },
            { id: 'none', label: 'No battery', desc: 'Grid-tied only' },
          ] as const).map(scen => (
            <button
              key={scen.id}
              onClick={() => onChange({ batteryScenario: scen.id, autonomyDays: scen.id === 'none' ? 0 : scen.id === 'overnight' ? 1 : 2 })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${inputs.batteryScenario === scen.id ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-gray-300'}`}
            >
              <div className="font-bold text-text-primary text-sm flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${inputs.batteryScenario === scen.id ? 'border-primary' : 'border-gray-300'}`}>
                  {inputs.batteryScenario === scen.id && <div className="w-2 h-2 bg-primary rounded-full" />}
                </div>
                {scen.label}
              </div>
              <p className="text-xs text-text-muted mt-1 ml-6">{scen.desc}</p>
            </button>
          ))}
        </div>

        {inputs.batteryScenario !== 'none' && (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-text-primary mb-1">Recommended Battery</p>
              <p className="text-xs text-text-muted">Based on your load and scenario</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl text-primary">{batteryKwh} kWh</p>
              <p className="text-xs font-semibold uppercase text-gray-500">{batteryType}</p>
            </div>
          </div>
        )}
      </div>

      {/* LEAD GATE */}
      <AnimatePresence mode="wait">
        {!leadSubmitted ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card border-2 border-primary/20 p-6 md:p-8 shadow-md">
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-xl font-bold text-text-primary">
                {isTenant ? "See Full Costs & Connect With Landlord Guides" : "See Full Cost Breakdown & Find Installers"}
              </h3>
              <p className="text-sm text-text-muted">Enter your WhatsApp to unlock the 10-year financial breakdown and connect with verified pros.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
              <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="input-field w-full" />
              <input type="tel" placeholder="WhatsApp Number" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required className="input-field w-full" />
              
              <select value={timeline} onChange={e => setTimeline(e.target.value)} className="select-field w-full" required>
                <option value="asap">Ready to install ASAP</option>
                <option value="1-3months">Within 1–3 months</option>
                <option value="researching">Just researching for now</option>
              </select>

              {isTenant && (
                <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                  <input type="checkbox" checked={landlordConsent} onChange={e => setLandlordConsent(e.target.checked)} className="mt-1 accent-primary" />
                  <span className="text-sm text-text-primary">I have discussed this with my landlord / have consent.</span>
                </label>
              )}

              {formError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg text-center">{formError}</p>}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-base font-bold flex justify-center items-center">
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin mr-2"/> Processing...</> : 
                  (isTenant ? "Help me talk to my landlord about solar →" : "See Full Results + Find Installers →")
                }
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* COST BREAKDOWN */}
            <div className="card p-6 shadow-sm border border-border">
              <button onClick={() => setShowBreakdown(!showBreakdown)} className="w-full flex justify-between items-center font-bold text-lg text-text-primary">
                <span>🧾 Full Cost Breakdown</span>
                <ChevronDown className={`transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showBreakdown && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden mt-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2"><span className="text-gray-500">System Capacity</span> <span className="font-medium">{pvKwp.toFixed(1)}kWp PV / {inverterKva}kVA Inverter / {Math.round(batteryKwh)}kWh Battery</span></div>
                      <div className="flex justify-between pt-2 font-bold text-base text-text-primary"><span>Total Estimated Range</span> <span className="text-primary">₦{systemCostMin.toLocaleString()} – ₦{systemCostMax.toLocaleString()}</span></div>
                      <div className="text-center text-xs text-gray-400 mt-2">10-Year Savings: ₦{tenYearSavings.toLocaleString()}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SECTION: CONNECT INSTALLERS */}
            <div className="card p-6 md:p-8 shadow-sm bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Connect With Verified Installers</h3>
                  <p className="text-orange-100 text-sm">We&apos;ve found 12 vetted pros in {inputs.state} who install {pvKwp.toFixed(1)}kW systems.</p>
                </div>
                <button className="bg-white text-orange-600 font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-orange-50 transition-colors shrink-0 w-full md:w-auto">
                  Compare Quotes Now →
                </button>
              </div>

              {/* Mock Installer Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
                    <div className="w-12 h-12 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-xl">🏢</div>
                    <h4 className="font-bold text-sm">Premium Solar {i}</h4>
                    <div className="text-xs text-orange-200 mt-1 mb-3">⭐⭐⭐⭐⭐ (24 reviews)</div>
                    <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors">Select Installer</button>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
