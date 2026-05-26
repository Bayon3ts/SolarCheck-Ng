
export interface SolarBattery {
  slug: string
  brand: string
  model: string
  category: 'battery'
  type: string
  chemistry: string
  capacityKwh: number
  usableKwh: number
  voltage: number
  warranty: number
  cycleLife: number
  dod: number
  priceMin: number
  priceMax: number
  origin: string
  isFeatured: boolean
  description: string
  pros: string[]
  cons: string[]
  imageUrl?: string
}

export const SOLAR_BATTERIES: SolarBattery[] = [
  {
    slug: 'felicity-lithium-100ah-51v',
    brand: 'Felicity Solar',
    model: 'Lithium Battery 100Ah 51.2V',
    category: 'battery',
    type: 'Lithium Iron Phosphate',
    chemistry: 'LFP',
    capacityKwh: 5.12,
    usableKwh: 5.12,
    voltage: 51.2,
    warranty: 5,
    cycleLife: 4000,
    dod: 100,
    priceMin: 750000,
    priceMax: 950000,
    origin: 'CN',
    isFeatured: true,
    description: 'Felicity Solar is one of the most recognized solar battery brands in Nigeria. Their 51.2V lithium batteries are installed in thousands of Nigerian homes and are widely considered the standard for residential solar storage. Strong local distributor and technical support network.',
    pros: [
      'Most widely distributed battery in Nigeria',
      'LFP chemistry — safe, no fire risk',
      'Strong local warranty support',
      'Compatible with most Nigerian inverters',
      'Built-in BMS protection',
    ],
    cons: [
      'Shorter warranty vs premium brands',
      'Build quality varies between batches',
    ],
  },
  {
    slug: 'luminous-lithium-100ah-48v',
    brand: 'Luminous Power Technologies',
    model: 'Li-ON 1250 48V 100Ah',
    category: 'battery',
    type: 'Lithium Iron Phosphate',
    chemistry: 'LFP',
    capacityKwh: 4.8,
    usableKwh: 4.8,
    voltage: 48,
    warranty: 5,
    cycleLife: 3500,
    dod: 100,
    priceMin: 680000,
    priceMax: 850000,
    origin: 'IN',
    isFeatured: true,
    description: "Luminous is India's largest power solutions brand, with deep roots in the Nigerian market through their inverter business. Their lithium batteries are trusted by Nigerians who already use Luminous inverters, benefiting from native compatibility and a strong service network.",
    pros: [
      'Pairs perfectly with Luminous inverters',
      'Strong Nigerian dealer and service network',
      'Trusted Indian brand with 30+ years history',
      'Good performance in high-temperature environments',
    ],
    cons: [
      'Slightly lower cycle life than Felicity',
      'Import supply can be inconsistent',
    ],
  },
  {
    slug: 'huawei-luna2000-5kwh',
    brand: 'Huawei',
    model: 'LUNA2000-5-S0',
    category: 'battery',
    type: 'Lithium Iron Phosphate',
    chemistry: 'LFP',
    capacityKwh: 5.0,
    usableKwh: 5.0,
    voltage: 48,
    warranty: 10,
    cycleLife: 6000,
    dod: 100,
    priceMin: 1200000,
    priceMax: 1800000,
    origin: 'CN',
    isFeatured: true,
    description: "Huawei's LUNA2000 is the premium battery option in Nigeria — used primarily in commercial and high-end residential installations. Best-in-class 10-year warranty, modular design, and seamless integration with Huawei's SUN2000 hybrid inverters. The Tesla Powerwall equivalent for the Nigerian market.",
    pros: [
      '10-year warranty — longest in Nigerian market',
      'Modular: add more capacity as needed',
      'Best cycle life (6,000 cycles)',
      'AI-powered energy management',
      'Premium build quality',
    ],
    cons: [
      'Premium pricing — 2x the cost of Felicity',
      'Requires Huawei inverter for full functionality',
      'Fewer local technicians trained on this system',
    ],
  },
  {
    slug: 'bsl-battery-100ah-48v',
    brand: 'BSL Battery',
    model: 'LiFePO4 100Ah 48V',
    category: 'battery',
    type: 'Lithium Iron Phosphate',
    chemistry: 'LFP',
    capacityKwh: 4.8,
    usableKwh: 4.8,
    voltage: 48,
    warranty: 5,
    cycleLife: 4000,
    dod: 100,
    priceMin: 580000,
    priceMax: 720000,
    origin: 'CN',
    isFeatured: false,
    description: 'BSL is an increasingly popular budget LFP option among Nigerian installers offering competitive packages. Solid value for cost-conscious homeowners who want lithium technology without paying the Felicity premium.',
    pros: [
      'Most affordable LFP option in Nigeria',
      'Standard 48V compatible with all inverters',
      'Good capacity-to-price ratio',
    ],
    cons: [
      'Less brand recognition',
      'Limited local warranty support',
      'Quality control less consistent',
    ],
  },
  {
    slug: 'shoto-lifepo4-100ah-48v',
    brand: 'Shoto',
    model: 'SDA10-48100 100Ah',
    category: 'battery',
    type: 'Lithium Iron Phosphate',
    chemistry: 'LFP',
    capacityKwh: 4.8,
    usableKwh: 4.8,
    voltage: 48,
    warranty: 5,
    cycleLife: 4000,
    dod: 100,
    priceMin: 620000,
    priceMax: 800000,
    origin: 'CN',
    isFeatured: false,
    description: 'Shoto is a well-established Chinese battery brand with a growing Nigerian presence. Popular with installers for reliable performance and consistent manufacturing quality.',
    pros: [
      'Consistent manufacturing quality',
      'Good installer support from distributors',
      'Solid BMS with multiple protections',
    ],
    cons: [
      'Limited consumer brand awareness in Nigeria',
      'Fewer dealers than Felicity/Luminous',
    ],
  },
]
