
export interface SolarPanel {
  slug: string
  brand: string
  model: string
  category: 'panel'
  watts: number
  efficiency: number
  type: string
  cellType: string
  warranty: number
  degradation: number
  priceMin: number
  priceMax: number
  origin: string
  isFeatured: boolean
  description: string
  pros: string[]
  cons: string[]
  imageUrl?: string
}

export const SOLAR_PANELS: SolarPanel[] = [
  {
    slug: 'jinko-tiger-neo-550w',
    brand: 'Jinko Solar',
    model: 'Tiger Neo N-Type 550W',
    category: 'panel',
    watts: 550,
    efficiency: 22.04,
    type: 'Monocrystalline',
    cellType: 'TOPCon',
    warranty: 25,
    degradation: 0.40,
    priceMin: 85000,
    priceMax: 120000,
    origin: 'CN',
    isFeatured: true,
    description: "Jinko Solar is the world's largest solar panel manufacturer. The Tiger Neo N-Type is their premium TOPCon panel — extremely popular with Nigerian installers for its high efficiency and excellent heat tolerance, which matters in Lagos and Abuja climates.",
    pros: [
      'Best-in-class efficiency for Nigerian budget',
      'N-type cells perform better in high heat',
      'Widely available from Lagos distributors',
      '25-year product + performance warranty',
    ],
    cons: [
      'Premium pricing vs polycrystalline options',
      'Counterfeit panels common — verify serial numbers',
    ],
  },
  {
    slug: 'longi-hi-mo6-550w',
    brand: 'Longi Solar',
    model: 'Hi-MO 6 550W',
    category: 'panel',
    watts: 550,
    efficiency: 22.8,
    type: 'Monocrystalline',
    cellType: 'HPBC',
    warranty: 25,
    degradation: 0.40,
    priceMin: 90000,
    priceMax: 130000,
    origin: 'CN',
    isFeatured: true,
    description: 'Longi is consistently rated among the top 3 solar manufacturers globally. The Hi-MO 6 uses their proprietary HPBC cell technology and has excellent reviews from Nigerian homeowners for consistent output and minimal degradation over time.',
    pros: [
      'Highest efficiency in its class',
      'Excellent Nigerian climate performance',
      'Strong distributor network in Lagos',
      'Lower long-term degradation than competitors',
    ],
    cons: [
      'Slightly higher upfront cost',
      'Longer lead times for bulk orders',
    ],
  },
  {
    slug: 'canadian-solar-hiku6-550w',
    brand: 'Canadian Solar',
    model: 'HiKu6 550W',
    category: 'panel',
    watts: 550,
    efficiency: 21.4,
    type: 'Monocrystalline',
    cellType: 'PERC',
    warranty: 25,
    degradation: 0.55,
    priceMin: 75000,
    priceMax: 100000,
    origin: 'CN',
    isFeatured: false,
    description: 'Canadian Solar is a trusted Tier 1 brand with strong availability across Nigeria. The HiKu6 is the go-to mid-range panel for budget-conscious homeowners who still want a bankable, warranted product from a global manufacturer.',
    pros: [
      'Best price-to-performance ratio',
      'Very widely available Nigeria-wide',
      'Proven track record in Nigerian installations',
      'Strong local distributor support',
    ],
    cons: [
      'PERC technology aging vs newer TOPCon',
      'Higher degradation rate than N-type panels',
    ],
  },
  {
    slug: 'risen-titan-s-550w',
    brand: 'Risen Energy',
    model: 'Titan S 550W',
    category: 'panel',
    watts: 550,
    efficiency: 21.0,
    type: 'Monocrystalline',
    cellType: 'PERC',
    warranty: 25,
    degradation: 0.55,
    priceMin: 65000,
    priceMax: 90000,
    origin: 'CN',
    isFeatured: false,
    description: 'Risen Energy is one of the fastest-growing Tier 1 panel manufacturers. Budget-friendly pricing makes it popular with installers doing high-volume residential work across Lagos and Abuja.',
    pros: [
      'Most affordable Tier 1 option',
      'Good availability from Lagos importers',
      'Solid build quality for the price',
    ],
    cons: [
      'Less brand recognition than Jinko/Longi',
      'After-sales warranty claims can be slow',
    ],
  },
  {
    slug: 'astronergy-astro-n5s-550w',
    brand: 'Astronergy (Chint)',
    model: 'ASTRO N5s 550W',
    category: 'panel',
    watts: 550,
    efficiency: 22.5,
    type: 'Monocrystalline',
    cellType: 'TOPCon',
    warranty: 25,
    degradation: 0.40,
    priceMin: 80000,
    priceMax: 110000,
    origin: 'CN',
    isFeatured: false,
    description: "Astronergy is Chint's solar brand — backed by one of China's largest industrial groups. Growing rapidly in Nigeria as installers discover their TOPCon performance at competitive prices.",
    pros: [
      'N-type TOPCon performance at PERC pricing',
      'Strong corporate backing from Chint Group',
      'Good heat tolerance for Nigerian climate',
    ],
    cons: [
      'Still building brand recognition in Nigeria',
      'Fewer local distributors than Jinko/Canadian',
    ],
  },
]
