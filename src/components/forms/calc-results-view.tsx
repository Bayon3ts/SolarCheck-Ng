'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { CalculatorResults, CalculatorInputs, LeadCaptureData } from '@/lib/calculator/types';

interface Props {
  results: CalculatorResults;
  inputs: CalculatorInputs;
  onChange?: (updates: Partial<CalculatorInputs>) => void;
  leadSubmitted?: boolean;
  onLeadSubmit: (data: LeadCaptureData) => Promise<void>;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmt(n: number) { return '₦' + Math.round(n).toLocaleString('en-NG'); }
function fmtM(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
}

// ── Shared badge helpers ─────────────────────────────────────────────────────

function SufficiencyBadge({ val }: { val: string }) {
  const map: Record<string, string> = {
    insufficient:        'bg-red-100 text-red-700',
    limited:             'bg-orange-100 text-orange-700',
    adequate:            'bg-blue-100 text-blue-700',
    strong:              'bg-green-100 text-green-700',
    full:                'bg-emerald-100 text-emerald-700',
    'daytime-optimized': 'bg-cyan-100 text-cyan-700',
  };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${map[val] ?? 'bg-gray-100 text-gray-600'}`}>
      {val === 'daytime-optimized' ? '☀️ Daytime Optimized' : val}
    </span>
  );
}

function QAVerdict({ verdict, score }: { verdict: string; score: number }) {
  const cfg =
    verdict === 'Physics-Accurate'     ? { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', icon: '✅' } :
    verdict === 'Installer-Conservative' ? { bg: 'bg-amber-50 border-amber-200',    text: 'text-amber-800',   icon: '⚠️' } :
                                           { bg: 'bg-red-50 border-red-200',          text: 'text-red-800',     icon: '❌' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.text}`}>
      {cfg.icon} {verdict} — {score}/100
    </span>
  );
}

// ── Section Card ─────────────────────────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = true }: {
  title: string; icon: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-bold text-text-primary flex items-center gap-2">
          <span className="text-lg">{icon}</span> {title}
        </h3>
        <span className="text-text-muted text-sm select-none">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

// ── Row in a detail table ─────────────────────────────────────────────────────
function Row({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className={`text-sm font-bold text-right ${accent ? 'text-primary' : 'text-text-primary'}`}>
        {value}
        {sub && <span className="text-xs font-normal text-text-muted ml-1">{sub}</span>}
      </span>
    </div>
  );
}

