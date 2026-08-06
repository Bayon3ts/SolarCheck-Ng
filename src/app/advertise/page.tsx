"use client";

import { useState } from "react";
import { Loader2, ArrowRight, UploadCloud, X, CheckCircle2, ImageIcon, Building2 as LogoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { BANNER_PLANS, BANNER_PRICING_MATRIX } from "@/lib/paystack";
import SponsorBannerCarousel, { type BannerData } from "@/components/sections/sponsor-banner-carousel";

/* ─── Duration options (labels + discount badges, prices are derived from the matrix) ─── */
const DURATION_DAYS = [7, 14, 30] as const;
type DurationDays = typeof DURATION_DAYS[number];
const DURATION_META: Record<DurationDays, { label: string; badge: string | null }> = {
  7:  { label: "7 Days",  badge: null },
  14: { label: "14 Days", badge: "10% Off" },
  30: { label: "30 Days", badge: "Best Value" },
};

/* ─── File validation helpers ─────────────────────────── */
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "Invalid file type. Please use PNG, JPG, WEBP, or SVG.";
  if (file.size > MAX_BYTES) return "File is too large. Maximum size is 5 MB.";
  return null;
}

/* ─── Small reusable uploader ─────────────────────────── */
interface UploaderProps {
  id: string;
  previewUrl: string | null;
  fileName?: string;
  fileSizeMB?: string;
  error: string | null;
  label: string;
  hint: string;
  accept?: string;
  wide?: boolean;
  onFile: (f: File | null) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}

