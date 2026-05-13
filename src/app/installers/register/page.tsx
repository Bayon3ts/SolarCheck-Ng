"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, Loader2, ArrowLeft, Building2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { NIGERIAN_STATES, SERVICES, SYSTEM_SIZES } from "@/lib/validations";
// import PaystackPop from '@paystack/inline-js'; // Assuming you would use this for actual implementation

function InstallerRegistrationForm() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") || "free";
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    state: "",
    city: "",
    lga: "",
    address: "",
    cac_number: "",
    description: "",
    website: "",
    services: [] as string[],
    system_sizes: [] as string[],
    brands_used: [] as string[],
    plan: initialPlan,
  });

  const handleNext = () => setStep((p) => p + 1);
  const handleBack = () => setStep((p) => p - 1);

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: "services" | "system_sizes" | "brands_used", value: string) => {
    setFormData((prev) => {
      const array = prev[field] as string[];
      if (array.includes(value)) {
        return { ...prev, [field]: array.filter((item) => item !== value) };
      } else {
        return { ...prev, [field]: [...array, value] };
      }
    });
  };

  const processPayment = async (_installerId: string) => {
    // In a real app, you'd initialize Paystack here
    // const paystack = new PaystackPop();
    // paystack.newTransaction({
    //   key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    //   email: formData.email,
    //   amount: amount * 100, // kobo
    //   metadata: { installer_id: installerId, plan: formData.plan },
    //   onSuccess: () => setIsSuccess(true),
    //   onCancel: () => setError("Payment cancelled. You can complete it later from your dashboard.")
    // });
    
    // Simulating successful payment for now
    setTimeout(() => setIsSuccess(true), 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      handleNext();
      return;
    }

    // Step 4 is plan selection. Submitting this finalizes registration.
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/installers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (formData.plan === "featured" || formData.plan === "premium") {
          // Move to payment step
          setStep(5);
          await processPayment(data.data.id);
        } else {
          setIsSuccess(true);
        }
      } else {
        setError(data.error || "Failed to register");
      }
    } catch (err: unknown) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="card max-w-2xl mx-auto p-12 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-text-primary mb-4">Registration Complete!</h2>
        <p className="text-lg text-text-muted mb-8">
          Welcome to SolarCheck. Your profile is currently pending verification. Our team will review your application and CAC details within 24-48 hours.
        </p>
        <Button asChild variant="primary" size="lg">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  // Payment mock step
  if (step === 5) {
    return (
      <div className="card max-w-2xl mx-auto p-12 text-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-text-primary mb-4">Processing Payment...</h2>
        <p className="text-text-muted">Please wait while we securely process your subscription with Paystack.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary md:text-4xl text-center">
          Installer Registration
        </h1>
        <p className="mt-2 text-text-muted text-center">
          Join Nigeria&apos;s trusted solar network.
        </p>
        
        {/* Progress Bar */}
        <div className="mt-8 flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-gray-200"}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-2 px-1">
          <span>Company</span>
          <span>Services</span>
          <span>Docs</span>
          <span>Plan</span>
        </div>
      </div>

      <div className="card p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: Company Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" /> Company Details
                </h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Company Name *</label>
                  <input 
                    type="text" 
                    value={formData.company_name}
                    onChange={(e) => updateField("company_name", e.target.value)}
                    placeholder="e.g. Solar Solutions Nigeria Ltd"
                    className="input-field w-full"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Email Address *</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="contact@company.com"
                      className="input-field w-full"
                      required
                    />
                  </div>
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
                </div>

                <div className="grid md:grid-cols-3 gap-5">
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
                    <label className="text-sm font-medium text-text-primary">City *</label>
                    <input 
                      type="text" 
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="e.g. Ikeja"
                      className="input-field w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">LGA</label>
                    <input 
                      type="text" 
                      value={formData.lga}
                      onChange={(e) => updateField("lga", e.target.value)}
                      placeholder="Optional"
                      className="input-field w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Office Address *</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Full street address"
                    className="input-field w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Company Description *</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Tell homeowners about your experience, team, and why they should choose you. (Min 20 characters)"
                    className="input-field w-full min-h-[100px] resize-y"
                    required
                    minLength={20}
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: Services & Coverage */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  Capabilities
                </h3>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-text-primary">What services do you offer? *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SERVICES.map((service) => (
                      <label key={service} className={`border rounded-xl p-3 cursor-pointer text-center transition-all text-sm ${formData.services.includes(service) ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-gray-400"}`}>
                        <input 
                          type="checkbox" 
                          className="sr-only"
                          checked={formData.services.includes(service)}
                          onChange={() => toggleArrayField("services", service)}
                        />
                        <span className="font-medium text-text-primary capitalize">{service.replace("-", " ")}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-text-primary">Supported System Sizes *</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {SYSTEM_SIZES.map((size) => (
                      <label key={size} className={`border rounded-xl p-3 cursor-pointer text-center transition-all text-sm ${formData.system_sizes.includes(size) ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-gray-400"}`}>
                        <input 
                          type="checkbox" 
                          className="sr-only"
                          checked={formData.system_sizes.includes(size)}
                          onChange={() => toggleArrayField("system_sizes", size)}
                        />
                        <span className="font-medium text-text-primary">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Preferred Brands (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Felicity, Jinko, Deye (Comma separated)"
                    className="input-field w-full"
                    onChange={(e) => updateField("brands_used", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 3: Documents */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  Verification Documents
                </h3>
                <p className="text-sm text-text-muted mb-4">
                  To maintain quality, SolarCheck requires all installers to provide their CAC registration.
                </p>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">CAC Registration Number *</label>
                  <input 
                    type="text" 
                    value={formData.cac_number}
                    onChange={(e) => updateField("cac_number", e.target.value)}
                    placeholder="e.g. RC 123456"
                    className="input-field w-full font-mono"
                    required
                  />
                </div>

                <div className="mt-6 border-2 border-dashed border-border rounded-xl p-8 text-center bg-gray-50">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-text-primary mb-1">Upload CAC Certificate</p>
                  <p className="text-xs text-text-muted mb-4">PDF, JPG or PNG (Max 5MB)</p>
                  <Button type="button" variant="outline" size="sm">Select File</Button>
                  <p className="text-xs text-text-muted mt-4 italic">Document upload is simulated for this demo.</p>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Choose Plan */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  Select Subscription Plan
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <label className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${formData.plan === "free" ? "border-primary bg-primary/5" : "border-border hover:border-gray-400"}`}>
                    <input 
                      type="radio" 
                      name="plan" 
                      value="free" 
                      className="sr-only"
                      checked={formData.plan === "free"}
                      onChange={(e) => updateField("plan", e.target.value)}
                    />
                    <div className="text-center">
                      <h4 className="font-bold text-text-primary">Basic</h4>
                      <div className="text-2xl font-bold my-2">Free</div>
                      <p className="text-xs text-text-muted">Standard listing</p>
                    </div>
                  </label>

                  <label className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${formData.plan === "featured" ? "border-accent bg-primary-dark text-white" : "border-border hover:border-gray-400"}`}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary-dark text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Popular
                    </div>
                    <input 
                      type="radio" 
                      name="plan" 
                      value="featured" 
                      className="sr-only"
                      checked={formData.plan === "featured"}
                      onChange={(e) => updateField("plan", e.target.value)}
                    />
                    <div className="text-center">
                      <h4 className={formData.plan === "featured" ? "font-bold" : "font-bold text-text-primary"}>Featured</h4>
                      <div className={`text-2xl font-bold my-2 ${formData.plan === "featured" ? "text-accent" : ""}`}>₦25k</div>
                      <p className={`text-xs ${formData.plan === "featured" ? "text-white/70" : "text-text-muted"}`}>5 Free leads/mo</p>
                    </div>
                  </label>

                  <label className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${formData.plan === "premium" ? "border-primary bg-primary/5" : "border-border hover:border-gray-400"}`}>
                    <input 
                      type="radio" 
                      name="plan" 
                      value="premium" 
                      className="sr-only"
                      checked={formData.plan === "premium"}
                      onChange={(e) => updateField("plan", e.target.value)}
                    />
                    <div className="text-center">
                      <h4 className="font-bold text-text-primary">Premium</h4>
                      <div className="text-2xl font-bold my-2">₦75k</div>
                      <p className="text-xs text-text-muted">Top ranking guarantee</p>
                    </div>
                  </label>
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
            
            <Button 
              type="submit" 
              variant={step === 4 && formData.plan !== "free" ? "secondary" : "primary"} 
              size="lg" 
              disabled={isSubmitting || (step === 2 && formData.services.length === 0)}
              className={step === 4 && formData.plan !== "free" ? "text-primary-dark" : ""}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : step === 4 ? (
                formData.plan === "free" ? "Complete Registration" : "Proceed to Payment"
              ) : (
                <>Next Step <ChevronRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InstallerRegistrationPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 pb-24">
        <div className="container-custom">
          <Suspense fallback={<div className="text-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" /></div>}>
            <InstallerRegistrationForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
