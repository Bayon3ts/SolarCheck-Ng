"use client";

import { motion } from "framer-motion";
import HeroLeadForm from "@/components/forms/hero-lead-form";
import TrustBarMarquee from "@/components/animations/trust-bar-marquee";

/* ═══════════════════════════════════════ */
/* Hero Section — Full viewport, dark green */
/* Stitch: #0D1B12 bg, dramatic, immersive */
/* ═══════════════════════════════════════ */

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden">
      
      {/* VIDEO LAYER */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="hidden md:block absolute inset-0 w-full h-full object-cover object-center"
        poster="/images/hero-poster.jpg"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* MOBILE POSTER LAYER */}
      <div 
        className="md:hidden absolute inset-0 bg-cover bg-center"
        style={{backgroundImage: 'url(/images/hero-poster.jpg)'}}
      />

      {/* GRADIENT OVERLAY LAYER */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to right,
            rgba(13, 27, 18, 0.80) 0%,
            rgba(13, 27, 18, 0.50) 50%,
            rgba(13, 27, 18, 0.25) 100%
          )`
        }}
      />

      {/* MOBILE OVERLAY (Top to bottom) */}
      <div 
        className="md:hidden absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(13, 27, 18, 0.85) 0%,
            rgba(13, 27, 18, 0.60) 100%
          )`
        }}
      />

      {/* Content */}
      <div className="container-custom relative z-10 pt-32 pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Text */}
          <div className="space-y-6">
            <motion.h1
              className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-7xl"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
            >
              {["Find", "Trusted", "Solar", "Installers", "Near", "You"].map(
                (word, i) => (
                  <motion.span
                    key={i}
                    className="mr-3 inline-block md:mr-4"
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5, ease: "easeOut" },
                      },
                    }}
                  >
                    {word}
                  </motion.span>
                )
              )}
            </motion.h1>

            <motion.p
              className="max-w-lg text-lg text-white/70 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Compare verified solar installers across Nigeria. Get free quotes, 
              read real reviews, and find the best solar energy system for your 
              home or business.
            </motion.p>
          </div>

          {/* Right: Lead Form */}
          <div className="flex justify-center lg:justify-end">
            <HeroLeadForm />
          </div>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-2">
        <span className="text-white/60 text-xs tracking-[0.3em] uppercase font-medium">
          Scroll
        </span>
        <div className="w-px h-16 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
      </div>

      {/* Trust bar at bottom */}
      <div className="relative z-10">
        <TrustBarMarquee />
      </div>
    </section>
  );
}
