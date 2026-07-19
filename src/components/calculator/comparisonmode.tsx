"use client";

import { useMemo } from "react";
import { calculateSolarSystem } from "@/lib/calculator/calculations";
import { CalculatorInputs } from "@/lib/calculator/types";

interface Props {
    inputs: CalculatorInputs;
    onSelectTier: (tier: "budget" | "balanced" | "premium") => void;
    selectedTier: "budget" | "balanced" | "premium";
}

function fmt(n: number) {
    return "₦" + Math.round(n).toLocaleString("en-NG");
}
function fmtM(n: number) {
    if (n >= 1_000_000) return "₦" + (n / 1_000_000).toFixed(1) + "M";
    return "₦" + Math.round(n / 1000) + "k";
}

const TIERS = [
    {
        id: "budget" as const,
        label: "Budget",
        emoji: "💰",
        description: "Lower upfront cost, some grid reliance",
        color: "border-slate-200 bg-slate-50",
        activeColor: "border-blue-400 bg-blue-50",
        badgeColor: "bg-slate-100 text-slate-600",
        activeBadgeColor: "bg-blue-100 text-blue-700",
        overrides: {
            coveragePct: 80,
            autonomyDays: 0.5,
            optimizationMode: "budget_conscious" as const,
        },
    },
    {
        id: "balanced" as const,
        label: "Balanced",
        emoji: "⚖️",
        description: "Best value — our recommendation",
        color: "border-[#1A5C38]/30 bg-green-50",
        activeColor: "border-[#1A5C38] bg-green-50",
        badgeColor: "bg-green-100 text-green-700",
        activeBadgeColor: "bg-green-200 text-green-800",
        recommended: true,
        overrides: {
            coveragePct: 100,
            autonomyDays: 1,
            optimizationMode: "maximum_protection" as const,
        },
    },
    {
        id: "premium" as const,
        label: "Premium",
        emoji: "⭐",
        description: "Near-full independence, future-proof",
        color: "border-amber-200 bg-amber-50",
        activeColor: "border-amber-400 bg-amber-50",
        badgeColor: "bg-amber-100 text-amber-700",
        activeBadgeColor: "bg-amber-200 text-amber-800",
        overrides: {
            coveragePct: 100,
            autonomyDays: 2,
            optimizationMode: "maximum_protection" as const,
        },
    },
];

export default function ComparisonMode({ inputs, onSelectTier, selectedTier }: Props) {
    const results = useMemo(() => {
        return TIERS.map((tier) => {
            try {
                const r = calculateSolarSystem({ ...inputs, ...tier.overrides });
                return { tier, result: r };
            } catch {
                return { tier, result: null };
            }
        });
    }, [inputs]);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <span>⚖️</span> Compare Your Options
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                    Same load, different trade-offs. Tap to select your preferred system.
                </p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-gray-100">
                {results.map(({ tier, result }) => {
                    const isSelected = selectedTier === tier.id;
                    const r = result;
                    if (!r) return null;

                    return (
                        <button
                            key={tier.id}
                            onClick={() => onSelectTier(tier.id)}
                            className={`text-left p-4 transition-all relative ${isSelected ? tier.activeColor : tier.color
                                } ${isSelected ? "ring-2 ring-inset ring-current" : ""}`}
                        >
                            {tier.recommended && (
                                <div className="absolute top-2 right-2 text-[9px] font-black bg-[#1A5C38] text-white px-1.5 py-0.5 rounded-full">
                                    BEST
                                </div>
                            )}

                            <div className="text-lg mb-1">{tier.emoji}</div>
                            <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-2 ${isSelected ? tier.activeBadgeColor : tier.badgeColor
                                }`}>
                                {tier.label}
                            </div>

                            <p className="text-[10px] text-slate-500 mb-3 leading-tight">
                                {tier.description}
                            </p>

                            {/* Key specs */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400">Solar</span>
                                    <span className="text-xs font-bold text-slate-700">
                                        {r.pvKwp?.toFixed(1)}kWp
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400">Inverter</span>
                                    <span className="text-xs font-bold text-slate-700">
                                        {r.inverterKva}kVA
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400">Battery</span>
                                    <span className="text-xs font-bold text-slate-700">
                                        {r.batteryKwh}kWh
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400">Night</span>
                                    <span className="text-xs font-bold text-slate-700">
                                        {r.nightLoadKwh > 0 ? `${Math.min(r.autonomyHours, 12).toFixed(0)}hrs` : 'Full'}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-current/10 mt-3 pt-3">
                                <div className="text-[10px] text-slate-400 mb-0.5">Cost range</div>
                                <div className="text-sm font-black text-slate-800">
                                    {fmtM(r.systemCostMin)}–{fmtM(r.systemCostMax)}
                                </div>
                                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                    Saves {fmtM((r.fiveYearSavings?.expected ?? 0))} in 5yr
                                </div>
                            </div>

                            {/* Grid reliance indicator */}
                            <div className="mt-3">
                                <div className="text-[10px] text-slate-400 mb-1">Grid reliance</div>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`h-1.5 flex-1 rounded-full ${tier.id === 'budget' ? (i <= 4 ? 'bg-blue-400' : 'bg-slate-200') :
                                                tier.id === 'balanced' ? (i <= 2 ? 'bg-green-500' : 'bg-slate-200') :
                                                    (i <= 1 ? 'bg-amber-400' : 'bg-slate-200')
                                            }`} />
                                    ))}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                    {tier.id === 'budget' ? 'High' : tier.id === 'balanced' ? 'Low-Medium' : 'Very Low'}
                                </div>
                            </div>

                            {isSelected && (
                                <div className="mt-3 text-[10px] font-bold text-center py-1 rounded-lg bg-current/10 text-current">
                                    ✓ Selected
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}