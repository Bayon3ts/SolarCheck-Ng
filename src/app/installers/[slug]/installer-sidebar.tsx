"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Globe,
  Lock,
  Unlock,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ArrowLeft,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NIGERIAN_STATES, MONTHLY_BILL_RANGES, SYSTEM_SIZES } from "@/lib/validations";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InstallerSidebarProps {
  installer: {
    id: string;
    company_name: string;
    phone?: string;
    website?: string;
    services: string[];
    system_sizes: string[];
    brands_used?: string[];
    cac_number?: string;
    slug: string;
  };
}

// ─── Mini Quote Form (3 steps) ────────────────────────────────────────────────

function MiniQuoteForm({
  installerId,
  installerName,
  onSuccess,
  onClose,
}: {
  installerId: string;
  installerName: string;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    whatsapp: "",
    email: "",
    state: "",
    city: "",
    monthly_bill_range: "",
    system_size_interest: "",
    ownership_status: "own",
    timeline: "asap",
    message: "",
    lead_type: "exclusive",
    installer_id: installerId,
  });

  const update = (field: keyof typeof formData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

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
      const res = await fetch("/api/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
      } else {
        setError(data.error || "Failed to submit. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ["Energy", "Property", "Contact"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── SUCCESS SCREEN ── */}
        {isSuccess ? (
          <div className="flex flex-col items-center text-center px-8 py-10">
            {/* Animated checkmark ring */}
            <div className="relative mb-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in-50 duration-500">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              {/* Pulsing outer ring */}
              <span className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
            </div>

            <h3 className="text-xl font-bold text-text-primary mb-2">
              Request Sent! 🎉
            </h3>
            <p className="text-sm text-text-muted leading-relaxed mb-1">
              Your quote request has been sent to{" "}
              <span className="font-semibold text-text-primary">{installerName}</span>.
            </p>
            <p className="text-sm text-text-muted leading-relaxed">
              They&apos;ll contact you shortly via <strong>phone or WhatsApp</strong> with a customised solar proposal.
            </p>

            {/* What happens next */}
            <div className="w-full mt-6 rounded-xl bg-primary/5 border border-primary/10 p-4 text-left space-y-2">
              <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">What happens next</p>
              {[
                { icon: "📞", text: "Installer reviews your request" },
                { icon: "💬", text: "They call or WhatsApp you within 24 hrs" },
                { icon: "📋", text: "You receive a customised quote" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <span className="text-base">{icon}</span>
                  <span className="text-xs text-text-muted">{text}</span>
                </div>
              ))}
            </div>

            {/* Contact details now unlocked */}
            <p className="text-xs text-primary font-medium mt-5 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Contact details below are now unlocked for you.
            </p>

            <button
              onClick={onSuccess}
              className="btn-primary w-full mt-6 text-sm py-3"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* ── FORM HEADER ── */}
            <div className="bg-primary-dark text-white px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">Request a Free Quote</h3>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors rounded-lg p-1"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-white/70">
                Get a customized solar proposal from{" "}
                <span className="font-semibold text-white">{installerName}</span>
              </p>

              {/* Step indicator */}
              <div className="mt-4 flex items-center gap-2">
                {stepLabels.map((label, i) => (
                  <div key={label} className="flex items-center gap-2 flex-1">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        i + 1 < step
                          ? "bg-accent text-text-primary"
                          : i + 1 === step
                          ? "bg-white text-primary-dark"
                          : "bg-white/20 text-white/50"
                      }`}
                    >
                      {i + 1 < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        i + 1 === step ? "text-white" : "text-white/50"
                      }`}
                    >
                      {label}
                    </span>
                    {i < stepLabels.length - 1 && (
                      <div
                        className={`h-px flex-1 transition-colors ${
                          i + 1 < step ? "bg-accent" : "bg-white/20"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Step 1: Energy Requirements */}
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                    State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => update("state", e.target.value)}
                    className="select-field w-full text-xs py-2.5"
                    required
                  >
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                    City / Area *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="e.g. Lekki"
                    className="input-field w-full text-xs py-2.5"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                  Monthly Electricity Bill *
                </label>
                <select
                  value={formData.monthly_bill_range}
                  onChange={(e) => update("monthly_bill_range", e.target.value)}
                  className="select-field w-full text-xs py-2.5"
                  required
                >
                  <option value="">Select range</option>
                  {MONTHLY_BILL_RANGES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                  System Size (Optional)
                </label>
                <select
                  value={formData.system_size_interest}
                  onChange={(e) => update("system_size_interest", e.target.value)}
                  className="select-field w-full text-xs py-2.5"
                >
                  <option value="">I&apos;m not sure, advise me</option>
                  {SYSTEM_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Property Details */}
          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                  Do you own the property? *
                </label>
                <div className="flex gap-3">
                  {[
                    { val: "own", label: "Yes, I own it" },
                    { val: "rent", label: "No, I rent" },
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className={`flex-1 border rounded-xl p-3 cursor-pointer text-center text-xs font-medium transition-all ${
                        formData.ownership_status === opt.val
                          ? "border-primary bg-primary/5 ring-1 ring-primary text-primary"
                          : "border-border text-text-muted hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="ownership"
                        value={opt.val}
                        className="sr-only"
                        checked={formData.ownership_status === opt.val}
                        onChange={(e) => update("ownership_status", e.target.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                  When do you want to install? *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "asap", label: "ASAP" },
                    { val: "1-3months", label: "1–3 Months" },
                    { val: "researching", label: "Researching" },
                  ].map((t) => (
                    <label
                      key={t.val}
                      className={`border rounded-xl p-2.5 cursor-pointer text-center text-xs font-medium transition-all ${
                        formData.timeline === t.val
                          ? "border-primary bg-primary/5 ring-1 ring-primary text-primary"
                          : "border-border text-text-muted hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="timeline"
                        value={t.val}
                        className="sr-only"
                        checked={formData.timeline === t.val}
                        onChange={(e) => update("timeline", e.target.value)}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Quote preference */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                  How many quotes do you want? *
                </label>
                <div className="flex flex-col gap-2">
                  {/* Option 1 — Exclusive */}
                  <label
                    className={`flex items-start gap-3 border rounded-xl p-3 cursor-pointer transition-all ${
                      formData.lead_type === "exclusive"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="lead_type"
                      value="exclusive"
                      className="sr-only"
                      checked={formData.lead_type === "exclusive"}
                      onChange={(e) => update("lead_type", e.target.value)}
                    />
                    <span className="text-base leading-none mt-0.5">⚡</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${formData.lead_type === "exclusive" ? "text-primary" : "text-text-primary"}`}>
                        1 quote — this installer only
                      </p>
                      <p className="text-[11px] text-text-muted mt-0.5 leading-snug">
                        Dedicated attention &amp; faster response from a single premium installer.
                      </p>
                    </div>
                    {formData.lead_type === "exclusive" && (
                      <span className="shrink-0 text-[10px] font-bold bg-primary text-white rounded-full px-2 py-0.5">
                        Selected
                      </span>
                    )}
                  </label>

                  {/* Option 2 — Shared / multiple */}
                  <label
                    className={`flex items-start gap-3 border rounded-xl p-3 cursor-pointer transition-all ${
                      formData.lead_type === "shared"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="lead_type"
                      value="shared"
                      className="sr-only"
                      checked={formData.lead_type === "shared"}
                      onChange={(e) => update("lead_type", e.target.value)}
                    />
                    <span className="text-base leading-none mt-0.5">⚖️</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className={`text-xs font-semibold ${formData.lead_type === "shared" ? "text-primary" : "text-text-primary"}`}>
                          2–3 quotes from multiple installers
                        </p>
                        <span className="text-[10px] font-bold bg-accent/20 text-amber-700 rounded-full px-1.5 py-0.5 shrink-0">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5 leading-snug">
                        Compare options &amp; get the most competitive pricing. Max 3 installers.
                      </p>
                    </div>
                    {formData.lead_type === "shared" && (
                      <span className="shrink-0 text-[10px] font-bold bg-primary text-white rounded-full px-2 py-0.5">
                        Selected
                      </span>
                    )}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Details */}
          {step === 3 && (
            <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  placeholder="John Doe"
                  className="input-field w-full text-xs py-2.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="08012345678"
                    className="input-field w-full text-xs py-2.5"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    placeholder="If different"
                    className="input-field w-full text-xs py-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary uppercase tracking-wide">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="For backup contact"
                  className="input-field w-full text-xs py-2.5"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs px-5 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Processing…
                </>
              ) : step === 3 ? (
                "Submit Request"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-[11px] text-text-muted pb-4 px-6">
          By submitting, you agree to SolarCheck&apos;s Terms of Service.
        </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Sidebar Component ───────────────────────────────────────────────────

export default function InstallerSidebar({ installer }: InstallerSidebarProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleQuoteSuccess = () => {
    setShowForm(false);
    setIsUnlocked(true);
  };

  return (
    <>
      {/* Quote modal */}
      {showForm && (
        <MiniQuoteForm
          installerId={installer.id}
          installerName={installer.company_name}
          onSuccess={handleQuoteSuccess}
          onClose={() => setShowForm(false)}
        />
      )}

      <div className="space-y-6">
        {/* CTA Card — always visible */}
        <div className="card p-6 bg-primary-dark text-white text-center">
          <h3 className="text-xl font-bold mb-2">Request a Free Quote</h3>
          <p className="text-sm text-white/70 mb-6">
            Get a customized solar proposal directly from {installer.company_name}.
          </p>
          {isUnlocked ? (
            <Link
              href={`/get-quotes?installer=${installer.id}`}
              className="btn-secondary w-full text-center block"
            >
              Request Another Quote
            </Link>
          ) : (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowForm(true)}
            >
              Get Quote Now
            </Button>
          )}
          <p className="text-xs text-white/50 mt-4">Takes less than 60 seconds</p>
        </div>

        {/* Contact Info Card */}
        <div className="card p-6 space-y-4 relative overflow-hidden">
          {/* Blur overlay */}
          {!isUnlocked && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/60 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-text-primary text-center px-4">
                Request a quote to unlock contact details
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary text-xs px-5 py-2"
              >
                Unlock Now
              </button>
            </div>
          )}

          {/* Unlocked indicator */}
          {isUnlocked && (
            <div className="flex items-center gap-2 mb-1 text-primary text-xs font-medium">
              <Unlock className="h-3.5 w-3.5" />
              Contact details unlocked
            </div>
          )}

          <h3 className="font-bold text-text-primary">Contact Information</h3>

          {installer.phone && (
            <div className="flex items-center gap-3 text-text-muted">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <span
                className={
                  !isUnlocked ? "blur-sm select-none pointer-events-none" : ""
                }
              >
                {installer.phone}
              </span>
            </div>
          )}

          {installer.website && (
            <div className="flex items-center gap-3 text-text-muted">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              {isUnlocked ? (
                <a
                  href={installer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary underline-offset-4 hover:underline"
                >
                  Visit Website
                </a>
              ) : (
                <span className="blur-sm select-none pointer-events-none">
                  Visit Website
                </span>
              )}
            </div>
          )}
        </div>

        {/* Company Details Card */}
        <div className="card p-6 relative overflow-hidden">
          {/* Blur overlay */}
          {!isUnlocked && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/60 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-text-primary text-center px-4">
                Request a quote to view full details
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary text-xs px-5 py-2"
              >
                Unlock Now
              </button>
            </div>
          )}

          <h3 className="font-bold text-text-primary mb-4">Company Details</h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Services
              </h4>
              <div className="flex flex-wrap gap-2">
                {installer.services.map((service: string) => (
                  <span key={service} className="tag">
                    {service.replace("-", " ")}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                System Sizes
              </h4>
              <div className="flex flex-wrap gap-2">
                {installer.system_sizes.map((size: string) => (
                  <span key={size} className="tag bg-gray-100 text-gray-700">
                    {size}
                  </span>
                ))}
              </div>
            </div>

            {installer.brands_used && installer.brands_used.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Brands Used
                </h4>
                <p className="text-sm text-text-primary">
                  {installer.brands_used.join(", ")}
                </p>
              </div>
            )}

            {installer.cac_number && (
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  CAC Registration
                </h4>
                <p className="text-sm text-text-primary font-mono">
                  {installer.cac_number}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
