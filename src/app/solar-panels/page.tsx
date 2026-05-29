import type { Metadata } from 'next'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import EquipmentHero from '@/components/equipment/EquipmentHero'
import EquipmentCard from '@/components/equipment/EquipmentCard'
import { SOLAR_PANELS } from '@/data/solar-panels'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Solar Panels in Nigeria 2026 — Reviews & Prices | SolarCheck',
  description:
    'Compare solar panels sold in Nigeria. Real prices in Naira, expert reviews, and performance data for Jinko, Canadian Solar, Longi, and more.',
  alternates: { canonical: '/solar-panels' },
  openGraph: {
    title: 'Best Solar Panels in Nigeria 2026 — Reviews & Prices',
    description:
      'Compare solar panels sold in Nigeria. Real prices in Naira, expert reviews, and performance data.',
    url: '/solar-panels',
  },
}

const BRANDS = ['Jinko Solar', 'Longi Solar', 'Canadian Solar', 'Risen Energy', 'Astronergy']

export default function SolarPanelsPage() {
  return (
    <>
      <Navbar />
      <main>
        <EquipmentHero
          emoji="☀️"
          badge="Nigerian Market Prices"
          title="Best Solar Panels in Nigeria 2026"
          description="Compare prices, specs, and real reviews of solar panels sold by Nigerian installers — with Naira pricing."
          updatedText="Last updated: June 2026 · Prices from Lagos market"
          bgImage="/solar-panels-hero.jpg"
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
            {/* Compare CTA Banner */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
              <div>
                <span className="font-semibold text-text-primary">
                  Can&apos;t decide between two panels?
                </span>
                <span className="text-text-muted md:ml-2 block md:inline">
                  Compare them side by side.
                </span>
              </div>
              <Link href="/compare-panels" className="btn-primary shrink-0 text-sm px-5 py-2">
                Compare Panels →
              </Link>
            </div>

            {/* Filter bar */}
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-text-primary">{SOLAR_PANELS.length} panels found</p>
              <div className="flex flex-wrap gap-2 ml-auto">
                {['All', 'Monocrystalline', 'TOPCon / N-type', 'PERC'].map((f) => (
                  <button
                    key={f}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-primary hover:text-primary first:border-primary first:text-primary first:bg-primary/5"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SOLAR_PANELS.map((panel) => (
                <div key={panel.slug} id={panel.brand.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}>
                  <EquipmentCard product={panel} rating={0} reviewCount={0} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Buyer's Guide */}
        <section className="bg-white section-padding-sm">
          <div className="container-custom max-w-3xl">
            <h2 className="text-3xl font-bold text-text-primary mb-2">How to choose solar panels in Nigeria</h2>
            <p className="text-text-muted mb-10">An honest guide for Nigerian homeowners — no jargon, no brand bias.</p>

            <div className="space-y-10">
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  🌡️ Monocrystalline vs Polycrystalline in Nigerian Heat
                </h3>
                <p className="text-text-muted leading-relaxed">
                  Nigeria&apos;s average ambient temperature of 28–35°C is a real challenge for solar panels. All solar
                  panels lose efficiency as temperature rises — this is called the temperature coefficient. Modern
                  monocrystalline panels (especially N-type TOPCon cells) have the best temperature coefficients,
                  meaning they lose less power in Lagos or Kano heat compared to older polycrystalline or PERC panels.
                  For Nigerian climates, N-type TOPCon panels from brands like Jinko Tiger Neo are the recommended choice.
                  Polycrystalline panels are now largely obsolete — avoid them even at budget pricing.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  📋 What Warranty Actually Means in Nigeria
                </h3>
                <p className="text-text-muted leading-relaxed">
                  A 25-year warranty sounds great, but what matters is whether it&apos;s enforceable in Nigeria. Chinese brands
                  like Jinko and Longi have established Nigerian distributors who can process warranty claims. Always purchase
                  from an authorized distributor — not from roadside markets or unverified online sellers. Ask for a
                  warranty registration certificate at purchase. Without a local distributor network, a manufacturer warranty
                  is worthless. Canadian Solar and Jinko currently have the strongest warranty claim processes in Nigeria.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  🔍 How to Spot Fake & Grey Market Panels
                </h3>
                <p className="text-text-muted leading-relaxed">
                  Counterfeit solar panels are a serious problem in Nigeria. Common signs of a fake panel: the wattage rating
                  is inflated (a real 550W panel weighs ~28kg — if it&apos;s lighter, be suspicious), the serial number doesn&apos;t
                  verify on the manufacturer&apos;s website, the price is more than 30% below market rate, and the frame build feels
                  thin or flimsy. Always check serial numbers on Jinko&apos;s website (jinkosolar.com) or Longi&apos;s verification
                  portal before payment. Reputable installers on SolarCheck source only from verified distributors.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  💰 Price Guide: ₦65k vs ₦130k per 550W Panel — What Do You Get?
                </h3>
                <p className="text-text-muted leading-relaxed">
                  At the ₦65,000–₦75,000 budget tier (Risen Energy, BSL) you get genuine Tier 1 monocrystalline panels
                  with solid performance — perfectly adequate for most homes. Moving to ₦85,000–₦110,000 (Jinko Tiger Neo,
                  Astronergy) buys you TOPCon N-type technology with better heat performance, lower degradation (0.40%/yr
                  vs 0.55%/yr), and stronger distribution networks. The premium ₦110,000–₦130,000 tier (Longi Hi-MO 6)
                  offers the highest efficiency for space-constrained roofs. For a typical 10-panel system, the difference
                  between budget and premium is ₦500,000–₦650,000 — often worth it for the 0.15% lower annual degradation
                  over 25 years of use.
                </p>
              </div>
            </div>

            {/* Write a review CTA */}
            <div className="mt-12 rounded-2xl bg-primary/5 border border-primary/10 p-8 text-center">
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Own one of these panels? Help other Nigerians make better decisions.
              </h3>
              <p className="text-text-muted mb-5">
                Your honest review of performance, installation experience, and value for money could save a Nigerian
                homeowner from a bad decision.
              </p>
              <Link href="/solar-panels/jinko-tiger-neo-550w#write-review" className="btn-primary">
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
