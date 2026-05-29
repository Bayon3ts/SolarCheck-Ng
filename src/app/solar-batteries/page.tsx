import type { Metadata } from 'next'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import EquipmentHero from '@/components/equipment/EquipmentHero'
import EquipmentCard from '@/components/equipment/EquipmentCard'
import { SOLAR_BATTERIES } from '@/data/solar-batteries'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Solar Batteries in Nigeria 2026 — LFP Reviews & Prices | SolarCheck',
  description:
    'Compare lithium solar batteries sold in Nigeria. Real prices in Naira, LFP vs lead acid guide, and reviews of Felicity, Luminous, Huawei, and more.',
  alternates: { canonical: '/solar-batteries' },
  openGraph: {
    title: 'Best Solar Batteries in Nigeria 2026 — LFP Reviews & Prices',
    description:
      'Compare lithium solar batteries sold in Nigeria. Real Naira prices and honest reviews.',
    url: '/solar-batteries',
  },
}

const BRANDS = ['Felicity Solar', 'Luminous', 'Huawei', 'BSL Battery', 'Shoto']

export default function SolarBatteriesPage() {
  return (
    <>
      <Navbar />
      <main>
        <EquipmentHero
          emoji="🔋"
          badge="Nigerian Market Prices"
          title="Best Solar Batteries in Nigeria 2026"
          description="Compare LFP lithium batteries from brands trusted by Nigerian installers — with real Naira pricing and cycle life data."
          updatedText="Last updated: June 2026 · Prices from Lagos & Abuja market"
        />

        {/* Quick brand links */}
        <div className="bg-white border-b border-border sticky top-0 z-20 py-3 shadow-nav">
          <div className="container-custom flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            <span className="text-xs font-semibold text-text-muted shrink-0 mr-1">Jump to:</span>
            {BRANDS.map((brand) => (
              <a
                key={brand}
                href={`#${brand.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`}
                className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
              >
                {brand}
              </a>
            ))}
          </div>
        </div>

        {/* Grid */}
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between mb-8 gap-4 text-center md:text-left">
              <div>
                <span className="font-semibold text-text-primary">
                  LFP vs Lead-Acid? Felicity vs Pylontech?
                </span>
                <span className="text-text-muted md:ml-2 block md:inline mt-1 md:mt-0">
                  Compare any two batteries side by side.
                </span>
              </div>
              <Link href="/compare-batteries" className="btn-primary text-sm px-5 py-2 shrink-0">
                Compare Batteries →
              </Link>
            </div>

            <div className="mb-8 flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-text-primary">{SOLAR_BATTERIES.length} batteries found</p>
              <div className="flex flex-wrap gap-2 ml-auto">
                {['All', 'LFP / Lithium Iron', 'Lithium Ion', 'Lead Acid'].map((f, i) => (
                  <button
                    key={f}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary ${i === 0 ? 'border-primary text-primary bg-primary/5' : 'border-border text-text-muted'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SOLAR_BATTERIES.map((battery) => (
                <div key={battery.slug} id={battery.brand.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}>
                  <EquipmentCard product={battery} rating={0} reviewCount={0} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Buyer's Guide */}
        <section className="bg-white section-padding-sm">
          <div className="container-custom max-w-3xl">
            <h2 className="text-3xl font-bold text-text-primary mb-2">How to choose a solar battery in Nigeria</h2>
            <p className="text-text-muted mb-10">Everything Nigerian homeowners need to know about solar battery storage.</p>

            <div className="space-y-10">
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  ⚡ Lead Acid vs Lithium in Nigeria
                </h3>
                <p className="text-text-muted leading-relaxed">
                  Until 2022, most Nigerian solar systems used lead acid (tubular) batteries. They&apos;re cheaper upfront but
                  have significant drawbacks: 50% depth of discharge (you can only use half the capacity), 500–800 cycle
                  life (2–3 years of daily use), heavy water maintenance, and high replacement frequency. LFP lithium
                  batteries cost 3–4x more upfront but offer 100% depth of discharge, 3,500–6,000 cycles (8–15 years),
                  zero maintenance, and much better performance in Nigeria&apos;s heat. For any new solar installation in 2026,
                  lithium is the clear choice — the lifecycle economics heavily favour LFP over tubular batteries.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  🔋 Why LFP is Now the Standard for Nigerian Solar
                </h3>
                <p className="text-text-muted leading-relaxed">
                  LFP (Lithium Iron Phosphate) has become the dominant battery chemistry in Nigerian residential solar for
                  three reasons: safety (no thermal runaway risk unlike NMC lithium), longevity (4,000+ cycles vs 500 for
                  lead acid), and Nigerian climate compatibility. LFP cells perform well at the high temperatures inside
                  Nigerian equipment rooms and don&apos;t require air conditioning. The 51.2V/48V format is now the universal
                  standard — compatible with Growatt, Luminous, Deye, and virtually all inverters sold in Nigeria.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  📐 What Battery Capacity Do You Actually Need?
                </h3>
                <p className="text-text-muted leading-relaxed">
                  A typical Nigerian middle-class home with 2 ACs, lights, fans, fridge, and TV uses 15–25kWh per day
                  when NEPA is available. However, most homeowners only need to cover the NEPA outage periods (which
                  average 12–18 hours/day in Lagos). A single 5kWh LFP battery will run a basic load (fans, lights,
                  phone charging, small fridge) for 8–10 hours. For air conditioning, plan for 1.5–2kWh per AC unit per
                  hour. Most Nigerian installers recommend 2–3 batteries (10–15kWh) for comfortable overnight coverage
                  with one split AC unit.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  💰 Price Guide: ₦600k vs ₦1.8M Battery — What&apos;s the Difference?
                </h3>
                <p className="text-text-muted leading-relaxed">
                  The ₦580,000–₦720,000 tier (BSL, Shoto Tier) gives you solid LFP chemistry with 4,000 cycles and
                  standard BMS protection — perfectly adequate for most homes. The ₦750,000–₦950,000 mid-range (Felicity,
                  Luminous) adds stronger local warranty support and better quality control. At the premium ₦1,200,000–
                  ₦1,800,000 level (Huawei LUNA2000), you get 6,000 cycles, a 10-year warranty, modular expandability, and
                  AI-powered energy management. For most Nigerian homeowners, Felicity or Luminous represents the optimal
                  value point. Huawei makes sense for those investing in a premium, long-term system with Huawei inverters.
                </p>
              </div>
            </div>

            <div className="mt-12 rounded-2xl bg-primary/5 border border-primary/10 p-8 text-center">
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Using one of these batteries? Share your experience.
              </h3>
              <p className="text-text-muted mb-5">
                Help other Nigerians understand real-world performance — cycle counts, capacity retention, and
                how well warranties were honoured.
              </p>
              <Link href="/solar-batteries/felicity-lithium-100ah-51v#write-review" className="btn-primary">
                Write a Review →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
