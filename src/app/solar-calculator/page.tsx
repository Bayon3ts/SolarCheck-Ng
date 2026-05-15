import { Metadata } from "next";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CalculatorWizard from "@/components/forms/calculator-wizard";

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
        <div className="container-custom max-w-3xl text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            ☀️ Free Solar Sizing Tool
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight">
            How Much Does Solar Cost{" "}
            <span className="text-primary">In Nigeria?</span>
          </h1>
          <p className="mt-4 text-lg text-text-muted max-w-xl mx-auto">
            Answer 3 quick questions and get your recommended system size, real cost range,
            and exactly how long before solar pays for itself.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-text-muted">
            <span className="flex items-center gap-1.5">✅ Real Nigerian market prices</span>
            <span className="flex items-center gap-1.5">✅ All 36 states supported</span>
            <span className="flex items-center gap-1.5">✅ Takes under 2 minutes</span>
          </div>
        </div>

        {/* Wizard */}
        <div className="container-custom">
          <CalculatorWizard />
        </div>
      </main>
      <Footer />
    </>
  );
}
