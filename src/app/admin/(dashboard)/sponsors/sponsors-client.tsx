"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

type Banner = {
  id: string;
  company_name: string;
  logo_url: string;
  headline: string;
  cta_text: string;
  cta_url: string;
  plan: string;
  payment_status: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  impressions: number;
  clicks: number;
  created_at: string;
};

/* ═══════════════════════════════════════ */
/* BannerImage — renders the logo_url as  */
/* an actual <img>, with a styled initial */
/* fallback when the image fails to load  */
/* ═══════════════════════════════════════ */
function BannerImage({
  src,
  alt,
  className = "",
  fallbackSize = "md",
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackSize?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);

  // Reset failed state when src changes
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-primary/10 flex-shrink-0 ${sizeClasses[fallbackSize]}`}
      >
        <span className="font-bold text-primary">
          {alt?.charAt(0)?.toUpperCase() || "?"}
        </span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      className={`object-contain flex-shrink-0 ${className}`}
      loading="eager"
      ref={(img) => {
        // Catch images that are already cached as broken
        if (img?.complete && img.naturalWidth === 0) {
          setFailed(true);
        }
      }}
      onError={() => setFailed(true)}
    />
  );
}

/* ═══════════════════════════════════════ */
/* BannerSlideshow — auto-advancing       */
/* slideshow of banners with navigation   */
/* Shows how banners actually appear      */
/* ═══════════════════════════════════════ */
function BannerSlideshow({ banners }: { banners: Banner[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, banners.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const activeBanner = banners[activeIndex];

  return (
    <div
      className="relative mb-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
          Banner Slideshow Preview
        </h2>
        <span className="text-xs text-text-muted">
          {activeIndex + 1} / {banners.length}
        </span>
      </div>

      {/* Navigation buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 z-10 translate-y-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md text-text-muted hover:bg-white hover:text-text-primary transition-all focus:outline-none"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 z-10 translate-y-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md text-text-muted hover:bg-white hover:text-text-primary transition-all focus:outline-none"
            aria-label="Next banner"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Banner card — mirrors the public-facing carousel layout */}
      <div className="bg-white border border-border rounded-2xl shadow-card px-12 py-6 relative overflow-hidden">
        {/* "Sponsored" label */}
        <span className="absolute top-2 right-3 text-xs text-text-muted select-none">
          Sponsored
        </span>

        {/* Featured Partner badge */}
        {activeBanner.plan === "featured" && (
          <span className="absolute top-2 left-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            ★ Featured Partner
          </span>
        )}

        {/* Status indicator overlay */}
        <div className="absolute bottom-2 right-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              activeBanner.is_active
                ? "text-green-700 bg-green-100"
                : activeBanner.payment_status === "paid"
                ? "text-amber-700 bg-amber-100"
                : "text-gray-500 bg-gray-100"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                activeBanner.is_active
                  ? "bg-green-500"
                  : activeBanner.payment_status === "paid"
                  ? "bg-amber-500"
                  : "bg-gray-400"
              }`}
            />
            {activeBanner.is_active
              ? "Live"
              : activeBanner.payment_status === "paid"
              ? "Awaiting Review"
              : activeBanner.payment_status.charAt(0).toUpperCase() +
                activeBanner.payment_status.slice(1)}
          </span>
        </div>

        {/* Slide content */}
        <div
          key={activeBanner.id}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 animate-fade-in"
        >
          {/* Logo — rendered as actual image */}
          <div className="h-12 w-12 sm:w-[120px] flex-shrink-0 flex items-center sm:justify-start justify-center">
            <BannerImage
              src={activeBanner.logo_url}
              alt={`${activeBanner.company_name} logo`}
              className="h-full w-full object-contain object-center sm:object-left"
              fallbackSize="lg"
            />
          </div>

          {/* Text */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="font-semibold text-text-primary text-sm sm:text-base leading-tight line-clamp-2">
              {activeBanner.headline || "No headline provided"}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {activeBanner.company_name}
            </p>
          </div>

          {/* CTA button */}
          <span className="inline-flex items-center gap-1.5 flex-shrink-0 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl cursor-default">
            {activeBanner.cta_text || "Learn more"}
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════ */
/* Badge sub-components                   */
/* ═══════════════════════════════════════ */

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "text-amber-700 bg-amber-100",
    paid: "text-blue-700 bg-blue-100",
    rejected: "text-red-700 bg-red-100",
    failed: "text-gray-700 bg-gray-100",
  };
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
        styles[status] ?? "text-gray-700 bg-gray-100"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function LiveStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
        isActive ? "text-green-700 bg-green-100" : "text-gray-500 bg-gray-100"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`}
      />
      {isActive ? "Live" : "Inactive"}
    </span>
  );
}

/* ═══════════════════════════════════════ */
/* SponsorsClient — main export           */
/* ═══════════════════════════════════════ */

export function SponsorsClient({ banners }: { banners: Banner[] }) {
  const [data, setData] = useState<Banner[]>(banners);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: "publish" | "reject" | "deactivate") => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/banners/${id}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        setData((prev) =>
          prev.map((b) => {
            if (b.id !== id) return b;
            if (action === "publish") return { ...b, is_active: true };
            if (action === "reject") return { ...b, payment_status: "rejected", is_active: false };
            if (action === "deactivate") return { ...b, is_active: false };
            return b;
          })
        );
      }
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

  const pendingReview = data.filter(
    (b) => b.payment_status === "paid" && !b.is_active
  ).length;

  // Banners eligible for the slideshow: paid or active (has creative content)
  const slideshowBanners = data.filter(
    (b) => b.payment_status === "paid" || b.is_active
  );

  return (
    <>
      {/* ── Banner Slideshow Preview ─────────────────── */}
      <BannerSlideshow banners={slideshowBanners} />

      {/* ── Table ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        {pendingReview > 0 && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
            <span className="text-amber-700 text-sm font-semibold">
              {pendingReview} banner{pendingReview !== 1 ? "s" : ""} awaiting review
            </span>
            <span className="text-amber-600 text-xs">— payment confirmed, not yet published</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-6 py-4 text-sm font-semibold text-text-muted">Banner</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-muted">Company</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-muted">Plan</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-muted">Payment</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-muted">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-muted">Run Dates</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-muted">Impr.</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-muted">Clicks</th>
                <th className="px-6 py-4 text-sm font-semibold text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.length > 0 ? (
                data.map((banner) => {
                  const isLoading = loadingId === banner.id;
                  const awaitingReview = banner.payment_status === "paid" && !banner.is_active;

                  return (
                    <tr
                      key={banner.id}
                      className={`hover:bg-gray-50/50 ${
                        awaitingReview ? "bg-amber-50/30" : ""
                      }`}
                    >
                      {/* Banner image thumbnail */}
                      <td className="px-6 py-4">
                        <BannerImage
                          src={banner.logo_url}
                          alt={banner.company_name}
                          className="h-10 w-10 rounded-lg object-contain border border-border"
                          fallbackSize="md"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-text-primary text-sm">
                          {banner.company_name}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5 line-clamp-1 max-w-[180px]">
                          {banner.headline || "No headline"}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">
                          {formatDate(banner.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                            banner.plan === "featured"
                              ? "text-purple-700 bg-purple-100"
                              : "text-blue-700 bg-blue-100"
                          }`}
                        >
                          {banner.plan.charAt(0).toUpperCase() + banner.plan.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <PaymentStatusBadge status={banner.payment_status} />
                      </td>
                      <td className="px-6 py-4">
                        <LiveStatusBadge isActive={banner.is_active} />
                      </td>
                      <td className="px-6 py-4 text-sm text-text-muted whitespace-nowrap">
                        {formatDate(banner.starts_at)} → {formatDate(banner.ends_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary font-mono">
                        {banner.impressions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary font-mono">
                        {banner.clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Awaiting review: show Publish + Reject */}
                          {awaitingReview && (
                            <>
                              <button
                                onClick={() => handleAction(banner.id, "publish")}
                                disabled={isLoading}
                                className="text-xs font-semibold text-white bg-primary hover:bg-primary-dark px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {isLoading ? "…" : "Publish"}
                              </button>
                              <button
                                onClick={() => handleAction(banner.id, "reject")}
                                disabled={isLoading}
                                className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {isLoading ? "…" : "Reject"}
                              </button>
                            </>
                          )}

                          {/* Live: allow deactivation */}
                          {banner.is_active && (
                            <button
                              onClick={() => handleAction(banner.id, "deactivate")}
                              disabled={isLoading}
                              className="text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isLoading ? "…" : "Pause"}
                            </button>
                          )}

                          {/* Rejected / Paused: allow re-publish */}
                          {!banner.is_active &&
                            banner.payment_status !== "pending" &&
                            !awaitingReview && (
                              <button
                                onClick={() => handleAction(banner.id, "publish")}
                                disabled={isLoading}
                                className="text-xs font-semibold text-primary hover:text-primary-dark bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {isLoading ? "…" : "Re-publish"}
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-sm text-text-muted">
                    No sponsor banners yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
