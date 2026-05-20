import { Metadata } from "next";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import FeederSearch from "@/components/tools/feeder-search";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Check Your Lagos Electricity Band — Find Your IKEDC & EKEDC Feeder | SolarCheck",
  description: "Search 372 Lagos electricity feeders across IKEDC and EKEDC to find your service band, supply hours, and tariff.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Lagos IKEDC Electricity Service Bands",
  "description": "Official IKEDC feeder service bands, supply hours, and tariff rates for all 317 feeders in Lagos — from NERC ORDER/NERC/2025/050",
  "url": "https://solarcheckng.com/lagos-power-bands",
  "creator": {
    "@type": "Organization",
    "name": "SolarCheck Nigeria"
  },
  "license": "https://nerc.gov.ng",
  "temporalCoverage": "2025-05-01/.."
};

export default function LagosPowerBandsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen bg-gray-50 pb-24">
        {/* Hero Section */}
        <div className="bg-primary-dark text-white py-20 px-4 text-center">
          <div className="container-custom">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-white/10">
              ⚡ Official NERC Data Integration
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight tracking-tight">
              What Electricity Band Is <br className="hidden md:block" /> Your Street On?
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed font-medium">
              Search any Lagos street or area to find your IKEDC service band, guaranteed supply hours, and official NERC tariff rate.
            </p>
            <p className="text-white/40 text-sm font-mono tracking-widest uppercase">
              372 IKEDC and EKEDC feeders • Official NERC data
            </p>
          </div>
        </div>

        {/* Search & Tool Section */}
        <section className="container-custom">
          <FeederSearch />
        </section>

        {/* Band Explanation Table */}
        <section className="container-custom max-w-4xl mt-12 px-4">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Service Band Breakdown</h2>
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left">
                <thead className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="pb-4 px-4">Band</th>
                    <th className="pb-4 px-4">Hours/Day</th>
                    <th className="pb-4 px-4">Tariff</th>
                    <th className="pb-4 px-4">What it means</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { band: 'A', hours: '20+', tariff: '₦209.50', status: 'Premium service', color: 'bg-green-50 text-green-700 border-green-200' },
                    { band: 'B', hours: '16–20', tariff: '₦62.48', status: 'Good service', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                    { band: 'C', hours: '12–16', tariff: '₦45.80', status: 'Moderate', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                    { band: 'D', hours: '8–12', tariff: '₦31.24', status: 'Unreliable', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                    { band: 'E', hours: '4–8', tariff: '₦31.24', status: 'Critical case', color: 'bg-red-50 text-red-700 border-red-200' },
                  ].map((row) => (
                    <tr key={row.band} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-md font-bold text-sm border ${row.color}`}>
                          Band {row.band}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-text-primary">{row.hours} hrs</td>
                      <td className="py-4 px-4 font-bold text-text-primary">{row.tariff}</td>
                      <td className="py-4 px-4 text-text-muted">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-8 text-xs text-text-muted bg-gray-50 p-4 rounded-xl leading-relaxed">
              <strong>Data Source:</strong> Tariffs and service specifications are sourced directly from Nigerian Electricity Regulatory Commission (NERC) <strong>ORDER/NERC/2025/050</strong>, Multi-Year Tariff Order (MYTO) 2025. Actual supply may vary based on local grid faults or maintenance.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link 
              href="/lagos-power-bands"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all underline-offset-4 hover:underline"
            >
              Don&apos;t want to wait for grid power? Calculate solar savings
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
