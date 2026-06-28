"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { detectBatteryFraud, BatteryClaim, FraudReport } from "@/lib/battery-fraud/detector";
import { CHEMISTRY_PROFILES } from "@/lib/battery-fraud/chemistry-profiles";

export default function CheckBatteryPage() {
  const [claim, setClaim] = useState<Partial<BatteryClaim>>({
    chemistry: "LFP",
    capacityKwh: 0,
    claimedDod: 80,
  });
  const [report, setReport] = useState<FraudReport | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim.chemistry || !claim.capacityKwh || !claim.claimedDod) return;

    const fullClaim: BatteryClaim = {
      chemistry: claim.chemistry,
      capacityKwh: Number(claim.capacityKwh),
      claimedDod: Number(claim.claimedDod),
      claimedUsableKwh: claim.claimedUsableKwh ? Number(claim.claimedUsableKwh) : undefined,
      claimedRtEff: claim.claimedRtEff ? Number(claim.claimedRtEff) : undefined,
      weightKg: claim.weightKg ? Number(claim.weightKg) : undefined,
      claimedAutonomyHours: claim.claimedAutonomyHours ? Number(claim.claimedAutonomyHours) : undefined,
      claimedLoadKw: claim.claimedLoadKw ? Number(claim.claimedLoadKw) : undefined,
      cycleLife: claim.cycleLife ? Number(claim.cycleLife) : undefined,
    };

    setReport(detectBatteryFraud(fullClaim));
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 pb-24">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-text-primary md:text-4xl">
              Battery Spec Checker
            </h1>
            <p className="mt-2 text-text-muted">
              Enter the specifications from the battery&apos;s sticker or datasheet to check if they are physically possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Chemistry *</label>
                  <select
                    className="select-field w-full"
                    value={claim.chemistry}
                    onChange={(e) => setClaim({ ...claim, chemistry: e.target.value })}
                    required
                  >
                    {Object.values(CHEMISTRY_PROFILES).map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Nominal Capacity (kWh) *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field w-full"
                    value={claim.capacityKwh || ""}
                    onChange={(e) => setClaim({ ...claim, capacityKwh: e.target.value ? Number(e.target.value) : undefined })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Claimed DoD (%) *</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={claim.claimedDod || ""}
                    onChange={(e) => setClaim({ ...claim, claimedDod: e.target.value ? Number(e.target.value) : undefined })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      className="input-field w-full"
                      value={claim.weightKg || ""}
                      onChange={(e) => setClaim({ ...claim, weightKg: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Usable Capacity (kWh)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field w-full"
                      value={claim.claimedUsableKwh || ""}
                      onChange={(e) => setClaim({ ...claim, claimedUsableKwh: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Round-trip Eff (%)</label>
                    <input
                      type="number"
                      className="input-field w-full"
                      value={claim.claimedRtEff || ""}
                      onChange={(e) => setClaim({ ...claim, claimedRtEff: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Cycle Life</label>
                    <input
                      type="number"
                      className="input-field w-full"
                      value={claim.cycleLife || ""}
                      onChange={(e) => setClaim({ ...claim, cycleLife: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Autonomy (Hours)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field w-full"
                      value={claim.claimedAutonomyHours || ""}
                      onChange={(e) => setClaim({ ...claim, claimedAutonomyHours: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">At Load (kW)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field w-full"
                      value={claim.claimedLoadKw || ""}
                      onChange={(e) => setClaim({ ...claim, claimedLoadKw: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full mt-4">
                  Run Physics Check
                </Button>
              </form>
            </div>

            {/* Results Panel */}
            <div className="card p-8 bg-white border-2 border-gray-100">
              {!report ? (
                <div className="h-full flex flex-col items-center justify-center text-text-muted space-y-4 py-12">
                  <ShieldAlert className="w-16 h-16 opacity-20" />
                  <p>Enter battery specs to run the fraud check.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Verdict Header */}
                  <div className={`p-4 rounded-xl flex items-start gap-4 ${
                    report.verdict === 'CLEAN' ? 'bg-green-50 text-green-900' :
                    report.verdict === 'SUSPICIOUS' ? 'bg-amber-50 text-amber-900' :
                    'bg-red-50 text-red-900'
                  }`}>
                    {report.verdict === 'CLEAN' ? (
                      <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
                    ) : (
                      <AlertTriangle className={`w-8 h-8 shrink-0 ${report.verdict === 'SUSPICIOUS' ? 'text-amber-600' : 'text-red-600'}`} />
                    )}
                    <div>
                      <h3 className="font-bold text-lg mb-1">{report.verdict}</h3>
                      <p className="text-sm opacity-90">
                        Fraud Score: {report.fraudScore}/100
                      </p>
                    </div>
                  </div>

                  {/* Physics Details */}
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                    <div>
                      <div className="text-xs text-text-muted uppercase tracking-wider mb-1">True Usable Energy</div>
                      <div className="font-bold text-xl">{report.correctedUsableKwh.toFixed(1)} kWh</div>
                    </div>
                    {report.correctedAutonomyHours && (
                      <div>
                        <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Real Autonomy</div>
                        <div className="font-bold text-xl">{report.correctedAutonomyHours.toFixed(1)} hrs</div>
                      </div>
                    )}
                  </div>

                  {/* Flags */}
                  {report.flags.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-text-primary text-sm uppercase tracking-wider">Detection Flags</h4>
                      <div className="space-y-2">
                        {report.flags.map((flag, i) => (
                          <div key={i} className={`p-3 rounded-lg text-sm border-l-4 ${
                            flag.severity === 'critical' ? 'bg-red-50 border-red-500 text-red-900' :
                            flag.severity === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-900' :
                            'bg-blue-50 border-blue-500 text-blue-900'
                          }`}>
                            <span className="font-bold text-xs uppercase opacity-75 block mb-1">{flag.code}</span>
                            {flag.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conversion CTA */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-text-muted mb-4">
                      {report.verdict === 'CLEAN' 
                        ? 'This battery looks legitimate based on physics, but buying from an unverified seller is still a risk.' 
                        : 'Don\'t get scammed. Our verified installers only source genuine equipment with warranties.'}
                    </p>
                    <Button asChild variant="primary" className="w-full">
                      <Link href={`/get-quotes?source=battery_${report.verdict.toLowerCase().replace(' ', '_')}`}>
                        Get Quotes from Verified Installers <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
