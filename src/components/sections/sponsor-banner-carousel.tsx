"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Building2 } from "lucide-react";

/* ═══════════════════════════════════════════════════════════ */
/* SponsorBannerCarousel — hero-style dark carousel           */
/* Supports optional full-bleed bg_image_url per slide        */
/* framer-motion AnimatePresence for smooth transitions       */
/* ═══════════════════════════════════════════════════════════ */

export interface BannerData {
  id: string;
  company_name: string;
  logo_url: string;
  headline: string;
  cta_text: string;
  cta_url: string;
  plan: "standard" | "featured";
  placement_location?: "calculator" | "directory" | "guides";
  /** Optional full-bleed background image for this slide */
  bg_image_url?: string;
  /** Set to true for the /advertise page live-preview slide */
  isPreview?: boolean;
}

interface Props {
  banners: BannerData[];
  /** When true, disables click/impression tracking (used on /advertise preview) */
  previewMode?: boolean;
}

const PLACEMENT_BADGE: Record<string, string> = {
  calculator: "Recommended Partner",
  directory: "Featured Installer",
  guides: "Sponsored Article",
};

const SLIDE_DURATION = 0.42;
const SLIDE_EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function SponsorBannerCarousel({ banners, previewMode = false }: Props) {
  const [[activeIndex, direction], setPage] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());
  const [failedBgs, setFailedBgs] = useState<Set<string>>(new Set());

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prev]) => {
        const next = (prev + newDirection + banners.length) % banners.length;
        return [next, newDirection];
      });
    },
    [banners.length]
  );

  const fireImpression = useCallback(
    (bannerId: string) => {
      if (previewMode) return;
      fetch(`/api/banners/${bannerId}/impression`, { method: "POST" }).catch(() => { });
    },
    [previewMode]
  );

  useEffect(() => {
    if (banners.length > 0 && !previewMode) fireImpression(banners[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-advance every 5 s
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const interval = setInterval(() => {
      setPage(([prev]) => {
        const next = (prev + 1) % banners.length;
        if (!previewMode) fireImpression(banners[next].id);
        return [next, 1];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, banners, fireImpression, previewMode]);

  const handleCtaClick = (banner: BannerData) => {
    if (previewMode || banner.isPreview) return;
    fetch(`/api/banners/${banner.id}/click`, { method: "POST" }).catch(() => { });
    window.open(banner.cta_url, "_blank", "noopener,noreferrer");
  };

  const activeBanner = banners[activeIndex];
  const hasBgImage =
    !!activeBanner.bg_image_url && !failedBgs.has(activeBanner.id);

  const badgeLabel = activeBanner.placement_location
    ? PLACEMENT_BADGE[activeBanner.placement_location]
    : activeBanner.plan === "featured"
      ? "Featured Partner"
      : null;

  return (
    <div
      className="relative w-full group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Main card ─────────────────────────────────────────────── */}
      <div className="relative h-56 sm:h-64 md:h-72 bg-gradient-to-r from-emerald-950 via-gray-900 to-emerald-900 border border-emerald-950/40 shadow-xl rounded-3xl overflow-hidden">

        {/* Animated glow accent — only visible when no bg image */}
        {!hasBgImage && (
          <>
            {/* Sunshine effect on the right */}
            {/* Subtle emerald glow on the right */}
            <div className="pointer-events-none absolute -top-16 -right-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-[60px] animate-pulse" />
            {/* Dark green ambient glow on the left */}
            <div className="pointer-events-none absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-[50px] animate-pulse [animation-delay:2s]" />
          </>
        )}

        {/* ── Background image (full-bleed, behind everything) ────── */}
        <AnimatePresence initial={false}>
          {hasBgImage && (
            <motion.div
              key={`bg-${activeIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.5 } }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeBanner.bg_image_url!}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
                onError={() =>
                  setFailedBgs((prev) => new Set(prev).add(activeBanner.id))
                }
              />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-950/20 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Slide content ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeIndex}
            initial={{ x: direction > 0 ? 60 : -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: { duration: SLIDE_DURATION, ease: SLIDE_EASE } }}
            exit={{ x: direction > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.28, ease: SLIDE_EASE } }}
            className="absolute inset-0 z-10 flex flex-col items-start px-12 sm:px-16 pt-8 sm:pt-12"
          >
            <div className="max-w-xl w-full flex flex-col items-start">
              {/* ── Badge ─────────────────── */}
              {badgeLabel && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-full mb-4 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                  ★ {badgeLabel}
                </span>
              )}

              {/* ── Logo & Text Row ───────── */}
              <div className="flex items-center gap-4 mb-6 w-full">
                {/* Logo */}
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center p-1.5 backdrop-blur-sm shadow-sm">
                  {failedLogos.has(activeBanner.id) || !activeBanner.logo_url ? (
                    <Building2 className="w-7 h-7 text-white/60" />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={activeBanner.logo_url}
                      alt={`${activeBanner.company_name} logo`}
                      className="h-full w-full object-contain"
                      loading="eager"
                      decoding="async"
                      ref={(img) => {
                        if (img?.complete && img.naturalWidth === 0) {
                          setFailedLogos((prev) => {
                            if (prev.has(activeBanner.id)) return prev;
                            return new Set(prev).add(activeBanner.id);
                          });
                        }
                      }}
                      onError={() =>
                        setFailedLogos((prev) => new Set(prev).add(activeBanner.id))
                      }
                    />
                  )}
                </div>

                {/* Text block */}
                <div className="min-w-0 flex-1">
                  <p className="text-xl sm:text-2xl font-bold text-white leading-tight line-clamp-2">
                    {activeBanner.headline || "Your headline will appear here"}
                  </p>
                  <p className="text-sm text-emerald-200/70 mt-0.5 truncate font-medium">
                    {activeBanner.company_name || "Company Name"}
                  </p>
                </div>
              </div>

              {/* ── CTA Button ────────────── */}
              <button
                onClick={() => handleCtaClick(activeBanner)}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:scale-105 transition-all duration-200 whitespace-nowrap"
              >
                {activeBanner.cta_text || "Learn more"}
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Sponsored disclosure */}
        <span className="absolute top-4 right-4 z-20 inline-flex items-center text-[10px] uppercase font-bold text-white/80 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-md tracking-wider select-none pointer-events-none">
          Sponsored
        </span>

        {/* ── Prev / Next arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => { paginate(-1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/70 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
              aria-label="Previous sponsor"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => { paginate(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/70 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
              aria-label="Next sponsor"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* ── Dot indicators ─────────────────────────────────────────── */}
      {banners.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (!previewMode) fireImpression(banners[i].id);
                setPage(([prev]) => [i, i > prev ? 1 : -1]);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex
                  ? "w-7 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : "w-1.5 bg-gray-400/40 hover:bg-gray-400/70"
                }`}
              aria-label={`Go to sponsor ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