function FileUploader({
  id, previewUrl, fileName, fileSizeMB, error, label, hint, accept, wide, onFile, onDrop, onDragOver,
}: UploaderProps) {
  return (
    <div className={wide ? "w-full" : "max-w-xs mx-auto w-full"}>
      {!previewUrl ? (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className={`relative border-2 border-dashed border-border rounded-xl text-center hover:border-primary/50 transition-colors cursor-pointer bg-white group ${wide ? "p-10" : "p-8"}`}
        >
          <input
            id={id}
            type="file"
            accept={accept ?? "image/png, image/jpeg, image/webp, image/svg+xml"}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
          <UploadCloud className="w-8 h-8 text-text-muted mx-auto mb-3 group-hover:text-primary transition-colors" />
          <p className="text-sm font-semibold text-text-primary">{label}</p>
          <p className="text-xs text-text-muted mt-1.5">{hint}</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl p-4 bg-white flex items-center gap-4">
          <div className={`flex-shrink-0 border border-gray-100 overflow-hidden rounded-lg flex items-center justify-center bg-gray-50 ${wide ? "h-16 w-24" : "h-16 w-16"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <p className="text-sm font-medium text-text-primary truncate">{fileName}</p>
            </div>
            <p className="text-xs text-text-muted">{fileSizeMB} MB</p>
          </div>
          <button
            type="button"
            onClick={() => onFile(null)}
            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function AdvertisePage() {
  /* ── Form state ─────────────────────────────────────── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationDays>(30);

  const [formData, setFormData] = useState({
    company_name: "",
    logo_url: "",
    headline: "",
    cta_text: "Learn more",
    cta_url: "",
    plan: "standard",
    placementLocation: "calculator",
  });

  /* ── Logo state ─────────────────────────────────────── */
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  /* ── Banner bg image state ──────────────────────────── */
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  /* ── Asset tab ──────────────────────────────────────── */
  const [assetTab, setAssetTab] = useState<"banner" | "logo">("banner");

  const updateField = (field: keyof typeof formData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  /* ── Logo file handler ──────────────────────────────── */
  const handleLogoFile = (file: File | null) => {
    setLogoError(null);
    setLogoFailed(false);
    if (!file) {
      setLogoFile(null);
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
      setLogoPreviewUrl(null);
      return;
    }
    const err = validateImageFile(file);
    if (err) { setLogoError(err); return; }
    setLogoFile(file);
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  /* ── Banner bg file handler ─────────────────────────── */
  const handleBannerFile = (file: File | null) => {
    setBannerError(null);
    if (!file) {
      setBannerFile(null);
      if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
      setBannerPreviewUrl(null);
      return;
    }
    const err = validateImageFile(file);
    if (err) { setBannerError(err); return; }
    setBannerFile(file);
    if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    setBannerPreviewUrl(URL.createObjectURL(file));
  };

  const makeDrop = (handler: (f: File | null) => void) =>
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      handler(e.dataTransfer.files?.[0] || null);
    };
  const noop = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  /* ── Upload helper ─────────────────────────────────── */
  async function uploadFile(file: File, type: "logo" | "banner"): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    const res = await fetch("/api/banners/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || `Failed to upload ${type}`);
    return json.url as string;
  }

  /* ── Submit ─────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile) { setLogoError("Please upload a company logo."); setAssetTab("logo"); return; }

    try { new URL(formData.cta_url); if (!formData.cta_url.startsWith("https://")) throw new Error(); }
    catch { setError("Link URL must be a valid https:// link."); return; }

    setIsSubmitting(true);
    setIsUploading(true);
    setError(null);

    try {
      // Upload logo (required)
      const logoUrl = await uploadFile(logoFile, "logo");
      // Upload banner bg image (optional)
      let bgUrl: string | undefined;
      if (bannerFile) bgUrl = await uploadFile(bannerFile, "banner");

      setIsUploading(false);

      const payload = {
        ...formData,
        logo_url: logoUrl,
        duration: selectedDuration,
        ...(bgUrl ? { bg_image_url: bgUrl } : {}),
      };

      const res = await fetch("/api/banners/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success && data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        const detail = data.detail ? ` — ${data.detail}` : "";
        setError((data.error || "Failed to submit request.") + detail);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  /* ── Preview banner object ──────────────────────────── */
  const previewBanner: BannerData = {
    id: "preview",
    isPreview: true,
    company_name: formData.company_name || "Company Name",
    logo_url: logoPreviewUrl && !logoFailed ? logoPreviewUrl : "",
    headline: formData.headline || "Your headline will appear here",
    cta_text: formData.cta_text || "Learn more",
    cta_url: formData.cta_url || "#",
    plan: formData.plan as BannerData["plan"],
    placement_location: formData.placementLocation as BannerData["placement_location"],
    bg_image_url: bannerPreviewUrl ?? undefined,
  };

  // Derive the current price from the matrix (single source of truth)
  const currentTier = formData.plan as keyof typeof BANNER_PRICING_MATRIX;
  const selectedPrice = BANNER_PRICING_MATRIX[currentTier][selectedDuration].priceNgn;

  /* ── Render ─────────────────────────────────────────── */
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-32 pb-24">
        <div className="container-custom max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-text-primary md:text-4xl">Sponsor SolarCheck</h1>
            <p className="mt-2 text-text-muted">
              Reach thousands of Nigerian homeowners actively comparing solar equipment.
            </p>
          </div>

          <div className="card p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* ── Plan Selection ─────────────────────────────── */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-text-primary">Select Advertising Plan</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {(Object.keys(BANNER_PLANS) as Array<keyof typeof BANNER_PLANS>).map((planKey) => {
                    const plan = BANNER_PLANS[planKey];
                    const isSelected = formData.plan === planKey;
                    return (
                      <label
                        key={planKey}
                        className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
                          isSelected ? "border-primary bg-primary/5" : "border-border hover:border-gray-400"
                        }`}
                      >
                        {planKey === "featured" && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary-dark text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Premium Placement
                          </div>
                        )}
                        <input
                          type="radio" name="plan" value={planKey}
                          className="sr-only" checked={isSelected}
                          onChange={(e) => updateField("plan", e.target.value)}
                        />
                        <div className="text-center">
                          <h4 className="font-bold text-text-primary">{plan.name}</h4>
                          <div className="text-sm text-text-muted my-2">
                            Starting from{" "}
                            <span className="font-bold text-text-primary">
                              ₦{plan.startingFrom.toLocaleString()}
                            </span>
                          </div>
                          <ul className="text-xs text-text-muted space-y-1 text-left mt-4">
                            {plan.features.map((f, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-primary mt-0.5">✓</span> {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* ── Banner Details ─────────────────────────────── */}
              <div className="border-t border-border pt-8 space-y-6">
                <h3 className="text-xl font-bold text-text-primary">Banner Details</h3>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Company Name *</label>
                    <input
                      type="text" value={formData.company_name}
                      onChange={(e) => updateField("company_name", e.target.value)}
                      placeholder="e.g. Solar Solutions Ltd"
                      className="input-field w-full" required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Headline *</label>
                    <input
                      type="text" value={formData.headline}
                      onChange={(e) => updateField("headline", e.target.value)}
                      placeholder="e.g. #1 Distributor of Felicity Solar in Nigeria"
                      className="input-field w-full" maxLength={60} required
                    />
                    <div className="flex justify-between">
                      <p className="text-xs text-text-muted">Max 60 characters</p>
                      <p className="text-xs text-text-muted">{formData.headline.length}/60</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Button Text *</label>
                    <input
                      type="text" value={formData.cta_text}
                      onChange={(e) => updateField("cta_text", e.target.value)}
                      placeholder="e.g. Learn more"
                      className="input-field w-full" maxLength={20} required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Link URL (HTTPS) *</label>
                    <input
                      type="url" value={formData.cta_url}
                      onChange={(e) => updateField("cta_url", e.target.value)}
                      placeholder="https://yourwebsite.com/offer"
                      className="input-field w-full" required
                    />
                  </div>
                </div>
              </div>

              {/* ── Placement Selection ────────────────────────── */}
              <div className="border-t border-border pt-8 space-y-4">
                <h3 className="text-xl font-bold text-text-primary">Select Ad Placement *</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { id: "calculator", title: "Solar Calculator Results", badge: "Highest Intent", desc: "Appears directly below calculation results when homeowners check system sizing." },
                    { id: "directory",  title: "Installer Directory",      badge: "Top Spot",       desc: "Pinned near the top of organic installer search results." },
                    { id: "guides",     title: "Solar Guides & Articles",  badge: "High Traffic",   desc: "Appears inline inside popular solar advice and guide articles." },
                  ].map((p) => {
                    const isSelected = formData.placementLocation === p.id;
                    return (
                      <label
                        key={p.id}
                        className={`relative rounded-xl p-5 cursor-pointer transition-all ${
                          isSelected ? "border-2 border-emerald-600 bg-emerald-50/40" : "border border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio" name="placementLocation" value={p.id}
                          className="sr-only" checked={isSelected}
                          onChange={(e) => updateField("placementLocation", e.target.value)}
                        />
                        <div className="mb-2">
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mb-1">
                            {p.badge}
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm">{p.title}</h4>
                        </div>
                        <p className="text-xs text-gray-500">{p.desc}</p>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* ── Live Preview ───────────────────────────────── */}
              <div className="border-t border-border pt-8 space-y-4">
                <h3 className="text-xl font-bold text-text-primary">Live Preview</h3>
                <p className="text-xs text-text-muted -mt-2">
                  Previewing on:{" "}
                  {formData.placementLocation === "calculator" ? "Solar Calculator Results"
                    : formData.placementLocation === "directory" ? "Installer Directory"
                    : "Solar Guides & Articles"}
                </p>
                <SponsorBannerCarousel previewMode banners={[previewBanner]} />
              </div>

              {/* ── Multi-Asset Upload ─────────────────────────── */}
              <div className="border-t border-border pt-8 space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-text-primary">Upload Assets</h3>
                  <p className="text-xs text-text-muted mt-1">
                    Upload your banner background image and company logo. Max 5 MB each.
                  </p>
                </div>

                {/* Segmented control */}
                <div className="inline-flex rounded-xl border border-border bg-gray-100 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setAssetTab("banner")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      assetTab === "banner"
                        ? "bg-white text-text-primary shadow-sm"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Banner Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssetTab("logo")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      assetTab === "logo"
                        ? "bg-white text-text-primary shadow-sm"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <LogoIcon className="w-4 h-4" />
                    Company Logo *
                  </button>
                </div>

                {/* Panel: Banner upload */}
                {assetTab === "banner" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <p className="text-xs text-text-muted">
                      <span className="font-semibold text-text-primary">Banner Image</span>{" "}
                      [Full Width] — Slides show sequential banners. Suggested 1600×400 px. Optional.
                    </p>
                    <FileUploader
                      id="banner-upload"
                      previewUrl={bannerPreviewUrl}
                      fileName={bannerFile?.name}
                      fileSizeMB={(bannerFile ? bannerFile.size / 1024 / 1024 : 0).toFixed(2)}
                      error={bannerError}
                      label="Click or drag and drop to upload banner image"
                      hint="Max 5 MB · PNG, JPG, WEBP · Suggested 1600×400 px"
                      wide
                      onFile={handleBannerFile}
                      onDrop={makeDrop(handleBannerFile)}
                      onDragOver={noop}
                    />
                  </div>
                )}

                {/* Panel: Logo upload */}
                {assetTab === "logo" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <p className="text-xs text-text-muted">
                      <span className="font-semibold text-text-primary">Company Logo</span>{" "}
                      [Icon] — Appears in the slide card. Suggested 200×200 px. Required.
                    </p>
                    <FileUploader
                      id="logo-upload"
                      previewUrl={logoPreviewUrl}
                      fileName={logoFile?.name}
                      fileSizeMB={(logoFile ? logoFile.size / 1024 / 1024 : 0).toFixed(2)}
                      error={logoError}
                      label="Click or drag and drop to upload your logo"
                      hint="Max 5 MB · PNG, JPG, WEBP, SVG · Suggested 200×200 px"
                      onFile={handleLogoFile}
                      onDrop={makeDrop(handleLogoFile)}
                      onDragOver={noop}
                    />
                  </div>
                )}
              </div>

              {/* ── Campaign Duration ───────────────────────── */}
              <div className="border-t border-border pt-8 space-y-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-bold text-text-primary">Campaign Duration *</h3>
                  <p className="text-xs text-text-muted">Prices shown for selected plan</p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {DURATION_DAYS.map((days) => {
                    const meta = DURATION_META[days];
                    const price = BANNER_PRICING_MATRIX[currentTier][days].priceNgn;
                    const isSelected = selectedDuration === days;
                    return (
                      <label
                        key={days}
                        className={`relative rounded-xl p-5 cursor-pointer transition-all text-center ${
                          isSelected
                            ? "border-2 border-emerald-600 bg-emerald-50/30"
                            : "border border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio" name="campaignDuration" value={days}
                          className="sr-only" checked={isSelected}
                          onChange={() => setSelectedDuration(days)}
                        />
                        {/* Fixed-height badge row keeps all cards vertically aligned */}
                        <div className="h-6 flex items-center justify-center mb-1">
                          {meta.badge && (
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {meta.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{meta.label}</h4>
                        <div className="text-2xl font-bold text-text-primary">
                          ₦{price.toLocaleString()}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* ── Error ─────────────────────────────────────── */}
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  {error}
                </div>
              )}

              {/* ── Submit ────────────────────────────────────── */}
              <div className="flex items-center justify-end pt-6 border-t border-border mt-8">
                <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploading ? "Uploading assets…" : "Processing…"}
                    </>
                  ) : (
                    <>
                      Proceed to Payment — ₦{selectedPrice.toLocaleString()}
                      <ArrowRight className="w-4 h-4 ml-2" />
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
