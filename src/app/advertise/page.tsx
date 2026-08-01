"use client";

import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { BANNER_PLANS } from "@/lib/paystack";

export default function AdvertisePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company_name: "",
    logo_url: "",
    headline: "",
    cta_text: "Learn more",
    cta_url: "",
    plan: "standard",
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate URLs basic
    try {
      new URL(formData.logo_url);
      new URL(formData.cta_url);
      if (!formData.logo_url.startsWith("https://") || !formData.cta_url.startsWith("https://")) {
        throw new Error("Must be HTTPS");
      }
    } catch {
      setError("Logo URL and Link URL must be valid https:// links.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/banners/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        setError(data.error || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 pb-24">
        <div className="container-custom max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-text-primary md:text-4xl">
              Sponsor SolarCheck
            </h1>
            <p className="mt-2 text-text-muted">
              Reach thousands of Nigerian homeowners actively comparing solar equipment.
            </p>
          </div>

          <div className="card p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Plan Selection */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  Select Advertising Plan
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {(Object.keys(BANNER_PLANS) as Array<keyof typeof BANNER_PLANS>).map(
                    (planKey) => {
                      const plan = BANNER_PLANS[planKey];
                      const isSelected = formData.plan === planKey;
                      return (
                        <label
                          key={planKey}
                          className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-gray-400"
                          }`}
                        >
                          {planKey === "featured" && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary-dark text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                              Premium Placement
                            </div>
                          )}
                          <input
                            type="radio"
                            name="plan"
                            value={planKey}
                            className="sr-only"
                            checked={isSelected}
                            onChange={(e) => updateField("plan", e.target.value)}
                          />
                          <div className="text-center">
                            <h4 className="font-bold text-text-primary">
                              {plan.name}
                            </h4>
                            <div className="text-2xl font-bold my-2">
                              ₦{(plan.price).toLocaleString()}
                              <span className="text-sm text-text-muted font-normal">
                                /30 days
                              </span>
                            </div>
                            <ul className="text-xs text-text-muted space-y-1 text-left mt-4">
                              {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <span className="text-primary mt-0.5">✓</span>{" "}
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </label>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-8 space-y-6">
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  Banner Details
                </h3>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => updateField("company_name", e.target.value)}
                      placeholder="e.g. Solar Solutions Ltd"
                      className="input-field w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">
                      Logo URL (HTTPS) *
                    </label>
                    <input
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => updateField("logo_url", e.target.value)}
                      placeholder="https://yourwebsite.com/logo.png"
                      className="input-field w-full"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">
                    Headline *
                  </label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => updateField("headline", e.target.value)}
                    placeholder="E.g. #1 Distributor of Felicity Solar in Nigeria"
                    className="input-field w-full"
                    maxLength={60}
                    required
                  />
                  <div className="flex justify-between">
                    <p className="text-xs text-text-muted">Max 60 characters</p>
                    <p className="text-xs text-text-muted">
                      {formData.headline.length}/60
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">
                      Button Text *
                    </label>
                    <input
                      type="text"
                      value={formData.cta_text}
                      onChange={(e) => updateField("cta_text", e.target.value)}
                      placeholder="e.g. Learn more"
                      className="input-field w-full"
                      maxLength={20}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">
                      Link URL (HTTPS) *
                    </label>
                    <input
                      type="url"
                      value={formData.cta_url}
                      onChange={(e) => updateField("cta_url", e.target.value)}
                      placeholder="https://yourwebsite.com/offer"
                      className="input-field w-full"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end pt-6 border-t border-border mt-8">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Payment <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
