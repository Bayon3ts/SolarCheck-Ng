import type { Metadata } from 'next'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import EquipmentHero from '@/components/equipment/EquipmentHero'
import EquipmentCard from '@/components/equipment/EquipmentCard'
import { SOLAR_INVERTERS } from '@/data/solar-inverters'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Solar Inverters in Nigeria 2026 — Hybrid Inverter Reviews | SolarCheck',
  description:
    'Compare hybrid solar inverters sold in Nigeria. Real Naira prices, Growatt vs Luminous vs Victron reviews, and expert guidance for Nigerian grid conditions.',
  alternates: { canonical: '/solar-inverters' },
  openGraph: {
    title: 'Best Solar Inverters in Nigeria 2026 — Hybrid Inverter Reviews',
    description:
      'Compare hybrid solar inverters sold in Nigeria. Real Naira prices and honest reviews.',
    url: '/solar-inverters',
  },
}

const BRANDS = ['Growatt', 'Luminous', 'Victron Energy', 'Deye', 'Huawei']

export default function SolarInvertersPage() {
  return (
    <>
      <Navbar />
      <main>
        <EquipmentHero
          emoji="⚡"
          badge="Nigerian Market Prices"
          title="Best Solar Inverters in Nigeria 2026"
          description="Compare hybrid inverters from brands trusted by Nigerian installers — with real Naira pricing and honest efficiency data."
          updatedText="Last updated: June 2026 · Prices from Lagos market"
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
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-text-primary">{SOLAR_INVERTERS.length} inverters found</p>
              <div className="flex flex-wrap gap-2 ml-auto">
                {['All', 'Hybrid', 'Off-grid', 'Grid-tie'].map((f, i) => (
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
              {SOLAR_INVERTERS.map((inverter) => (
                <div key={inverter.slug} id={inverter.brand.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}>
                  <EquipmentCard product={inverter} rating={0} reviewCount={0} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Buyer's Guide */}
        <section className="bg-white section-padding-sm">
          <div className="container-custom max-w-3xl">
            <h2 className="text-3xl font-bold text-text-primary mb-2">How to choose a solar inverter in Nigeria</h2>
            <p className="text-text-muted mb-10">The inverter is the brain of your solar system — get this right.</p>

            <div className="space-y-10">
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  🔌 Hybrid vs Off-grid Inverters for Nigerian Grid Conditions
                </h3>
                <p className="text-text-muted leading-relaxed">
                  Nigeria&apos;s grid is unreliable but not absent — most areas get 4–12 hours of NEPA daily. This makes hybrid
                  inverters the right choice for 95% of Nigerian homes. A hybrid inverter can charge batteries from both
                  solar panels AND NEPA (when available), maximising your charging time. Off-grid inverters are cut off
                  from the grid entirely — only suitable for rural areas with no NEPA access at all. Pure grid-tie inverters
                  (no battery storage) make sense in countries with reliable grids but not in Nigeria. Always choose hybrid.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  📏 Why 5KVA is the Nigerian Residential Sweet Spot
                </h3>
                <p className="text-text-muted leading-relaxed">
                  The 5KVA inverter has become the de facto standard for middle-class Nigerian homes. It handles:
                  1–2 split AC units (1.5HP each), LED lighting throughout the house, refrigerator, TV, and phone charging
                  simultaneously. A 3KVA inverter can&apos;t run an AC. An 8KVA costs significantly more and is overkill for
                  most homes. Most quality 5KVA hybrids (Growatt, Deye) support 4,500W of solar panels and up to 200Ah
                  of battery at 48V — which typically means 2 x 5kWh LFP batteries for overnight coverage with one AC.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  ⚖️ Growatt vs Luminous vs Victron — Honest Comparison
                </h3>
                <p className="text-text-muted leading-relaxed">
                  Growatt SPH wins on value — best app monitoring, widest battery compatibility, strong nationwide service,
                  competitive pricing. It&apos;s the #1 choice for Nigerian installers for a reason. Luminous PCU wins on
                  familiarity and service network — ideal if you already have a Luminous setup or want the most accessible
                  repair service across Nigeria. Victron MultiPlus-II wins on engineering — it&apos;s the most configurable,
                  most reliable inverter money can buy, but at 2–3x the cost. If you&apos;re investing ₦3M+ in a solar system,
                  the extra ₦1.5M for Victron is worth it. For most residential installations under ₦2.5M, Growatt delivers
                  the best outcome.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  ✅ What to Check Before Buying
                </h3>
                <p className="text-text-muted leading-relaxed">
                  Before signing any inverter purchase: confirm the inverter is compatible with your chosen battery voltage
                  (48V for most LFP batteries), verify the max solar input (PV input) can handle your panel array wattage,
                  check the warranty terms are backed by a Nigerian distributor (not just a manufacturer in China), ask for
                  the installer&apos;s experience with that specific brand, and confirm the monitoring app works without constant
                  internet connectivity. Avoid buying inverters from roadside electronics markets — counterfeit Growatt and
                  Luminous units are common. Only purchase from verifiable distributors.
                </p>
              </div>
            </div>

            <div className="mt-12 rounded-2xl bg-primary/5 border border-primary/10 p-8 text-center">
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Using one of these inverters? Share your experience.
              </h3>
              <p className="text-text-muted mb-5">
                Help other Nigerians choose wisely — your real-world review of reliability, app quality,
                and after-sales service is invaluable.
              </p>
              <Link href="/solar-inverters/growatt-sph5000tl3-5kva#write-review" className="btn-primary">
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
