import type { Metadata } from "next";
import HeroSection from "@/components/sections/hero-section";
import ProblemSection from "@/components/sections/problem-section";
import HowItWorksSection from "@/components/sections/how-it-works-section";
import StatsSection from "@/components/sections/stats-section";
import FeaturedInstallersSection from "@/components/sections/featured-installers-section";
import CalculatorTeaser from "@/components/sections/calculator-teaser";
import VerificationSection from "@/components/sections/verification-section";
import TestimonialsSection from "@/components/sections/testimonials-section";
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
        <ProblemSection />
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
