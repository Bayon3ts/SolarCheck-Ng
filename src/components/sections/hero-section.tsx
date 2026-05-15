"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import HeroLeadForm from "@/components/forms/hero-lead-form";
import TrustBarMarquee from "@/components/animations/trust-bar-marquee";

/* ═══════════════════════════════════════ */
/* Hero Section — Full viewport, dark green */
/* Stitch: #0D1B12 bg, dramatic, immersive */
/* ═══════════════════════════════════════ */

export default function HeroSection() {
  const line1Words = ["Stop", "Overpaying", "for", "Power."];
  const line2Words = ["Find", "Out", "What", "Solar", "Really", "Costs", "You."];

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
      <div className="container-custom relative z-10 pt-24 pb-16">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <motion.h1
                className="text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl"
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
                <div className="block mb-2">
                  {line1Words.map((word, i) => (
                    <motion.span
                      key={`l1-${i}`}
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
                  ))}
                </div>
                <div className="block text-[#F5A623]">
                  {line2Words.map((word, i) => (
                    <motion.span
                      key={`l2-${i}`}
                      className="mr-3 inline-block md:mr-4"
                      variants={{
                        hidden: { opacity: 0, y: 30 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { 
                            duration: 0.5, 
                            ease: "easeOut",
                            delay: 0.2 + (line1Words.length * 0.08) // Starts 0.2s after Line 1 sequence begins
                          },
                        },
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
              </motion.h1>

              <motion.p
                className="max-w-lg text-lg text-white/70 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                Based on your location and monthly bill — we show you exactly 
                what solar costs and how much you save vs your generator. 
                Free. No obligation. Results in 60 seconds.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <motion.div 
                className="flex flex-col md:flex-row items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <Link
                  href="/solar-calculator"
                  className="w-full md:w-auto px-8 py-4 bg-[#F5A623] text-[#0D1B12] font-bold rounded-full text-base text-center transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-95"
                >
                  Calculate My Savings →
                </Link>
                <Link
                  href="/get-quotes"
                  className="w-full md:w-auto px-8 py-4 bg-transparent text-white border-2 border-white/50 rounded-full text-base text-center transition-all duration-300 hover:border-white hover:bg-white/10 active:scale-95"
                >
                  Get Free Quotes
                </Link>
              </motion.div>

              {/* Trust Line */}
              <motion.p
                className="text-xs md:text-sm text-white/60 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                ⚡ 500+ verified installers · ₦0 cost to homeowners · Results in 60 seconds
              </motion.p>
            </div>
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
