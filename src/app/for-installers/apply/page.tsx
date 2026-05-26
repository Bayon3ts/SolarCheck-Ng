"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Building2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { supabase } from "@/lib/supabase/client";

/* ═══════════════════════════════════════ */
/* /for-installers/apply                   */
/* Installer Self-Application Form         */
/* ═══════════════════════════════════════ */

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const ROLES = ["Owner", "Director", "Sales Manager", "Other"];

const YEARS_OPTIONS = [
  "Less than 1 year",
  "1-3 years",
  "3-5 years",
  "5+ years",
];

const BUSINESS_TYPES = [
  "Installation only",
  "Supply + Installation",
  "Maintenance + Installation",
  "Full service",
];

const SYSTEM_SIZES = [
  "Small (1-5kWp)",
  "Medium (5-15kWp)",
  "Large (15kWp+)",
  "All sizes",
];

const PRICE_RANGES = [
  "Budget (under ₦400k/kWp)",
  "Standard (₦400k-₦700k/kWp)",
  "Premium (₦700k+/kWp)",
];

interface FormData {
  company_name: string;
  contact_name: string;
  role: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  years_in_business: string;
  primary_state: string;
  other_states: string[];
  primary_city: string;
  business_type: string;
  system_size_range: string;
  price_range: string;
  cac_number: string;
  description: string;
}

const initialFormData: FormData = {
  company_name: "",
  contact_name: "",
  role: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  years_in_business: "",
  primary_state: "",
  other_states: [],
  primary_city: "",
  business_type: "",
  system_size_range: "",
  price_range: "",
  cac_number: "",
  description: "",
};

