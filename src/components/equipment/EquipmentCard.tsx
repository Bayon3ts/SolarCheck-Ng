'use client'

import Link from 'next/link'
import { SolarPanel } from '@/data/solar-panels'
import { SolarBattery } from '@/data/solar-batteries'
import { SolarInverter } from '@/data/solar-inverters'
import StarRating from '@/components/ui/star-rating'

type EquipmentProduct = SolarPanel | SolarBattery | SolarInverter

interface EquipmentCardProps {
  product: EquipmentProduct
  reviewCount?: number
  rating?: number
}

function formatPrice(n: number): string {
  return '₦' + n.toLocaleString('en-NG')
}

function getKeySpecs(product: EquipmentProduct): string[] {
  if (product.category === 'panel') {
    const p = product as SolarPanel
    return [`${p.watts}W`, `${p.efficiency}% Eff.`, `${p.warranty}yr Warranty`]
  }
  if (product.category === 'battery') {
    const b = product as SolarBattery
    return [`${b.capacityKwh}kWh`, `${b.cycleLife.toLocaleString()} Cycles`, `${b.warranty}yr Warranty`]
  }
  const inv = product as SolarInverter
  return [`${inv.kvaRating}kVA`, `${inv.efficiency}% Eff.`, inv.type]
}

function getCategoryHref(product: EquipmentProduct): string {
  if (product.category === 'panel') return `/solar-panels/${product.slug}`
  if (product.category === 'battery') return `/solar-batteries/${product.slug}`
  return `/solar-inverters/${product.slug}`
}

function getBrandInitials(brand: string): string {
  return brand
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function EquipmentCard({ product, reviewCount = 0, rating = 0 }: EquipmentCardProps) {
  const specs = getKeySpecs(product)
  const href = getCategoryHref(product)

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-card-hover overflow-hidden">
      {/* Featured badge */}
      {product.isFeatured && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow-sm">
            ⭐ Most Popular
          </span>
        </div>
      )}

      {/* Image / Brand placeholder */}
      <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={`${product.brand} ${product.model}`}
            className="h-full w-full object-contain p-6"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
              {getBrandInitials(product.brand)}
            </div>
            <span className="text-xs font-medium text-text-muted">{product.brand}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Brand + Model */}
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{product.brand}</p>
        <h3 className="mt-1 text-base font-bold text-text-primary leading-tight">{product.model}</h3>

        {/* Star rating */}
        <div className="mt-2 flex items-center gap-2">
          <StarRating rating={rating} size="sm" />
          <span className="text-sm font-semibold text-text-primary">{rating > 0 ? rating.toFixed(1) : '—'}</span>
          <span className="text-xs text-text-muted">
            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        {/* Specs pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {specs.map((spec) => (
            <span
              key={spec}
              className="rounded-full bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              {spec}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="my-3 h-px bg-border" />

        {/* Price */}
        <div className="mt-auto">
          <p className="text-xs text-text-muted mb-0.5">Price range</p>
          <p className="text-sm font-bold text-text-primary">
            {formatPrice(product.priceMin)} – {formatPrice(product.priceMax)}
          </p>
          <p className="text-xs text-text-muted mt-0.5">Contact installer for bulk pricing</p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Link
            href={`${href}#write-review`}
            className="flex-1 rounded-full border border-border bg-transparent py-2 text-center text-xs font-semibold text-text-muted transition-colors hover:border-primary hover:text-primary"
          >
            Write a Review
          </Link>
          <Link
            href={href}
            className="flex-1 rounded-full bg-primary py-2 text-center text-xs font-semibold text-white transition-all hover:bg-primary-dark"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  )
}
