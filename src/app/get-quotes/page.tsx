"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { NIGERIAN_STATES, MONTHLY_BILL_RANGES, SYSTEM_SIZES } from "@/lib/validations";

function GetQuotesForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from URL params
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    whatsapp: searchParams.get("whatsapp") || "",
    email: "",
    state: searchParams.get("state") || "",
    city: searchParams.get("city") || "",
    monthly_bill_range: searchParams.get("monthly_bill_range") || "",
    system_size_interest: searchParams.get("system_size") || "",
    ownership_status: "own",
    timeline: "asap",
    message: "",
    lead_type: searchParams.get("installer") ? "exclusive" : "shared",
    installer_id: searchParams.get("installer") || undefined,
  });

  const handleNext = () => setStep((p) => p + 1);
  const handleBack = () => setStep((p) => p - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
      } else {
        setError(data.error || "Failed to submit request");
      }
    } catch (err: unknown) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isSuccess) {
    return (
      <div className="card max-w-2xl mx-auto p-12 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-text-primary mb-4">Request Received!</h2>
        <p className="text-lg text-text-muted mb-8">
          We&apos;ve sent your details to our verified installers. They will contact you shortly via WhatsApp or Phone call to provide your free quotes.
        </p>
        <Button asChild variant="primary" size="lg">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary md:text-4xl text-center">
          Get Your Free Solar Quotes
        </h1>
        <p className="mt-2 text-text-muted text-center">
          Takes less than 60 seconds. No obligation.
        </p>
        
        {/* Progress Bar */}
        <div className="mt-8 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: Location & Energy Needs */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h3 className="text-xl font-bold text-text-primary mb-6">Energy Requirements</h3>
                
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">State *</label>
                    <select 
                      value={formData.state} 
                      onChange={(e) => updateField("state", e.target.value)}
                      className="select-field w-full"
                      required
                    >
                      <option value="">Select State</option>
                      {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">City / Area *</label>
                    <input 
                      type="text" 
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="e.g. Lekki, Ikeja"
                      className="input-field w-full"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Average Monthly Electricity Bill *</label>
                  <select 
                    value={formData.monthly_bill_range}
                    onChange={(e) => updateField("monthly_bill_range", e.target.value)}
                    className="select-field w-full"
                    required
                  >
                    <option value="">Select range</option>
                    {MONTHLY_BILL_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Target System Size (Optional)</label>
                  <select 
                    value={formData.system_size_interest}
                    onChange={(e) => updateField("system_size_interest", e.target.value)}
                    className="select-field w-full"
                  >
                    <option value="">I&apos;m not sure, advise me</option>
                    {SYSTEM_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Property & Timeline */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-text-primary mb-6">Property Details</h3>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-text-primary">Do you own the property? *</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 border rounded-xl p-4 cursor-pointer text-center transition-all ${formData.ownership_status === "own" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-gray-400"}`}>
                      <input 
                        type="radio" 
                        name="ownership" 
                        value="own" 
                        className="sr-only"
                        checked={formData.ownership_status === "own"}
                        onChange={(e) => updateField("ownership_status", e.target.value)}
                      />
                      <span className="font-medium text-text-primary">Yes, I own it</span>
                    </label>
                    <label className={`flex-1 border rounded-xl p-4 cursor-pointer text-center transition-all ${formData.ownership_status === "rent" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-gray-400"}`}>
                      <input 
                        type="radio" 
                        name="ownership" 
                        value="rent" 
                        className="sr-only"
                        checked={formData.ownership_status === "rent"}
                        onChange={(e) => updateField("ownership_status", e.target.value)}
                      />
                      <span className="font-medium text-text-primary">No, I rent</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-text-primary">When do you want to install? *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: "asap", label: "ASAP" },
                      { val: "1-3months", label: "1-3 Months" },
                      { val: "researching", label: "Just Researching" }
                    ].map((t) => (
                      <label key={t.val} className={`border rounded-xl p-3 cursor-pointer text-center transition-all text-sm ${formData.timeline === t.val ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-gray-400"}`}>
                        <input 
                          type="radio" 
                          name="timeline" 
                          value={t.val} 
                          className="sr-only"
                          checked={formData.timeline === t.val}
                          onChange={(e) => updateField("timeline", e.target.value)}
                        />
                        <span className="font-medium text-text-primary">{t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Contact Info */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h3 className="text-xl font-bold text-text-primary mb-6">Contact Details</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Full Name *</label>
                  <input 
                    type="text" 
                    value={formData.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    placeholder="John Doe"
                    className="input-field w-full"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Phone Number *</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="08012345678"
                      className="input-field w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">WhatsApp Number</label>
                    <input 
                      type="tel" 
                      value={formData.whatsapp}
                      onChange={(e) => updateField("whatsapp", e.target.value)}
                      placeholder="Optional, if different"
                      className="input-field w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Optional, for backup contact"
                    className="input-field w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Additional Message</label>
                  <textarea 
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    placeholder="Any specific requests or constraints?"
                    className="input-field w-full min-h-[100px] resize-y"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                    {error}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : (
              <div></div> // Spacer
            )}
            
            <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : step === 3 ? (
                "Submit Request"
              ) : (
                <>Next Step <ChevronRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        </form>
      </div>
      
      <p className="text-center text-xs text-text-muted mt-6">
        By submitting, you agree to SolarCheck's Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

export default function GetQuotesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 pb-24">
        <div className="container-custom">
          <Suspense fallback={<div className="text-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" /></div>}>
            <GetQuotesForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
