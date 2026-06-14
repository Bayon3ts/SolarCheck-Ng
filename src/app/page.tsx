import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import HeroSection from "@/components/sections/hero-section";
import HowItWorksSection from "@/components/sections/how-it-works-section";
import StatsSection from "@/components/sections/stats-section";
import FeaturedInstallersSection from "@/components/sections/featured-installers-section";
import CalculatorTeaser from "@/components/sections/calculator-teaser";
import VerificationSection from "@/components/sections/verification-section";
import TestimonialsSection from "@/components/sections/testimonials-section";

export const revalidate = 0;

import BlogTeaser from "@/components/sections/blog-teaser";
import FinalCTA from "@/components/sections/final-cta";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "SolarCheck Nigeria — Find Trusted Solar Installers Near You",
  description:
    "Compare 500+ verified solar installers across Nigeria. Get free quotes, read reviews from 12,000+ homeowners, and find the best solar system for your home.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />

        {/* ── Equipment Review Hub ─────────────────────────── */}
        <section className="py-16 bg-white">
          <div className="container-custom text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <span className="inline-block animate-spin" style={{ animationDuration: "3s" }}>⭐</span> Unbiased Nigerian Market Reviews
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              Find expert reviews of the solar equipment you need
            </h2>
            <p className="text-text-muted max-w-xl mx-auto">
              Real prices in Naira. Real reviews from Nigerian homeowners. All brands sold in Nigeria.
            </p>
          </div>

          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Panels */}
              <Link
                href="/solar-panels"
                className="group relative overflow-hidden rounded-3xl bg-primary/5 border border-primary/10 p-8 text-center hover:bg-primary hover:border-primary transition-all duration-300 cursor-pointer"
              >
                <div className="w-48 h-48 mx-auto mb-6 relative rounded-2xl overflow-hidden">
                  <Image src="/equipment/solar-panel.jpg" alt="Solar Panels" fill className="object-contain mix-blend-multiply" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <h3 className="text-xl font-bold text-text-primary group-hover:text-white mb-2">
                  Solar Panels
                </h3>
                <p className="text-text-muted text-sm group-hover:text-white/80 mb-4">
                  Jinko, Canadian Solar, Longi & more
                </p>
                <div className="text-primary group-hover:text-white font-semibold text-sm">
                  Compare panels →
                </div>
              </Link>

              {/* Batteries */}
              <Link
                href="/solar-batteries"
                className="group relative overflow-hidden rounded-3xl bg-accent/10 border border-accent/20 p-8 text-center hover:bg-accent hover:border-accent transition-all duration-300 cursor-pointer"
              >
                <div className="w-48 h-48 mx-auto mb-6 relative rounded-2xl overflow-hidden">
                  <Image src="/equipment/battery.png" alt="Solar Batteries" fill className="object-contain mix-blend-multiply" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <h3 className="text-xl font-bold text-text-primary group-hover:text-gray-900 mb-2">
                  Solar Batteries
                </h3>
                <p className="text-text-muted text-sm group-hover:text-gray-700 mb-4">
                  Felicity, Luminous, Huawei & more
                </p>
                <div className="text-accent-dark group-hover:text-gray-800 font-semibold text-sm">
                  Compare batteries →
                </div>
              </Link>

              {/* Inverters */}
              <Link
                href="/solar-inverters"
                className="group relative overflow-hidden rounded-3xl bg-blue-50 border border-blue-100 p-8 text-center hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 cursor-pointer"
              >
                <div className="w-48 h-48 mx-auto mb-6 relative rounded-2xl overflow-hidden">
                  <Image src="/equipment/inverter.png" alt="Solar Inverters" fill className="object-contain mix-blend-multiply" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <h3 className="text-xl font-bold text-text-primary group-hover:text-white mb-2">
                  Solar Inverters
                </h3>
                <p className="text-text-muted text-sm group-hover:text-white/80 mb-4">
                  Growatt, Luminous, Victron & more
                </p>
                <div className="text-blue-600 group-hover:text-white font-semibold text-sm">
                  Compare inverters →
                </div>
              </Link>

            </div>
          </div>
        </section>
        {/* ── End Equipment Review Hub ─────────────────────── */}

        <HowItWorksSection />
        <StatsSection />
        <FeaturedInstallersSection />
        <CalculatorTeaser />
        <VerificationSection />
        <TestimonialsSection />
        <BlogTeaser />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
