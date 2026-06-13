import { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CalculatorDashboard from "@/components/forms/calculator-dashboard";
import { CalculatorLoadingWrapper } from "@/components/ui/loading-screen";

export const metadata: Metadata = {
  title: "Nigerian Solar Calculator — Size & Cost Your System | SolarCheck Nigeria",
  description:
    "Free solar calculator for Nigeria. Enter your electricity bill and appliances to get your recommended system size, exact cost range, and payback period in under 2 minutes.",
};



export default function SolarCalculatorPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-28 pb-24">
        {/* Hero */}
        <div className="text-center py-10 bg-primary px-4 mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <span>⚡</span>
            Free — Installers charge ₦25,000–₦50,000 for this
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            Free Solar Load Analysis
          </h1>

          <p className="text-white/80 max-w-xl mx-auto text-base leading-relaxed">
            Enter your appliances below and get a complete load analysis — the same report installers charge for. Includes exact system sizing, Naira pricing, and payback date.
          </p>

          {/* 3 trust pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            {[
              '✓ Free forever',
              '✓ No installer visit needed',
              '✓ Live fuel prices',
              '✓ Naira pricing',
            ].map(item => (
              <span key={item} className="text-xs text-white/70 bg-white/10 px-3 py-1 rounded-full">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard */}
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-text-muted">Loading calculator...</div>
          </div>
        }>
          <CalculatorLoadingWrapper>
            <CalculatorDashboard />
          </CalculatorLoadingWrapper>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