export default function InstallerApplyPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvedCount, setApprovedCount] = useState<number>(0);
  const [charCount, setCharCount] = useState(0);

  // Fetch approved installer count
  useEffect(() => {
    async function fetchCount() {
      const { count } = await supabase
        .from("installers")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);
      setApprovedCount(count || 0);
    }
    fetchCount();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "description") {
      setCharCount(value.length);
    }
  }

  function handleOtherStatesChange(state: string) {
    setFormData((prev) => {
      const current = prev.other_states;
      if (current.includes(state)) {
        return { ...prev, other_states: current.filter((s) => s !== state) };
      }
      if (current.length >= 5) return prev;
      return { ...prev, other_states: [...current, state] };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/installers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result.error || "Something went wrong. Please try again.");
        return;
      }

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── Success State ───────────────────────
  if (isSuccess) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-24 pb-20">
          <div className="container-custom max-w-2xl text-center py-20">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Application received! ✓
            </h1>
            <p className="text-lg text-text-muted max-w-lg mx-auto mb-4">
              We&apos;ll review your application and reach out within 48 hours to
              complete your profile. We may call your WhatsApp to verify your
              business.
            </p>
            <div className="card p-6 mt-8 max-w-md mx-auto">
              <p className="text-sm text-text-muted mb-3">
                While you wait, share this tool with your customers:
              </p>
              <Link
                href="/solar-calculator"
                className="btn-primary inline-flex"
              >
                Solar Calculator →
              </Link>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary mt-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to SolarCheck
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── Form State ──────────────────────────
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-20">
        {/* Hero */}
        <section className="bg-primary-dark text-white py-16 px-4 rounded-b-[3rem] md:rounded-b-[5rem] overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent" />
          <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
              <Building2 className="h-4 w-4 text-accent" />
              <span className="text-white/80">Free listing</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              List Your Company <span className="text-accent">Free</span>
            </h1>
            <p className="text-lg text-white/70 max-w-xl mx-auto">
              Join{" "}
              <span className="text-accent font-bold">{approvedCount}</span>{" "}
              solar companies already on SolarCheck. Get leads from verified
              homeowners in your service area.
            </p>
          </div>
        </section>

        {/* Form */}
        <div className="container-custom max-w-2xl -mt-8 relative z-20">
          <form
            onSubmit={handleSubmit}
            className="card p-6 md:p-10 space-y-10"
          >
            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* ── Company Information ── */}
            <fieldset>
              <legend className="text-lg font-bold text-text-primary mb-6 pb-2 border-b border-border w-full">
                Company Information
              </legend>
              <div className="space-y-5">
                {/* Company Name */}
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-text-primary mb-1.5">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. GreenPower Solar Ltd"
                  />
                </div>

                {/* Your Name */}
                <div>
                  <label htmlFor="contact_name" className="block text-sm font-medium text-text-primary mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact_name"
                    name="contact_name"
                    type="text"
                    required
                    value={formData.contact_name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Full name"
                  />
                </div>

                {/* Your Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-text-primary mb-1.5">
                    Your Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="">Select your role</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Phone & WhatsApp */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1.5">
                      Business Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="080XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-text-primary mb-1.5">
                      WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="080XXXXXXXX"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="you@company.com"
                  />
                </div>

                {/* Website */}
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-text-primary mb-1.5">
                    Website URL <span className="text-text-muted text-xs">(optional)</span>
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://yourcompany.com"
                  />
                </div>

                {/* Years in Business */}
                <div>
                  <label htmlFor="years_in_business" className="block text-sm font-medium text-text-primary mb-1.5">
                    Years in Business <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="years_in_business"
                    name="years_in_business"
                    required
                    value={formData.years_in_business}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="">Select experience</option>
                    {YEARS_OPTIONS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            {/* ── Service Area ── */}
            <fieldset>
              <legend className="text-lg font-bold text-text-primary mb-6 pb-2 border-b border-border w-full">
                Service Area
              </legend>
              <div className="space-y-5">
                {/* Primary State */}
                <div>
                  <label htmlFor="primary_state" className="block text-sm font-medium text-text-primary mb-1.5">
                    Primary State <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="primary_state"
                    name="primary_state"
                    required
                    value={formData.primary_state}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="">Select state</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Other States */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Other States Served{" "}
                    <span className="text-text-muted text-xs">
                      (max 5 additional)
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {NIGERIAN_STATES.filter(
                      (s) => s !== formData.primary_state
                    ).map((state) => {
                      const isSelected = formData.other_states.includes(state);
                      const isDisabled =
                        !isSelected && formData.other_states.length >= 5;
                      return (
                        <button
                          key={state}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleOtherStatesChange(state)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                            isSelected
                              ? "bg-primary text-white border-primary"
                              : isDisabled
                              ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                              : "bg-white text-text-muted border-border hover:border-primary hover:text-primary"
                          }`}
                        >
                          {state}
                        </button>
                      );
                    })}
                  </div>
                  {formData.other_states.length > 0 && (
                    <p className="text-xs text-primary mt-2">
                      {formData.other_states.length}/5 selected
                    </p>
                  )}
                </div>

                {/* Primary City */}
                <div>
                  <label htmlFor="primary_city" className="block text-sm font-medium text-text-primary mb-1.5">
                    Primary City/Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="primary_city"
                    name="primary_city"
                    type="text"
                    required
                    value={formData.primary_city}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. Lekki, Lagos"
                  />
                </div>
              </div>
            </fieldset>

            {/* ── Business Details ── */}
            <fieldset>
              <legend className="text-lg font-bold text-text-primary mb-6 pb-2 border-b border-border w-full">
                Business Details
              </legend>
              <div className="space-y-5">
                {/* Business Type */}
                <div>
                  <label htmlFor="business_type" className="block text-sm font-medium text-text-primary mb-1.5">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="business_type"
                    name="business_type"
                    required
                    value={formData.business_type}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="">Select type</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* System Size */}
                <div>
                  <label htmlFor="system_size_range" className="block text-sm font-medium text-text-primary mb-1.5">
                    Typical System Size Range <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="system_size_range"
                    name="system_size_range"
                    required
                    value={formData.system_size_range}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="">Select size range</option>
                    {SYSTEM_SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label htmlFor="price_range" className="block text-sm font-medium text-text-primary mb-1.5">
                    Price Range Per kWp <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="price_range"
                    name="price_range"
                    required
                    value={formData.price_range}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="">Select price range</option>
                    {PRICE_RANGES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* CAC Number */}
                <div>
                  <label htmlFor="cac_number" className="block text-sm font-medium text-text-primary mb-1.5">
                    CAC Registration Number{" "}
                    <span className="text-text-muted text-xs">(optional)</span>
                  </label>
                  <input
                    id="cac_number"
                    name="cac_number"
                    type="text"
                    value={formData.cac_number}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="RC-XXXXXXX"
                  />
                  <p className="text-xs text-text-muted mt-1.5">
                    Not required but builds customer trust
                  </p>
                </div>
              </div>
            </fieldset>

            {/* ── Verification ── */}
            <fieldset>
              <legend className="text-lg font-bold text-text-primary mb-6 pb-2 border-b border-border w-full">
                Verification
              </legend>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1.5">
                  Brief company description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  maxLength={300}
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field resize-none"
                  placeholder="Tell homeowners what makes your company the right choice..."
                />
                <p className="text-xs text-text-muted mt-1.5 text-right">
                  {charCount}/300
                </p>
              </div>
            </fieldset>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-4 text-base disabled:opacity-60 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Apply for Free Listing →"
              )}
            </button>

            <p className="text-xs text-text-muted text-center">
              By submitting, you agree to SolarCheck&apos;s verification
              process. We&apos;ll review your application within 48 hours.
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
