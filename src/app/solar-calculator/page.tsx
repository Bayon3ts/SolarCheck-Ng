"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { NIGERIAN_STATES } from "@/lib/validations";

const APPLIANCE_LIST = [
  { id: "tv", label: "Television", default: true },
  { id: "fan", label: "Fans", default: true },
  { id: "lighting", label: "Lighting", default: true },
  { id: "fridge", label: "Refrigerator / Freezer", default: false },
  { id: "ac", label: "Air Conditioner", default: false },
  { id: "water_pump", label: "Water Pump", default: false },
  { id: "washing_machine", label: "Washing Machine", default: false },
  { id: "microwave", label: "Microwave", default: false },
  { id: "water_heater", label: "Water Heater", default: false },
];

export default function CalculatorPage() {
  const [formData, setFormData] = useState({
    monthly_bill: 50000,
    state: "",
    phone: "",
    appliances: APPLIANCE_LIST.reduce((acc, curr) => {
      acc[curr.id] = curr.default;
      return acc;
    }, {} as Record<string, boolean>)
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    system_size: string;
    cost_min: number;
    cost_max: number;
    monthly_savings_vs_generator: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleAppliance = (id: string) => {
    setFormData(prev => ({
      ...prev,
      appliances: {
        ...prev.appliances,
        [id]: !prev.appliances[id]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/calculator/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.data);
      } else {
        setError(data.error || "Calculation failed");
      }
    } catch (err: unknown) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 pb-24">
        <div className="container-custom max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-text-primary md:text-5xl">
              Solar Cost Calculator
            </h1>
            <p className="mt-4 text-lg text-text-muted">
              Estimate your ideal system size and cost based on typical Nigerian power consumption.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Form Column */}
            <div className="lg:col-span-3 space-y-6">
              <div className="card p-8">
                <form id="calculator-form" onSubmit={handleSubmit} className="space-y-8">
                  {/* Bill Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-lg font-bold text-text-primary">
                        Estimated Monthly NEPA Bill
                      </label>
                      <span className="text-xl font-bold text-primary">
                        ₦{formData.monthly_bill.toLocaleString()}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="5000" 
                      max="500000" 
                      step="5000"
                      value={formData.monthly_bill}
                      onChange={(e) => setFormData({...formData, monthly_bill: Number(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-text-muted">
                      <span>₦5,000</span>
                      <span>₦500,000+</span>
                    </div>
                  </div>

                  <hr className="border-border" />

                  {/* Appliances Grid */}
                  <div className="space-y-4">
                    <label className="text-lg font-bold text-text-primary">
                      What do you want to power?
                    </label>
                    <p className="text-sm text-text-muted">
                      Select the main appliances you need to run during power outages.
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {APPLIANCE_LIST.map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => toggleAppliance(app.id)}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all text-left
                            ${formData.appliances[app.id] 
                              ? "border-primary bg-primary/10 text-primary-dark" 
                              : "border-border bg-white text-text-primary hover:border-gray-400"
                            }`}
                        >
                          {app.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-border" />

                  {/* Contact Info */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">State *</label>
                      <select 
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className="select-field w-full"
                        required
                      >
                        <option value="">Select State</option>
                        {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Phone (Optional)</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="08012345678"
                        className="input-field w-full"
                      />
                      <p className="text-xs text-text-muted">For a free follow-up consultation.</p>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                      {error}
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-6">
                <div className="card p-8 bg-primary-dark text-white shadow-xl relative overflow-hidden">
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                      <circle cx="12" cy="12" r="4"/>
                    </svg>
                  </div>

                  <h2 className="text-xl font-bold mb-6">Your Estimate</h2>

                  {result ? (
                    <div className="space-y-8 relative z-10">
                      <div>
                        <p className="text-sm text-white/70 uppercase tracking-wider mb-1">Recommended Size</p>
                        <p className="text-4xl font-bold text-accent">{result.system_size}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-white/70 uppercase tracking-wider mb-1">Estimated Cost</p>
                        <p className="text-2xl font-bold">
                          ₦{(result.cost_min / 1000000).toFixed(1)}M - ₦{(result.cost_max / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-xs text-white/50 mt-1 flex items-center gap-1">
                          <Info className="h-3 w-3" /> Includes panels, inverter, batteries & installation
                        </p>
                      </div>

                      <div className="pt-6 border-t border-white/20">
                        <Button variant="secondary" className="w-full text-primary-dark" asChild>
                          <Link href={`/get-quotes?state=${formData.state}&system_size=${result.system_size}`}>
                            Get Firm Quotes Now
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 relative z-10 text-white/50">
                      <div className="h-20 flex items-center">
                        <p className="text-sm italic">
                          Fill out the details and click calculate to see your estimate.
                        </p>
                      </div>
                      <div className="pt-6 border-t border-white/20">
                        <Button 
                          type="submit" 
                          form="calculator-form" 
                          variant="secondary" 
                          className="w-full text-primary-dark"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...</> : "Calculate Cost"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card p-6 bg-white">
                  <h3 className="font-bold text-text-primary mb-2">Why get a formal quote?</h3>
                  <p className="text-sm text-text-muted">
                    This calculator provides a rough estimate. Actual costs vary based on your roof structure, 
                    cable distances, and specific panel/battery brands. We recommend getting 3 firm quotes to compare.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
