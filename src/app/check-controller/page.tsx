"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { detectControllerFraud, ControllerClaim, FraudReport } from "@/lib/controller-fraud/detector";

export default function CheckControllerPage() {
  const [claim, setClaim] = useState<Partial<ControllerClaim>>({
    brand: "",
    claimedType: "MPPT",
    claimedAmperage: 0,
    pricePaidNaira: 0,
    totalPanelWattsSTC: 0,
    batteryVoltage: 12,
  });
  const [report, setReport] = useState<FraudReport | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim.brand || !claim.claimedAmperage || !claim.pricePaidNaira || !claim.totalPanelWattsSTC || !claim.batteryVoltage) return;

    const fullClaim: ControllerClaim = {
      brand: claim.brand,
      claimedType: claim.claimedType as 'MPPT' | 'PWM' | 'not_sure',
      claimedAmperage: Number(claim.claimedAmperage),
      pricePaidNaira: Number(claim.pricePaidNaira),
      totalPanelWattsSTC: Number(claim.totalPanelWattsSTC),
      batteryVoltage: Number(claim.batteryVoltage) as 12 | 24 | 48,
      displayedChargingAmps: claim.displayedChargingAmps ? Number(claim.displayedChargingAmps) : undefined,
      runsHot: claim.runsHot,
    };

    setReport(detectControllerFraud(fullClaim));
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 pb-24">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-text-primary md:text-4xl">
              Charge Controller Spec Checker
            </h1>
            <p className="mt-2 text-text-muted">
              Check if a charge controller is genuine MPPT and correctly sized for your array.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Brand Name *</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={claim.brand || ""}
                    onChange={(e) => setClaim({ ...claim, brand: e.target.value })}
                    required
                    placeholder="e.g. EPever, Victron, generic"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Claimed Type *</label>
                    <select
                      className="select-field w-full"
                      value={claim.claimedType}
                      onChange={(e) => setClaim({ ...claim, claimedType: e.target.value as any })}
                      required
                    >
                      <option value="MPPT">MPPT</option>
                      <option value="PWM">PWM</option>
                      <option value="not_sure">Not Sure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Price Paid (₦) *</label>
                    <input
                      type="number"
                      className="input-field w-full"
                      value={claim.pricePaidNaira || ""}
                      onChange={(e) => setClaim({ ...claim, pricePaidNaira: e.target.value ? Number(e.target.value) : undefined })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Claimed Amps (A) *</label>
                    <input
                      type="number"
                      className="input-field w-full"
                      value={claim.claimedAmperage || ""}
                      onChange={(e) => setClaim({ ...claim, claimedAmperage: e.target.value ? Number(e.target.value) : undefined })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Battery Voltage *</label>
                    <select
                      className="select-field w-full"
                      value={claim.batteryVoltage}
                      onChange={(e) => setClaim({ ...claim, batteryVoltage: Number(e.target.value) as any })}
                      required
                    >
                      <option value="12">12V</option>
                      <option value="24">24V</option>
                      <option value="48">48V</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Total Panel Watts (STC) *</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    value={claim.totalPanelWattsSTC || ""}
                    onChange={(e) => setClaim({ ...claim, totalPanelWattsSTC: e.target.value ? Number(e.target.value) : undefined })}
                    required
                    placeholder="e.g. 1100 for 2x 550W panels"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Displayed Amps (Optional)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field w-full"
                      value={claim.displayedChargingAmps || ""}
                      onChange={(e) => setClaim({ ...claim, displayedChargingAmps: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="In strong sun"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Thermal Behavior</label>
                    <select
                      className="select-field w-full"
                      value={claim.runsHot || ""}
                      onChange={(e) => setClaim({ ...claim, runsHot: e.target.value ? e.target.value as any : undefined })}
                    >
                      <option value="">Don't know</option>
                      <option value="cool">Cool</option>
                      <option value="slightly_warm">Slightly Warm</option>
                      <option value="hot">Hot</option>
                      <option value="very_hot">Very Hot (Dangerous)</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full mt-4">
                  Run Market & Physics Check
                </Button>
              </form>
            </div>

            {/* Results Panel */}
            <div className="card p-8 bg-white border-2 border-gray-100">
              {!report ? (
                <div className="h-full flex flex-col items-center justify-center text-text-muted space-y-4 py-12">
                  <ShieldAlert className="w-16 h-16 opacity-20" />
                  <p>Enter controller specs to run the fraud check.</p>
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
                      <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Max Real Amps</div>
                      <div className="font-bold text-xl">{report.correctedMaxAmps} A</div>
                    </div>
                    <div>
                      <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Detected Type</div>
                      <div className="font-bold text-xl">{report.typeDetected}</div>
                    </div>
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
                        ? 'This controller looks correctly priced and specified, but verifying the seller is still important.' 
                        : 'Don\'t risk a fire or damaged batteries. Connect with a verified installer for reliable equipment.'}
                    </p>
                    <Button asChild variant="primary" className="w-full">
                      <Link href={`/get-quotes?source=controller_${report.verdict.toLowerCase().replace(' ', '_')}`}>
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
