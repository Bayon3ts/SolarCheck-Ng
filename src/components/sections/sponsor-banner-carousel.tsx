"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

/* ═══════════════════════════════════════ */
/* SponsorBannerCarousel — client comp    */
/* Plain useState + setInterval carousel  */
/* Mirrors testimonials-carousel.tsx      */
/* ═══════════════════════════════════════ */

export interface BannerData {
  id: string;
  company_name: string;
  logo_url: string;
  headline: string;
  cta_text: string;
  cta_url: string;
  plan: "standard" | "featured";
}

interface Props {
  banners: BannerData[];
}

export default function SponsorBannerCarousel({ banners }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fire impression when slide becomes active
  const fireImpression = useCallback((bannerId: string) => {
    fetch(`/api/banners/${bannerId}/impression`, { method: "POST" }).catch(
      () => {} // silently swallow — analytics, not critical path
    );
  }, []);

  // Track first impression on mount
  useEffect(() => {
    if (banners.length > 0) {
      fireImpression(banners[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-advance every 5 s, same cadence as testimonials
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        fireImpression(banners[next].id);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, banners, fireImpression]);

  const handlePrev = () => {
    setActiveIndex((prev) => {
      const next = (prev - 1 + banners.length) % banners.length;
      fireImpression(banners[next].id);
      return next;
    });
  };

  const handleNext = () => {
    setActiveIndex((prev) => {
      const next = (prev + 1) % banners.length;
      fireImpression(banners[next].id);
      return next;
    });
  };

  const handleCtaClick = (banner: BannerData) => {
    fetch(`/api/banners/${banner.id}/click`, { method: "POST" }).catch(() => {});
    window.open(banner.cta_url, "_blank", "noopener,noreferrer");
  };

  const activeBanner = banners[activeIndex];

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Prev / Next buttons — only shown when >1 banner */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-text-muted hover:bg-gray-200 transition-colors focus:outline-none"
            aria-label="Previous sponsor"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-text-muted hover:bg-gray-200 transition-colors focus:outline-none"
            aria-label="Next sponsor"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Banner card — slim strip layout */}
      <div className="bg-white border border-border rounded-2xl shadow-card px-12 py-6 relative overflow-hidden">
        {/* "Sponsored" label — required disclosure */}
        <span className="absolute top-2 right-3 text-xs text-text-muted select-none">
          Sponsored
        </span>

        {/* Featured Partner badge */}
        {activeBanner.plan === "featured" && (
          <span className="absolute top-2 left-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            ★ Featured Partner
          </span>
        )}

        {/* Slide content — flex row on desktop, stack on mobile */}
        <div
          key={activeBanner.id}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
        >
          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeBanner.logo_url}
            alt={`${activeBanner.company_name} logo`}
            className="h-12 w-auto max-w-[120px] object-contain flex-shrink-0"
            onError={(e) => {
              // Hide broken logo gracefully
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />

          {/* Text */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="font-semibold text-text-primary text-sm sm:text-base leading-tight line-clamp-2">
              {activeBanner.headline}
            </p>
            <p className="text-xs text-text-muted mt-0.5">{activeBanner.company_name}</p>
          </div>

          {/* CTA button */}
          <button
            onClick={() => handleCtaClick(activeBanner)}
            className="inline-flex items-center gap-1.5 flex-shrink-0 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors"
          >
            {activeBanner.cta_text}
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Dot indicators — only when >1 banner */}
      {banners.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                fireImpression(banners[i].id);
                setActiveIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to sponsor ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
