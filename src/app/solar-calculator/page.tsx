import { Metadata } from "next";
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
        <div className="container-custom max-w-4xl text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            ☀️ Free Solar Sizing Tool
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight">
            Nigerian Solar Cost <br className="hidden md:block"/>
            <span className="text-primary">and Savings Calculator</span>
          </h1>
          <p className="mt-4 text-lg text-text-muted max-w-2xl mx-auto">
            Using your state and monthly electricity bills, our calculator gives you an accurate
            estimate of solar system cost, monthly savings vs generator, and payback period
            — all based on real Nigerian market data.
          </p>
          <p className="mt-2 text-sm font-medium text-gray-500">
            Last updated: May 2026 · Fuel price: ₦1,000/L · NERC tariff: Band A–E
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 mb-6 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="text-primary font-bold">500+</span>
              <span>verified Nigerian installers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-primary font-bold">36</span>
              <span>states covered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-primary font-bold">Free</span>
              <span>for homeowners · always</span>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <CalculatorLoadingWrapper>
          <CalculatorDashboard />
        </CalculatorLoadingWrapper>
      </main>
      <Footer />
    </>
  );
}
