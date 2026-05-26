
export interface SolarInverter {
  slug: string
  brand: string
  model: string
  category: 'inverter'
  type: string
  kvaRating: number
  inputVoltage: string
  outputVoltage: string
  efficiency: number
  batteryCompatible: string[]
  warranty: number
  priceMin: number
  priceMax: number
  origin: string
  isFeatured: boolean
  description: string
  pros: string[]
  cons: string[]
  imageUrl?: string
}

export const SOLAR_INVERTERS: SolarInverter[] = [
  {
    slug: 'growatt-sph5000tl3-5kva',
    brand: 'Growatt',
    model: 'SPH5000TL3-BH 5KVA',
    category: 'inverter',
    type: 'Hybrid',
    kvaRating: 5,
    inputVoltage: '48V DC',
    outputVoltage: '220V AC',
    efficiency: 97.6,
    batteryCompatible: ['Felicity', 'BSL', 'Shoto', 'BYD'],
    warranty: 5,
    priceMin: 850000,
    priceMax: 1200000,
    origin: 'CN',
    isFeatured: true,
    description: "Growatt is the most widely used hybrid inverter in Nigeria. The SPH series handles both solar generation and battery management in one unit. Loved by Nigerian installers for its reliability, easy configuration, and extensive local support network. The #1 choice for 5KVA residential systems.",
    pros: [
      'Most popular inverter brand in Nigeria',
      'Excellent ShinePhone app monitoring',
      'Compatible with most battery brands',
      'Strong nationwide dealer and service network',
      'Very competitive pricing',
    ],
    cons: [
      'App can be glitchy with poor internet connection',
      'Customer support can be slow during peak periods',
    ],
  },
  {
    slug: 'luminous-solar-pcu-5kva',
    brand: 'Luminous Power Technologies',
    model: 'Solar PCU 5KVA',
    category: 'inverter',
    type: 'Hybrid',
    kvaRating: 5,
    inputVoltage: '48V DC',
    outputVoltage: '220V AC',
    efficiency: 95.0,
    batteryCompatible: ['Luminous', 'Felicity', 'BSL'],
    warranty: 2,
    priceMin: 680000,
    priceMax: 900000,
    origin: 'IN',
    isFeatured: true,
    description: 'Luminous PCU inverters are a household name in Nigeria. Most Nigerian families upgrading from traditional inverters to solar choose Luminous for familiarity and the extensive nationwide repair/service network. Best paired with Luminous lithium or tubular batteries.',
    pros: [
      'Most familiar brand to Nigerian households',
      'Largest service/repair network in Nigeria',
      'Works with existing Luminous battery setups',
      'Simple, intuitive operation',
    ],
    cons: [
      'Lower efficiency than Growatt/Victron',
      'Shorter standard warranty period',
      'Less sophisticated solar optimization',
    ],
  },
  {
    slug: 'victron-multiplus-ii-5kva',
    brand: 'Victron Energy',
    model: 'MultiPlus-II 48/5000',
    category: 'inverter',
    type: 'Hybrid',
    kvaRating: 5,
    inputVoltage: '48V DC',
    outputVoltage: '220V AC',
    efficiency: 96.0,
    batteryCompatible: ['Pylontech', 'BYD', 'Freedom Won', 'Felicity'],
    warranty: 5,
    priceMin: 2200000,
    priceMax: 3000000,
    origin: 'NL',
    isFeatured: true,
    description: "Victron Energy from the Netherlands is the gold standard for premium solar installations in Nigeria. Used extensively in high-end residential and commercial projects. Best-in-class reliability, unparalleled configuration flexibility, and a passionate installer community. The premium choice for those who want the best.",
    pros: [
      'Legendary reliability — 25-year brand history',
      'Most configurable inverter on the market',
      'VRM cloud monitoring is outstanding',
      'Can be paralleled for larger systems',
      'Passionate Nigerian installer community',
    ],
    cons: [
      'Premium pricing (2-3x Growatt)',
      'Requires trained Victron installer',
      'Overkill for basic residential setups',
    ],
  },
  {
    slug: 'deye-sun-5k-sg04lp3',
    brand: 'Deye',
    model: 'SUN-5K-SG04LP3-EU',
    category: 'inverter',
    type: 'Hybrid',
    kvaRating: 5,
    inputVoltage: '48V DC',
    outputVoltage: '220V AC',
    efficiency: 97.7,
    batteryCompatible: ['Felicity', 'BSL', 'BYD', 'Pylon'],
    warranty: 5,
    priceMin: 750000,
    priceMax: 1050000,
    origin: 'CN',
    isFeatured: false,
    description: 'Deye has rapidly become one of the most popular inverter brands with Nigerian installers. Excellent efficiency ratings, competitive pricing, and increasingly strong local support. A genuine alternative to Growatt for value-focused installations.',
    pros: [
      'Among highest efficiency ratings available',
      'Competitive pricing vs Growatt',
      'Good battery compatibility',
      'Growing local installer support',
    ],
    cons: [
      'Newer brand — less long-term track record',
      'Fewer trained technicians than Growatt/Luminous',
    ],
  },
  {
    slug: 'huawei-sun2000-5ktl',
    brand: 'Huawei',
    model: 'SUN2000-5KTL-M1',
    category: 'inverter',
    type: 'Hybrid',
    kvaRating: 5,
    inputVoltage: '48V DC',
    outputVoltage: '220V AC',
    efficiency: 98.6,
    batteryCompatible: ['Huawei LUNA2000'],
    warranty: 10,
    priceMin: 1800000,
    priceMax: 2500000,
    origin: 'CN',
    isFeatured: false,
    description: "Huawei's SUN2000 represents the highest specification residential inverter available in Nigeria. Best used as part of the complete Huawei ecosystem (SUN2000 inverter + LUNA2000 battery). AI-powered optimization delivers best-in-class solar harvest. Premium pricing reflects premium performance.",
    pros: [
      'Highest efficiency inverter in Nigerian market',
      '10-year warranty',
      'AI-powered energy optimization',
      'Excellent monitoring via FusionHome app',
    ],
    cons: [
      'Requires Huawei battery for full features',
      'Highest price point in the market',
      'Limited to Huawei ecosystem',
    ],
  },
]
