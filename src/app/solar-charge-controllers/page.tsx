'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { detectControllerFraud, ControllerClaim, FraudReport } from '@/lib/controller-fraud/detector';
import { ControllerFraudBadge } from '@/components/controller/fraud-badge';

export default function ChargeControllerCheckerPage() {
  const [claim, setClaim] = useState<Partial<ControllerClaim>>({
    claimedType: 'MPPT',
    batteryVoltage: 12,
    runsHot: 'cool',
  });
  const [report, setReport] = useState<FraudReport | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !claim.brand || 
      !claim.claimedType || 
      !claim.claimedAmperage || 
      !claim.pricePaidNaira || 
      !claim.totalPanelWattsSTC || 
      !claim.batteryVoltage || 
      !claim.runsHot
    ) {
      alert("Please fill all required fields");
      return;
    }

    const fullClaim: ControllerClaim = {
      brand: claim.brand,
      claimedType: claim.claimedType,
      claimedAmperage: Number(claim.claimedAmperage),
      pricePaidNaira: Number(claim.pricePaidNaira),
      totalPanelWattsSTC: Number(claim.totalPanelWattsSTC),
      batteryVoltage: claim.batteryVoltage,
      displayedChargingAmps: claim.displayedChargingAmps,
      runsHot: claim.runsHot,
    };

    const result = detectControllerFraud(fullClaim);
    setReport(result);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-28 pb-24">
        <div className="container-custom max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-border">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Charge Controller</h1>
            <p className="text-gray-600 mb-8">
              Verify if your charge controller&apos;s specs and price are authentic.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  list="controller-brands"
                  required
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={claim.brand || ''}
                  onChange={(e) => setClaim({ ...claim, brand: e.target.value })}
                  placeholder="e.g. EPever"
                />
                <datalist id="controller-brands">
                  <option value="Victron" />
                  <option value="EPever/EPSolar" />
                  <option value="Renogy" />
                  <option value="SRNE" />
                  <option value="Phocos" />
                  <option value="Generic/Unknown" />
                  <option value="Cheap/No brand" />
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Claimed Type</label>
                <div className="flex flex-wrap gap-4">
                  {(['MPPT', 'PWM', 'not_sure'] as const).map(type => (
                    <label key={type} className="flex items-center gap-2 text-sm text-gray-800">
                      <input 
                        type="radio" 
                        name="type" 
                        value={type} 
                        checked={claim.claimedType === type}
                        onChange={(e) => setClaim({ ...claim, claimedType: e.target.value as any })}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      {type === 'not_sure' ? 'Not Sure' : type}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Claimed Amperage (A)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={claim.claimedAmperage || ''}
                    onChange={(e) => setClaim({ ...claim, claimedAmperage: Number(e.target.value) })}
                    placeholder="e.g. 60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Paid (₦)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={claim.pricePaidNaira || ''}
                    onChange={(e) => setClaim({ ...claim, pricePaidNaira: Number(e.target.value) })}
                    placeholder="e.g. 45000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Panel Wattage Connected</label>
                <p className="text-xs text-gray-500 mb-2">Add up the wattage of every panel on this controller&apos;s array</p>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={claim.totalPanelWattsSTC || ''}
                  onChange={(e) => setClaim({ ...claim, totalPanelWattsSTC: Number(e.target.value) })}
                  placeholder="e.g. 1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Battery Voltage</label>
                <div className="flex gap-4">
                  {([12, 24, 48] as const).map(volts => (
                    <label key={volts} className="flex items-center gap-2 text-sm text-gray-800">
                      <input 
                        type="radio" 
                        name="voltage" 
                        value={volts} 
                        checked={claim.batteryVoltage === volts}
                        onChange={(e) => setClaim({ ...claim, batteryVoltage: Number(e.target.value) as any })}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      {volts}V
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Displayed Charging Current (A) - Optional</label>
                <p className="text-xs text-gray-500 mb-2">What does the unit show in strong midday sun?</p>
                <input
                  type="number"
                  step="0.1"
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={claim.displayedChargingAmps ?? ''}
                  onChange={(e) => setClaim({ ...claim, displayedChargingAmps: e.target.value === '' ? undefined : Number(e.target.value) })}
                  placeholder="e.g. 35.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thermal Behavior</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['cool', 'slightly_warm', 'hot', 'very_hot'] as const).map(therm => (
                    <label key={therm} className="flex items-center gap-2 text-sm text-gray-800">
                      <input 
                        type="radio" 
                        name="thermal" 
                        value={therm} 
                        checked={claim.runsHot === therm}
                        onChange={(e) => setClaim({ ...claim, runsHot: e.target.value as any })}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      {therm === 'slightly_warm' ? 'Slightly Warm' : therm === 'very_hot' ? 'Very Hot' : therm.charAt(0).toUpperCase() + therm.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-primary-dark transition-colors"
              >
                Run Verification Check
              </button>
            </form>

            {report && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Inspection Report</h2>
                <ControllerFraudBadge report={report} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