// ── Custom bar tooltip for recharts ──────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{value: number}>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-text-primary">{label}</p>
      <p className="text-primary font-bold">{Math.round(payload[0]?.value ?? 0).toLocaleString()} kWh</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CalcResultsView({ results, inputs, onLeadSubmit }: Props) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [timeline, setTimeline] = useState('ASAP');
  const [landlordConsent, setLandlordConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [leadDone, setLeadDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) {
      setFormError('Please enter your name and WhatsApp number.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      await onLeadSubmit({ full_name: name, whatsapp, timeline, landlord_consent: landlordConsent });
      setLeadDone(true);
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const r = results;
  const qa = r.truthQAReport;
  const cc = r.chargeController;
  const dt = r.daytimeAnalysis;

  // Monthly production chart data
  const chartData = useMemo(() =>
    MONTHS.map((month, i) => ({
      month,
      kWh: Math.round(r.monthlyProduction?.[i] ?? 0),
    })), [r.monthlyProduction]);

  const maxProduction = Math.max(...(r.monthlyProduction ?? [1]));
  // Rainy season months (Jun–Sep for most of Nigeria)
  const rainyMonths = new Set([5, 6, 7, 8]);

  const monthlySavings = (r.monthlyGridSavings?.expected ?? 0) + (r.monthlyGeneratorSavings?.expected ?? 0);
  const beforeVsAfter = r.monthlyCurrentSpend > 0
    ? ((monthlySavings / r.monthlyCurrentSpend) * 100).toFixed(0)
    : '0';

  return (
    <div className="space-y-4">

      {/* ── 1. HERO METRIC CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* PV Array */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-4">
          <div className="text-2xl mb-1">🔆</div>
          <div className="text-2xl font-black text-primary leading-none">{r.pvKwp.toFixed(2)}<span className="text-base font-semibold">kWp</span></div>
          <div className="text-xs text-text-muted mt-1">{r.panelsNeeded} × {r.panelSizeWatts}W panels</div>
          {r.panelTierLabel && (
            <div className="text-[10px] text-text-muted mt-0.5 leading-tight">{r.panelTierLabel}</div>
          )}
          <div className="mt-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              r.pvClassification === 'OPTIMAL'     ? 'bg-green-100 text-green-700' :
              r.pvClassification === 'OVER SIZED'  ? 'bg-amber-100 text-amber-700' :
                                                     'bg-red-100 text-red-700'
            }`}>{r.pvClassification}</span>
          </div>
        </div>

        {/* Inverter */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60 rounded-2xl p-4">
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-2xl font-black text-blue-700 leading-none">{r.inverterKva}<span className="text-base font-semibold">kVA</span></div>
          <div className="text-xs text-text-muted mt-1 capitalize">{inputs.systemMode} inverter</div>
          <div className="mt-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {r.inverterKva >= 5 ? 'Heavy duty' : 'Standard'}
            </span>
          </div>
        </div>

        {/* Battery */}
        <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-200/60 rounded-2xl p-4">
          <div className="text-2xl mb-1">🔋</div>
          <div className="text-2xl font-black text-violet-700 leading-none">{r.batteryKwh.toFixed(1)}<span className="text-base font-semibold">kWh</span></div>
          <div className="text-xs text-text-muted mt-1">LFP · 48V bank</div>
          <div className="mt-2"><SufficiencyBadge val={r.batterySufficiency} /></div>
        </div>

        {/* Night Autonomy */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 rounded-2xl p-4">
          <div className="text-2xl mb-1">🌙</div>
          <div className="text-2xl font-black text-slate-700 leading-none">{r.autonomyHours.toFixed(1)}<span className="text-base font-semibold">hrs</span></div>
          <div className="text-xs text-text-muted mt-1">Night autonomy</div>
          <div className="mt-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              r.autonomyHours >= 12 ? 'bg-green-100 text-green-700' :
              r.autonomyHours >= 8  ? 'bg-amber-100 text-amber-700' :
                                      'bg-red-100 text-red-700'
            }`}>{r.autonomyHours >= 12 ? 'All night' : r.autonomyHours >= 8 ? 'Most night' : 'Limited'}</span>
          </div>
          {r.autonomyNote && (
            <div className="mt-2 text-[10px] text-slate-500 leading-tight italic">
              Low night load → extends battery life
            </div>
          )}
        </div>
      </div>

      {/* ── 2. COST & SAVINGS HERO ──────────────────────────────────────────── */}
      {r.efficiencyRecommendations && r.efficiencyRecommendations.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <h4 className="text-emerald-800 font-bold mb-2 flex items-center gap-2">
            <span>💡</span> Optimization Tips
          </h4>
          <ul className="space-y-2">
            {r.efficiencyRecommendations.map((tip, idx) => (
              <li key={idx} className="text-sm text-emerald-700 leading-relaxed">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-gradient-to-br from-primary to-[#0D4A2A] rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm uppercase tracking-wide font-semibold">System Cost Range</p>
            <p className="text-3xl font-black mt-0.5">
              {fmtM(r.systemCostMin)} – {fmtM(r.systemCostMax)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-white/70 text-xs">5-Year Net Savings</p>
            <p className="text-xl font-black text-accent">{fmtM(r.fiveYearSavings?.expected ?? 0)}</p>
            <p className="text-white/50 text-[10px]">conservative {fmtM(r.fiveYearSavings?.conservative ?? 0)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-white/70 text-xs">10-Year Net Savings</p>
            <p className="text-xl font-black text-accent">{fmtM(r.tenYearSavings?.expected ?? 0)}</p>
            <p className="text-white/50 text-[10px]">conservative {fmtM(r.tenYearSavings?.conservative ?? 0)}</p>
          </div>
        </div>

        {r.validationError && (
          <div className="mt-3 bg-red-500/20 border border-red-400/40 rounded-xl p-3 text-sm text-red-100">
            ⚠️ {r.validationError.replace('WARNINGS IN SYSTEM DESIGN\n\n', '')}
          </div>
        )}
      </div>

      {/* ── 3. MONTHLY SAVINGS BREAKDOWN ────────────────────────────────────── */}
      <Section title="Monthly Cost Impact" icon="💰">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <p className="text-xs text-text-muted mb-1">Before Solar</p>
            <p className="text-2xl font-black text-red-600">{fmt(r.monthlyCurrentSpend)}</p>
            <p className="text-xs text-text-muted">per month</p>
          </div>
          <div className="flex-shrink-0 text-2xl text-text-muted font-light">→</div>
          <div className="text-center flex-1">
            <p className="text-xs text-text-muted mb-1">You Save</p>
            <p className="text-2xl font-black text-emerald-600">{beforeVsAfter}%</p>
            <p className="text-xs font-semibold text-emerald-600">{fmt(monthlySavings)}/mo</p>
          </div>
        </div>

        {/* Visual bar comparison */}
        <div className="flex gap-2 h-16 items-end mb-3">
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-xl bg-red-400" style={{ height: '100%' }} />
            <span className="text-xs text-text-muted">Before</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-xl bg-emerald-400"
              style={{ height: `${r.monthlyCurrentSpend > 0 ? (monthlySavings / r.monthlyCurrentSpend) * 100 : 30}%` }} />
            <span className="text-xs text-text-muted">Savings</span>
          </div>
        </div>

        <div className="space-y-0 divide-y divide-gray-100">
          <Row label="NEPA bill saved (expected)" value={fmt(r.monthlyGridSavings?.expected ?? 0)} accent />
          <Row label="Generator savings (expected)" value={fmt(r.monthlyGeneratorSavings?.expected ?? 0)} accent />
          <Row label="Conservative total saving" value={fmt((r.monthlyGridSavings?.conservative ?? 0) + (r.monthlyGeneratorSavings?.conservative ?? 0))} />
          <Row label="Stress-case saving" value={fmt((r.monthlyGridSavings?.stressCase ?? 0) + (r.monthlyGeneratorSavings?.stressCase ?? 0))} />
          <Row label="Current monthly spend" value={fmt(r.monthlyCurrentSpend)} />
          {r.discoName && <Row label="DISCO" value={r.discoName} />}
          {r.discoTariff > 0 && <Row label="Grid tariff" value={`₦${r.discoTariff}/kWh`} />}
          {r.selectedBand && <Row label="Lagos band" value={`Band ${r.selectedBand}`} />}
        </div>
      </Section>

      {/* ── 4. MONTHLY SOLAR PRODUCTION ─────────────────────────────────────── */}
      <Section title="Monthly Solar Generation" icon="☀️">
        <p className="text-sm text-text-muted mb-4">
          Annual production: <strong>{Math.round((r.monthlyProduction?.reduce((a, b) => a + b, 0) ?? 0)).toLocaleString()} kWh</strong>
          &nbsp;·&nbsp; Avg PSH: <strong>{r.avgPSH?.toFixed(1)} hrs/day</strong>
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(10,92,54,0.05)' }} />
            <Bar dataKey="kWh" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={rainyMonths.has(i) ? '#F59E0B' : '#0A5C36'}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="w-3 h-3 rounded-sm bg-primary inline-block" /> Dry season
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Rainy season
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
          <span className={`font-semibold ${r.seasonalRisk === 'Rainy season stable' ? 'text-green-600' : r.seasonalRisk === 'Rainy season borderline' ? 'text-amber-600' : 'text-red-600'}`}>
            {r.seasonalRisk === 'Rainy season stable' ? '✅' : r.seasonalRisk === 'Rainy season borderline' ? '⚠️' : '❌'} {r.seasonalRisk}
          </span>
          <span>Max monthly: {Math.round(maxProduction).toLocaleString()} kWh</span>
          <span>Min monthly: {Math.round(Math.min(...(r.monthlyProduction ?? [0]))).toLocaleString()} kWh</span>
        </div>
      </Section>

      {/* ── 5. ENGINEERING DETAILS ──────────────────────────────────────────── */}
      <Section title="Engineering Details" icon="🔧">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">PV Array</p>
            <div className="space-y-0 divide-y divide-gray-100 mb-4">
              <Row label="Array size" value={`${r.pvKwp.toFixed(2)} kWp`} accent />
              <Row label="Panels" value={`${r.panelsNeeded} × ${r.panelSizeWatts}W`} />
              {r.panelTierLabel && (
                <Row label="Panel tier" value={<span className="text-xs text-text-muted">{r.panelTierLabel}</span>} />
              )}
              <Row label="Classification" value={
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  r.pvClassification === 'OPTIMAL' ? 'bg-green-100 text-green-700' :
                  r.pvClassification === 'OVER SIZED' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>{r.pvClassification}</span>
              } />
              <Row label="Avg PSH" value={`${r.avgPSH?.toFixed(1)} hrs/day`} />
              <Row 
                label="Required roof space" 
                value={<span title="Includes a 25% safety buffer for structural paths and panel spacing.">{r.totalRequiredAreaSqM} m²</span>} 
              />
              <Row label="Coverage target" value={`${r.energyOffsetPct}%`} />
              <Row label="Daily load" value={`${r.dailyLoadKwh?.toFixed(2)} kWh`} />
              <Row label="Peak load" value={`${r.peakLoadKw?.toFixed(2)} kW`} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Inverter & Battery</p>
            <div className="space-y-0 divide-y divide-gray-100 mb-4">
              <Row label="Inverter" value={`${r.inverterKva} kVA`} accent />
              <Row label="Battery" value={`${r.batteryKwh.toFixed(1)} kWh`} accent />
              <Row label="Battery sufficiency" value={<SufficiencyBadge val={r.batterySufficiency} />} />
              <Row label="Night autonomy" value={`${r.autonomyHours.toFixed(1)} hrs`} />
              <Row label="System mode" value={<span className="capitalize">{inputs.systemMode}</span>} />
              <Row label="Load daily (kWh)" value={r.dailyLoadKwh.toFixed(2)} />
            </div>
            {r.autonomyNote && (
              <div className="mt-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">
                <span className="font-semibold">ℹ️ Why {r.autonomyHours.toFixed(1)} hours?</span><br />
                {r.autonomyNote}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* ── 6. CHARGE CONTROLLER ────────────────────────────────────────────── */}
      {cc && cc.type !== 'None' && (
        <Section title="Charge Controller Required" icon="🎛️">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-xl p-4 text-center min-w-[100px]">
              <p className="text-2xl font-black text-primary">{cc.type}</p>
              <p className="text-xs text-text-muted">{cc.amps}A</p>
              <p className="text-sm font-bold text-primary mt-1">{fmtM(cc.estimatedCost)}</p>
            </div>
            <p className="text-sm text-text-muted leading-relaxed flex-1">{cc.reason}</p>
          </div>
        </Section>
      )}
      {cc && cc.type === 'None' && (
        <Section title="Charge Controller" icon="🎛️" defaultOpen={false}>
          <p className="text-sm text-text-muted">{cc.reason}</p>
        </Section>
      )}

      {/* ── 7. DAYTIME ANALYSIS ─────────────────────────────────────────────── */}
      {dt?.isDaytimeHeavy && (
        <Section title="Daytime-Heavy Load Detected" icon="🌤️">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">
              {(dt.daytimeRatio * 100).toFixed(0)}% of your load runs during daylight hours
            </p>
            <p className="text-sm text-amber-700">
              Recommended panel array: <strong>{dt.recommendedPanelKw.toFixed(1)} kWp</strong> for direct daytime use,
              smaller battery of <strong>{dt.recommendedNightBatteryKwh.toFixed(1)} kWh</strong> covering only night essentials.
            </p>
          </div>
          {dt.recommendedInverterNote && (
            <p className="text-sm text-text-muted leading-relaxed">{dt.recommendedInverterNote}</p>
          )}
          {dt.requiresMultipleMppt && dt.panelStringSplit && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
              ⚡ Multi-MPPT required: {dt.mpptInputsNeeded} inputs · Panel split: {dt.panelStringSplit}
            </div>
          )}
        </Section>
      )}

      {/* ── 8. ENVIRONMENTAL IMPACT ─────────────────────────────────────────── */}
      <Section title="Environmental Impact" icon="🌱">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-emerald-700">
              {r.co2SavedKgPerYear >= 1000
                ? `${(r.co2SavedKgPerYear / 1000).toFixed(1)}t`
                : `${Math.round(r.co2SavedKgPerYear)}kg`}
            </p>
            <p className="text-xs text-emerald-600 mt-1">CO₂ saved per year</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-black text-green-700">{r.treesEquivalent}</p>
            <p className="text-xs text-green-600 mt-1">trees planted equivalent</p>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-3 text-center">
          Based on Nigeria grid emission factor of 0.43 kg CO₂/kWh
        </p>
      </Section>

      {/* ── 9. QA TRUTH REPORT ──────────────────────────────────────────────── */}
      <Section title="Engineering QA Report" icon="🛡️" defaultOpen={false}>
        <div className="mb-4">
          <QAVerdict verdict={qa.finalVerdict} score={qa.score} />
        </div>

        {/* Score bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-text-muted mb-1">
            <span>Physics accuracy score</span><span>{qa.score}/100</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                qa.score >= 85 ? 'bg-emerald-500' : qa.score >= 50 ? 'bg-amber-400' : 'bg-red-500'
              }`}
              style={{ width: `${qa.score}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'PV Array', val: qa.pvStatus },
            { label: 'Battery', val: qa.batteryIntegrity },
            { label: 'Savings', val: qa.savingsIntegrity },
          ].map(({ label, val }) => {
            const good = ['OPTIMAL', 'PASS'].includes(val);
            const warn = ['CONSERVATIVE', 'BORDERLINE', 'INFLATED'].includes(val);
            return (
              <div key={label} className={`rounded-xl border p-3 text-center text-xs ${
                good ? 'bg-green-50 border-green-100' : warn ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'
              }`}>
                <p className="text-text-muted mb-1">{label}</p>
                <p className={`font-bold ${good ? 'text-green-700' : warn ? 'text-amber-700' : 'text-red-700'}`}>{val}</p>
              </div>
            );
          })}
        </div>

        {qa.warnings.length > 0 && (
          <div className="space-y-2">
            {qa.warnings.map((w, i) => (
              <div key={i} className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-3">
                ⚠️ {w}
              </div>
            ))}
          </div>
        )}

        {qa.flags.pvBias && (
          <p className="text-xs text-red-600 mt-2">
            🚩 PV array may be oversized relative to load — consider reducing for better ROI.
          </p>
        )}
      </Section>

      {/* ── 10. LEAD CAPTURE FORM ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {leadDone ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-text-primary mb-2">You&apos;re on the list!</h3>
            <p className="text-sm text-text-muted">
              A certified solar engineer will contact you on WhatsApp within 24 hours.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-5">
              <h3 className="text-xl font-bold text-text-primary mb-1">Get Your Custom Quote</h3>
              <p className="text-sm text-text-muted">
                A certified solar engineer will contact you with a detailed proposal based on this sizing.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
              {formError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Chinedu Okafor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="e.g. 08012345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Installation Timeline</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  value={timeline}
                  onChange={e => setTimeline(e.target.value)}
                >
                  <option value="ASAP">As soon as possible</option>
                  <option value="1_month">Within 1 month</option>
                  <option value="3_months">Within 3 months</option>
                  <option value="Just_researching">Just researching</option>
                </select>
              </div>

              {inputs.ownershipStatus === 'tenant' && (
                <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="consent"
                    className="mt-1 accent-primary"
                    checked={landlordConsent}
                    onChange={e => setLandlordConsent(e.target.checked)}
                  />
                  <label htmlFor="consent" className="text-sm text-gray-700">
                    I confirm I have (or can get) my landlord&apos;s consent to install solar panels.
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || (inputs.ownershipStatus === 'tenant' && !landlordConsent)}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : 'Get My Installer Quotes →'}
              </button>

              <p className="text-xs text-center text-text-muted">
                Free service · No spam · Only contacted about your solar request
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
