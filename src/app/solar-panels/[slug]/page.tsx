import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import StarRating from '@/components/ui/star-rating'
import ReviewForm from '@/components/equipment/ReviewForm'
import EquipmentCard from '@/components/equipment/EquipmentCard'
import { SOLAR_PANELS } from '@/data/solar-panels'

interface Props {
  params: Promise<{slug: string}>
}

export function generateStaticParams() {
  return SOLAR_PANELS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const panel = SOLAR_PANELS.find((p) => p.slug === slug)
  if (!panel) return { title: 'Panel Not Found' }
  return {
    title: `${panel.brand} ${panel.model} Review — Price & Specs in Nigeria | SolarCheck`,
    description: `${panel.brand} ${panel.model} review for the Nigerian market. Price: ₦${panel.priceMin.toLocaleString('en-NG')} – ₦${panel.priceMax.toLocaleString('en-NG')} per panel. ${panel.efficiency}% efficiency, ${panel.warranty}-year warranty.`,
    alternates: { canonical: `/solar-panels/${panel.slug}` },
  }
}

function formatPrice(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

const ORIGIN_LABELS: Record<string, string> = { CN: '🇨🇳 China', US: '🇺🇸 USA', KR: '🇰🇷 South Korea', IN: '🇮🇳 India', NL: '🇳🇱 Netherlands' }

export default async function SolarPanelDetailPage({ params }: Props) {
  const slug = (await params).slug;
  const panel = SOLAR_PANELS.find((p) => p.slug === slug)
  if (!panel) notFound()

  const related = SOLAR_PANELS.filter((p) => p.slug !== panel.slug).slice(0, 3)
  const initials = panel.brand.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

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
              <Link href="/solar-panels" className="hover:text-primary transition-colors">Solar Panels</Link>
              <span>/</span>
              <span className="text-text-primary font-medium">{panel.model}</span>
            </nav>
          </div>
        </div>

        {/* Product Header */}
        <section className="bg-white py-12">
          <div className="container-custom">
            <div className="grid gap-10 lg:grid-cols-2 items-start">
              {/* Left: Image placeholder */}
              <div className="flex items-center justify-center rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 h-80">
                {panel.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={panel.imageUrl} alt={panel.model} className="h-full w-full object-contain p-10" />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-primary/10 text-4xl font-bold text-primary">{initials}</div>
                    <span className="text-sm font-medium text-text-muted">{panel.brand}</span>
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div>
                {panel.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white mb-3">⭐ Most Popular</span>
                )}
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">{panel.brand}</p>
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mt-1 mb-3">{panel.model}</h1>
                <StarRating rating={0} size="md" showValue reviewCount={0} />

                {/* Specs table */}
                <div className="mt-6 rounded-2xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Wattage', `${panel.watts}W`],
                        ['Efficiency', `${panel.efficiency}%`],
                        ['Cell Type', `${panel.type} — ${panel.cellType}`],
                        ['Warranty', `${panel.warranty} years`],
                        ['Degradation', `${panel.degradation}% / year`],
                        ['Origin', ORIGIN_LABELS[panel.origin] || panel.origin],
                      ].map(([label, value]) => (
                        <tr key={label} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 font-medium text-text-muted bg-gray-50 w-40">{label}</td>
                          <td className="px-4 py-3 text-text-primary font-semibold">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Price */}
                <div className="mt-5 rounded-2xl bg-primary/5 border border-primary/10 p-4">
                  <p className="text-xs text-text-muted mb-1">Price range (per panel)</p>
                  <p className="text-2xl font-bold text-text-primary">{formatPrice(panel.priceMin)} – {formatPrice(panel.priceMax)}</p>
                  <p className="text-xs text-text-muted mt-1">Contact installer for bulk / full system pricing</p>
                </div>

                <Link href="/get-quotes" className="btn-primary mt-5 w-full text-center block">
                  Get Quotes From Installers →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs content */}
        <section className="bg-background section-padding-sm">
          <div className="container-custom max-w-3xl">
            {/* Overview */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Overview</h2>
              <p className="text-text-muted leading-relaxed">{panel.description}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                  <h3 className="text-sm font-bold text-green-800 mb-3 uppercase tracking-wide">✅ Pros</h3>
                  <ul className="space-y-2">
                    {panel.pros.map((pro) => (
                      <li key={pro} className="flex items-start gap-2 text-sm text-green-700">
                        <span className="mt-0.5 shrink-0 text-green-500">✓</span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                  <h3 className="text-sm font-bold text-red-800 mb-3 uppercase tracking-wide">❌ Cons</h3>
                  <ul className="space-y-2">
                    {panel.cons.map((con) => (
                      <li key={con} className="flex items-start gap-2 text-sm text-red-700">
                        <span className="mt-0.5 shrink-0 text-red-500">✗</span> {con}
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
                      ['Brand', panel.brand],
                      ['Model', panel.model],
                      ['Wattage', `${panel.watts}W STC`],
                      ['Efficiency', `${panel.efficiency}%`],
                      ['Panel Type', panel.type],
                      ['Cell Technology', panel.cellType],
                      ['Product Warranty', `${panel.warranty} years`],
                      ['Annual Degradation', `${panel.degradation}%`],
                      ['Country of Origin', ORIGIN_LABELS[panel.origin] || panel.origin],
                      ['Nigerian Price (min)', formatPrice(panel.priceMin) + ' / panel'],
                      ['Nigerian Price (max)', formatPrice(panel.priceMax) + ' / panel'],
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

            {/* Reviews Section */}
            <div id="write-review" className="mb-10">
              <h2 className="text-2xl font-bold text-text-primary mb-2">Reviews</h2>
              <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5 mb-6 flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-black text-text-primary">—</div>
                  <div className="text-xs text-text-muted mt-1">No reviews yet</div>
                </div>
                <div className="flex-1">
                  <StarRating rating={0} size="lg" />
                  <p className="text-sm text-text-muted mt-1">Be the first to review this panel</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white p-6">
                <h3 className="text-lg font-bold text-text-primary mb-5">Write a Review</h3>
                <ReviewForm equipmentId={panel.slug} equipmentName={panel.model} />
              </div>
            </div>
          </div>
        </section>

        {/* Related products */}
        <section className="bg-white section-padding-sm">
          <div className="container-custom">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Also Compare</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <EquipmentCard key={p.slug} product={p} rating={0} reviewCount={0} />
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-primary text-white py-14 text-center">
          <div className="container-custom max-w-2xl">
            <h2 className="text-3xl font-bold mb-3">Ready to install the {panel.model}?</h2>
            <p className="text-white/70 mb-6">Compare quotes from verified Nigerian installers who supply this panel.</p>
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
