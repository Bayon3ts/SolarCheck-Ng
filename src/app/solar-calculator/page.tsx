import { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CalculatorDashboard from "@/components/forms/calculator-dashboard";
import { CalculatorLoadingWrapper } from "@/components/ui/loading-screen";
import { CalculatorHero } from "@/components/sections/calculator-hero";

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
        <CalculatorHero />

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
