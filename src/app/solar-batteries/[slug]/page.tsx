import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import StarRating from '@/components/ui/star-rating'
import ReviewForm from '@/components/equipment/ReviewForm'
import EquipmentCard from '@/components/equipment/EquipmentCard'
import { SOLAR_BATTERIES, SolarBattery } from '@/data/solar-batteries'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return SOLAR_BATTERIES.map((b) => ({ slug: b.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const battery = SOLAR_BATTERIES.find((b) => b.slug === params.slug)
  if (!battery) return { title: 'Battery Not Found' }
  return {
    title: `${battery.brand} ${battery.model} Review — Price & Specs in Nigeria | SolarCheck`,
    description: `${battery.brand} ${battery.model} review for the Nigerian market. Price: ₦${battery.priceMin.toLocaleString('en-NG')} – ₦${battery.priceMax.toLocaleString('en-NG')}. ${battery.capacityKwh}kWh, ${battery.cycleLife} cycles, ${battery.warranty}-year warranty.`,
    alternates: { canonical: `/solar-batteries/${battery.slug}` },
  }
}

function formatPrice(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

const ORIGIN_LABELS: Record<string, string> = { CN: '🇨🇳 China', US: '🇺🇸 USA', KR: '🇰🇷 South Korea', IN: '🇮🇳 India', NL: '🇳🇱 Netherlands' }

export default function SolarBatteryDetailPage({ params }: Props) {
  const battery = SOLAR_BATTERIES.find((b) => b.slug === params.slug)
  if (!battery) notFound()

  const related = SOLAR_BATTERIES.filter((b) => b.slug !== battery.slug).slice(0, 3)
  const initials = battery.brand.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

  return (
    <>
      <Navbar />
      <main>
        {/* Breadcrumb */}
        <div className="bg-white border-b border-border py-3">
          <div className="container-custom">
            <nav className="flex items-center gap-2 text-sm text-text-muted">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link href="/solar-batteries" className="hover:text-primary transition-colors">Solar Batteries</Link>
              <span>/</span>
              <span className="text-text-primary font-medium">{battery.model}</span>
            </nav>
          </div>
        </div>

        {/* Product Header */}
        <section className="bg-white py-12">
          <div className="container-custom">
            <div className="grid gap-10 lg:grid-cols-2 items-start">
              {/* Left: Image / placeholder */}
              <div className="flex items-center justify-center rounded-3xl bg-gradient-to-br from-accent/5 to-accent/10 h-80">
                {battery.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={battery.imageUrl} alt={battery.model} className="h-full w-full object-contain p-10" />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-accent/10 text-4xl font-bold text-accent-dark">{initials}</div>
                    <span className="text-sm font-medium text-text-muted">{battery.brand}</span>
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div>
                {battery.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white mb-3">⭐ Most Popular</span>
                )}
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">{battery.brand}</p>
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mt-1 mb-3">{battery.model}</h1>
                <StarRating rating={0} size="md" showValue reviewCount={0} />

                {/* Specs table */}
                <div className="mt-6 rounded-2xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Chemistry', `${battery.chemistry} — ${battery.type}`],
                        ['Capacity', `${battery.capacityKwh}kWh`],
                        ['Voltage', `${battery.voltage}V`],
                        ['Depth of Discharge', `${battery.dod}%`],
                        ['Cycle Life', `${battery.cycleLife.toLocaleString()} cycles`],
                        ['Warranty', `${battery.warranty} years`],
                        ['Origin', ORIGIN_LABELS[battery.origin] || battery.origin],
                      ].map(([label, value]) => (
                        <tr key={label} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 font-medium text-text-muted bg-gray-50 w-44">{label}</td>
                          <td className="px-4 py-3 text-text-primary font-semibold">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Price */}
                <div className="mt-5 rounded-2xl bg-primary/5 border border-primary/10 p-4">
                  <p className="text-xs text-text-muted mb-1">Price range (per unit)</p>
                  <p className="text-2xl font-bold text-text-primary">{formatPrice(battery.priceMin)} – {formatPrice(battery.priceMax)}</p>
                  <p className="text-xs text-text-muted mt-1">Contact installer for system pricing</p>
                </div>

                <Link href="/get-quotes" className="btn-primary mt-5 w-full text-center block">
                  Get Quotes From Installers →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Overview + Specs + Reviews */}
        <section className="bg-background section-padding-sm">
          <div className="container-custom max-w-3xl">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Overview</h2>
              <p className="text-text-muted leading-relaxed">{battery.description}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                  <h3 className="text-sm font-bold text-green-800 mb-3 uppercase tracking-wide">✅ Pros</h3>
                  <ul className="space-y-2">
                    {battery.pros.map((pro) => (
                      <li key={pro} className="flex items-start gap-2 text-sm text-green-700">
                        <span className="mt-0.5 shrink-0">✓</span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                  <h3 className="text-sm font-bold text-red-800 mb-3 uppercase tracking-wide">❌ Cons</h3>
                  <ul className="space-y-2">
                    {battery.cons.map((con) => (
                      <li key={con} className="flex items-start gap-2 text-sm text-red-700">
                        <span className="mt-0.5 shrink-0">✗</span> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Full specs */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Full Specifications</h2>
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ['Brand', battery.brand],
                      ['Model', battery.model],
                      ['Battery Type', battery.type],
                      ['Chemistry', battery.chemistry],
                      ['Total Capacity', `${battery.capacityKwh}kWh`],
                      ['Usable Capacity', `${battery.usableKwh}kWh`],
                      ['Voltage', `${battery.voltage}V`],
                      ['Depth of Discharge', `${battery.dod}%`],
                      ['Cycle Life', `${battery.cycleLife.toLocaleString()} cycles`],
                      ['Warranty', `${battery.warranty} years`],
                      ['Country of Origin', ORIGIN_LABELS[battery.origin] || battery.origin],
                      ['Nigerian Price (min)', formatPrice(battery.priceMin)],
                      ['Nigerian Price (max)', formatPrice(battery.priceMax)],
                    ].map(([label, value], i) => (
                      <tr key={label} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                        <td className="px-4 py-3 font-medium text-text-muted w-48">{label}</td>
                        <td className="px-4 py-3 text-text-primary">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reviews */}
            <div id="write-review" className="mb-10">
              <h2 className="text-2xl font-bold text-text-primary mb-2">Reviews</h2>
              <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5 mb-6 flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-black text-text-primary">—</div>
                  <div className="text-xs text-text-muted mt-1">No reviews yet</div>
                </div>
                <div className="flex-1">
                  <StarRating rating={0} size="lg" />
                  <p className="text-sm text-text-muted mt-1">Be the first to review this battery</p>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-white p-6">
                <h3 className="text-lg font-bold text-text-primary mb-5">Write a Review</h3>
                <ReviewForm equipmentId={battery.slug} equipmentName={battery.model} />
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="bg-white section-padding-sm">
          <div className="container-custom">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Also Compare</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((b) => (
                <EquipmentCard key={b.slug} product={b} rating={0} reviewCount={0} />
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-primary text-white py-14 text-center">
          <div className="container-custom max-w-2xl">
            <h2 className="text-3xl font-bold mb-3">Ready to install the {battery.model}?</h2>
            <p className="text-white/70 mb-6">Compare quotes from verified Nigerian solar installers.</p>
            <Link href="/get-quotes" className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-white hover:bg-accent-dark transition-colors">
              Get Free Quotes →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
