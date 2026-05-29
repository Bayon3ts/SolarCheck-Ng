export type InverterType = 
  | 'hybrid'      // Solar + Grid + Battery all-in-one
  | 'off-grid'    // Solar + Battery, no grid export
  | 'on-grid'     // Grid-tie only, no battery
  | 'pcu'         // Power Conditioning Unit (India-style)

export type InverterPhase = 
  | 'single-phase' 
  | 'three-phase'

export type InverterTier = 
  | 'premium' 
  | 'tier1' 
  | 'tier2' 
  | 'budget'

export interface InverterModel {
  modelSlug: string
  modelName: string          // e.g. "SPF 5000ES"
  type: InverterType
  phase: InverterPhase
  ratedPowerKva: number      // e.g. 5.0
  ratedPowerKw: number       // e.g. 5.0
  peakPowerKw: number        // surge capacity
  efficiency: number         // % e.g. 97.6
  mpptControllers: number    // number of MPPT inputs
  maxPvInputV: number        // Volts e.g. 450
  maxPvInputW: number        // Watts e.g. 5500
  batteryVoltage: number[]   // [24, 48] or [48]
  chargeCurrentA: number     // max battery charge amps
  outputVoltage: number      // AC output V e.g. 220
  outputFrequency: number    // Hz e.g. 50
  switchoverTimeMs: number   // grid to battery ms e.g. 20
  hasWifi: boolean           // built-in WiFi monitoring
  hasDisplay: boolean        // LCD/LED display
  parallelCapable: boolean   // can parallel multiple units
  splitPhaseCapable: boolean 
  gridFeedIn: boolean        // can export to grid
  generatorCompatible: boolean
  warranty: number           // years
  ipRating: string           // e.g. 'IP20' | 'IP65'
  operatingTempMax: number   // °C
  weight: number             // kg
  batteryCompatibility: string[] // brand names
  monitoringApp: string      // e.g. 'ShinePhone'
  priceMin: number           // ₦
  priceMax: number           // ₦
  tier: InverterTier
  nigeriaAvailability: 
    'widely-available' | 'available' | 'limited'
  bestFor: string
  nigeriaStrength: string    // why Nigerians love it
  nigeriaWeakness: string    // honest weakness
}

export interface InverterBrand {
  brandSlug: string
  brandName: string
  country: string
  founded: number
  tier: InverterTier
  nigeriaPresence: string
  models: InverterModel[]
}

export const INVERTER_BRANDS: InverterBrand[] = [

  // ─── PREMIUM TIER ─────────────────────────

  {
    brandSlug: 'victron-energy',
    brandName: 'Victron Energy',
    country: 'Netherlands',
    founded: 1975,
    tier: 'premium',
    nigeriaPresence: 'Available through select dealers in Lagos/Abuja — gold standard for commercial installs. Passionate Nigerian installer community',
    models: [
      {
        modelSlug: 'victron-multiplus-ii-5kva',
        modelName: 'MultiPlus-II 48/5000',
        type: 'hybrid',
        phase: 'single-phase',
        ratedPowerKva: 5.0,
        ratedPowerKw: 4.0,
        peakPowerKw: 9.0,
        efficiency: 96.0,
        mpptControllers: 0,  // needs ext. MPPT
        maxPvInputV: 0,      // via external MPPT
        maxPvInputW: 0,
        batteryVoltage: [48],
        chargeCurrentA: 70,
        outputVoltage: 230,
        outputFrequency: 50,
        switchoverTimeMs: 20,
        hasWifi: false,       // via optional dongle
        hasDisplay: false,    // via optional GX device
        parallelCapable: true,
        splitPhaseCapable: true,
        gridFeedIn: true,
        generatorCompatible: true,
        warranty: 5,
        ipRating: 'IP21',
        operatingTempMax: 50,
        weight: 30,
        batteryCompatibility: [
          'Pylontech', 'BYD', 'Felicity', 
          'Blue Carbon', 'Freedom Won', 
          'Any LFP 48V'
        ],
        monitoringApp: 'VRM Portal (Victron)',
        priceMin: 2200000,
        priceMax: 3500000,
        tier: 'premium',
        nigeriaAvailability: 'available',
        bestFor: 'Commercial installs, estates, and installers who want total control',
        nigeriaStrength: 'Legendary Dutch reliability — 50-year brand, unmatched configuration flexibility, best monitoring in class (VRM Portal), can parallel up to 6 units for large loads, massive Nigerian installer community',
        nigeriaWeakness: 'Needs external MPPT charge controller (extra cost). Complex setup requires trained Victron installer. Premium price is 3–4x a Growatt',
      },
      {
        modelSlug: 'victron-quattro-48-5000',
        modelName: 'Quattro 48/5000',
        type: 'hybrid',
        phase: 'single-phase',
        ratedPowerKva: 5.0,
        ratedPowerKw: 4.0,
        peakPowerKw: 10.0,
        efficiency: 96.0,
        mpptControllers: 0,
        maxPvInputV: 0,
        maxPvInputW: 0,
        batteryVoltage: [48],
        chargeCurrentA: 70,
        outputVoltage: 230,
        outputFrequency: 50,
        switchoverTimeMs: 20,
        hasWifi: false,
        hasDisplay: false,
        parallelCapable: true,
        splitPhaseCapable: true,
        gridFeedIn: true,
        generatorCompatible: true,
        warranty: 5,
        ipRating: 'IP21',
        operatingTempMax: 50,
        weight: 35,
        batteryCompatibility: [
          'Pylontech', 'BYD', 'Any LFP 48V'
        ],
        monitoringApp: 'VRM Portal (Victron)',
        priceMin: 2800000,
        priceMax: 4500000,
        tier: 'premium',
        nigeriaAvailability: 'limited',
        bestFor: 'Large homes and businesses with two AC inputs (grid + generator)',
        nigeriaStrength: 'Two AC inputs — switches seamlessly between NEPA, generator, and battery/solar. Only inverter built for Nigerian 3-source reality',
        nigeriaWeakness: 'Very expensive. Needs a full Victron ecosystem to unlock all features',
      },
    ],
  },

  {
    brandSlug: 'huawei',
    brandName: 'Huawei Solar',
    country: 'China',
    founded: 1987,
    tier: 'premium',
    nigeriaPresence: 'Available through authorized Huawei dealers — mostly used in commercial and premium estate installs',
    models: [
      {
        modelSlug: 'huawei-sun2000-5ktl',
        modelName: 'SUN2000-5KTL-L1',
        type: 'hybrid',
        phase: 'single-phase',
        ratedPowerKva: 5.0,
        ratedPowerKw: 5.0,
        peakPowerKw: 7.5,
        efficiency: 98.6,
        mpptControllers: 2,
        maxPvInputV: 600,
        maxPvInputW: 6500,
        batteryVoltage: [48],
        chargeCurrentA: 100,
        outputVoltage: 230,
        outputFrequency: 50,
        switchoverTimeMs: 10,
        hasWifi: true,
        hasDisplay: true,
        parallelCapable: false,
        splitPhaseCapable: false,
        gridFeedIn: true,
        generatorCompatible: false,
        warranty: 10,
        ipRating: 'IP65',
        operatingTempMax: 60,
        weight: 17,
        batteryCompatibility: [
          'Huawei LUNA2000'
        ],
        monitoringApp: 'FusionHome (Huawei)',
        priceMin: 1800000,
        priceMax: 3000000,
        tier: 'premium',
        nigeriaAvailability: 'limited',
        bestFor: 'Full Huawei ecosystem — maximum efficiency and AI optimization',
        nigeriaStrength: 'Highest efficiency inverter available in Nigeria (98.6%). IP65 rated for outdoor install. 10-year warranty. Incredible FusionHome AI app. 60°C operating temp perfect for Nigerian outdoor installations',
        nigeriaWeakness: 'Requires Huawei LUNA2000 battery — locked ecosystem. No generator input. Limited local technician training',
      },
      {
        modelSlug: 'huawei-sun2000-10ktl',
        modelName: 'SUN2000-10KTL-M1',
        type: 'hybrid',
        phase: 'single-phase',
        ratedPowerKva: 10.0,
        ratedPowerKw: 10.0,
        peakPowerKw: 15.0,
        efficiency: 98.8,
        mpptControllers: 2,
        maxPvInputV: 600,
        maxPvInputW: 13000,
        batteryVoltage: [48],
        chargeCurrentA: 200,
        outputVoltage: 230,
        outputFrequency: 50,
        switchoverTimeMs: 10,
        hasWifi: true,
        hasDisplay: true,
        parallelCapable: false,
        splitPhaseCapable: false,
        gridFeedIn: true,
        generatorCompatible: false,
        warranty: 10,
        ipRating: 'IP65',
        operatingTempMax: 60,
        weight: 28,
        batteryCompatibility: [
          'Huawei LUNA2000'
        ],
        monitoringApp: 'FusionHome (Huawei)',
        priceMin: 3000000,
        priceMax: 5000000,
        tier: 'premium',
        nigeriaAvailability: 'limited',
        bestFor: 'Large commercial and premium estate installations',
        nigeriaStrength: 'Highest efficiency 10kW inverter available. Commercial-grade performance at residential form factor',
        nigeriaWeakness: 'Full Huawei ecosystem lock-in at premium price',
      },
    ],
  },

  // ─── TIER 1 ───────────────────────────────

  {
    brandSlug: 'growatt',
    brandName: 'Growatt',
    country: 'China',
    founded: 2010,
    tier: 'tier1',
    nigeriaPresence: 'Very strong — most popular hybrid inverter brand in Nigeria. Largest installer network nationwide',
    models: [
      {
        modelSlug: 'growatt-spf-5000es',
        modelName: 'SPF 5000ES 5kVA',
        type: 'off-grid',
        phase: 'single-phase',
        ratedPowerKva: 5.0,
        ratedPowerKw: 5.0,
        peakPowerKw: 10.0,
        efficiency: 93.0,
        mpptControllers: 1,
        maxPvInputV: 450,
        maxPvInputW: 5500,
        batteryVoltage: [48],
        chargeCurrentA: 60,
        outputVoltage: 230,
        outputFrequency: 50,
        switchoverTimeMs: 20,
        hasWifi: true,
        hasDisplay: true,
        parallelCapable: true,
        splitPhaseCapable: false,
        gridFeedIn: false,
        generatorCompatible: true,
        warranty: 5,
        ipRating: 'IP20',
        operatingTempMax: 55,
        weight: 18,
        batteryCompatibility: [
          'Felicity', 'Blue Carbon', 'BSL', 
          'Shoto', 'Pylontech', 'Most 48V LFP'
        ],
        monitoringApp: 'ShinePhone (Growatt)',
        priceMin: 500000,
        priceMax: 800000,
        tier: 'tier1',
        nigeriaAvailability: 'widely-available',
        bestFor: '#1 choice for Nigerian homes — best balance of price, features and support',
        nigeriaStrength: 'Nigeria\'s most popular inverter brand. Widest battery compatibility. ShinePhone app works well on slow internet. Parallel up to 9 units. Available from Aba to Zaria. Most Nigerian technicians trained on Growatt',
        nigeriaWeakness: 'SPF series is off-grid only — cannot sell power back to grid. App can lag on poor mobile data. Quality control varies — always buy from authorized dealer',
      },
      {
        modelSlug: 'growatt-sph5000tl3-bh',
        modelName: 'SPH5000TL3-BH 5kVA Hybrid',
        type: 'hybrid',
        phase: 'single-phase',
        ratedPowerKva: 5.0,
        ratedPowerKw: 5.0,
        peakPowerKw: 10.0,
        efficiency: 97.6,
        mpptControllers: 2,
        maxPvInputV: 600,
        maxPvInputW: 6500,
        batteryVoltage: [48],
        chargeCurrentA: 100,
        outputVoltage: 230,
        outputFrequency: 50,
        switchoverTimeMs: 20,
        hasWifi: true,
        hasDisplay: true,
        parallelCapable: false,
        splitPhaseCapable: false,
        gridFeedIn: true,
        generatorCompatible: true,
        warranty: 5,
        ipRating: 'IP20',
        operatingTempMax: 55,
        weight: 22,
        batteryCompatibility: [
          'Felicity', 'Blue Carbon', 'BSL',
          'Shoto', 'Pylontech', 'BYD',
          'Most 48V LFP'
        ],
        monitoringApp: 'ShinePhone (Growatt)',
        priceMin: 850000,
        priceMax: 1400000,
        tier: 'tier1',
        nigeriaAvailability: 'widely-available',
        bestFor: 'Nigerian homes wanting grid export and premium hybrid features at a Growatt price',
        nigeriaStrength: 'True hybrid — can feed excess solar to grid. 2 MPPT for flexible panel layouts. Higher efficiency than SPF series. Wide battery compatibility. Best Growatt for full solar optimization',
        nigeriaWeakness: 'Higher cost than SPF series. Grid feed-in may not be relevant for most Nigerian homes on unreliable NEPA supply',
      },
      {
        modelSlug: 'growatt-min-6000tl-x',
        modelName: 'MIN 6000TL-XH 6kW',
        type: 'hybrid',
        phase: 'single-phase',
        ratedPowerKva: 6.0,
        ratedPowerKw: 6.0,
        peakPowerKw: 12.0,
        efficiency: 98.4,
        mpptControllers: 2,
        maxPvInputV: 600,
        maxPvInputW: 8000,
        batteryVoltage: [48],
        chargeCurrentA: 100,
        outputVoltage: 230,
        outputFrequency: 50,
        switchoverTimeMs: 20,
        hasWifi: true,
        hasDisplay: true,
        parallelCapable: false,
        splitPhaseCapable: false,
        gridFeedIn: true,
        generatorCompatible: true,
        warranty: 5,
        ipRating: 'IP65',
        operatingTempMax: 60,
        weight: 20,
        batteryCompatibility: [
          'Pylontech', 'BYD', 'Felicity',
          'Blue Carbon', 'Most 48V LFP'
        ],
        monitoringApp: 'ShinePhone (Growatt)',
        priceMin: 1100000,
        priceMax: 1700000,
        tier: 'tier1',
        nigeriaAvailability: 'available',
        bestFor: 'Large Nigerian homes and small businesses needing 6kW',
        nigeriaStrength: 'IP65 for outdoor install. 98.4% efficiency. Handles heavy loads for businesses. Strong Growatt support network',
        nigeriaWeakness: 'Higher cost. Less common model — fewer technicians trained on it',
      },
    ],
  },

  {
    brandSlug: 'deye',
    brandName: 'Deye',
    country: 'China',
    founded: 2013,
    tier: 'tier1',
    nigeriaPresence: 'Strong and growing — rapidly replacing Growatt in mid-range hybrid installs. Excellent efficiency ratings',
    models: [
      {
        modelSlug: 'deye-sun-5k-sg04lp3',
        modelName: 'SUN-5K-SG04LP3-EU 5kW',
        type: 'hybrid',
        phase: 'single-phase',
        ratedPowerKva: 5.0,
        ratedPowerKw: 5.0,
        peakPowerKw: 10.0,
        efficiency: 97.7,
        mpptControllers: 2,
        maxPvInputV: 500,
        maxPvInputW: 6500,
        batteryVoltage: [48],
        chargeCurrentA: 100,
        outputVoltage: 230,
        outputFrequency: 50,
        switchoverTimeMs: 10,
        hasWifi: true,
        hasDisplay: true,
        parallelCapable: true,
        splitPhaseCapable: false,
        gridFeedIn: true,
        generatorCompatible: true,
        warranty: 5,
        ipRating: 'IP65',
        operatingTempMax: 60,
        weight: 19,
        batteryCompatibility: [
          'Pylontech', 'BYD', 'Felicity',
          'Blue Carbon', 'BSL', 'Dyness',
          'Most 48V LFP'
        ],
        monitoringApp: 'SolarmanBusiness (Deye)',
        priceMin: 750000,
        priceMax: 1200000,
        tier: 'tier1',
        nigeriaAvailability: 'available',
        bestFor: 'Best hybrid specs per naira — Growatt challenger',
        nigeriaStrength: '10ms switchover (fastest in class — protects sensitive electronics). IP65 outdoor rating. Can parallel multiple units. Wide battery compatibility. Solarman app excellent for monitoring',
        nigeriaWeakness: 'Newer brand — fewer Nigerian technicians trained on it vs Growatt. After-sales support still building',
      },
      {
        modelSlug: 'deye-sun-8k-sg04lp3',
        modelName: 'SUN-8K-SG04LP3-EU 8kW',
        type: 'hybrid',
        phase: 'single-phase',
        ratedPowerKva: 8.0,
        ratedPowerKw: 8.0,
        peakPowerKw: 16.0,
        efficiency: 97.8,
        mpptControllers: 2,
        maxPvInputV: 500,
        maxPvInputW: 10400,
        batteryVoltage: [48],
        chargeCurrentA: 160,
        outputVoltage: 230,
        outputFrequency: 50,
        switchoverTimeMs: 10,
        hasWifi: true,
        hasDisplay: true,
        parallelCapable: true,
        splitPhaseCapable: false,
        gridFeedIn: true,
        generatorCompatible: true,
        warranty: 5,
        ipRating: 'IP65',
        operatingTempMax: 60,
        weight: 25,
        batteryCompatibility: [
          'Pylontech', 'BYD', 'Felicity',
          'Blue Carbon', 'Dyness'
        ],
        monitoringApp: 'SolarmanBusiness (Deye)',
        priceMin: 1200000,
        priceMax: 1800000,
        tier: 'tier1',
        nigeriaAvailability: 'available',
        bestFor: 'Medium businesses and large homes with AC and pump loads',
        nigeriaStrength: 'Handles up to 10.4kW PV input — maximizes large panel arrays. Good for shops, offices, clinics',
        nigeriaWeakness: 'Overkill for most homes. Needs well-trained installer for commissioning',
      },
    ],
  },

  {
    brandSlug: 'goodwe',
    brandName: 'GoodWe',
    country: 'China',
    founded: 2010,
    tier: 'tier1',
    nigeriaPresence: 'Available — growing commercial install base. Strong in Lagos estate and commercial segment',
    models: [
      {
        modelSlug: 'goodwe-gw5048d-es',
        modelName: 'GW5048D-ES 5kW',
        type: 'hybrid',
        phase: 'single-phase',
        ratedPowerKva: 5.0,
        ratedPowerKw: 5.0,
        peakPowerKw: 10.0,
        efficiency: 97.6,
        mpptControllers: 2,
        maxPvInputV: 550,
        maxPvInputW: 7500,
        batteryVoltage: [48],
        chargeCurrentA: 100,
        outputVoltage: 230,
        outputFrequency: 50,
        switchoverTimeMs: 20,
        hasWifi: true,
        hasDisplay: true,
        parallelCapable: false,
        splitPhaseCapable: false,
        gridFeedIn: true,
        generatorCompatible: true,
        warranty: 5,
        ipRating: 'IP65',
        operatingTempMax: 60,
        weight: 22,
        batteryCompatibility: [
          'Pylontech', 'BYD', 'Blue Carbon',
          'Felicity', 'Most 48V LFP'
        ],
        monitoringApp: 'SEMS Portal (GoodWe)',
        priceMin: 800000,
        priceMax: 1300000,
        tier: 'tier1',
        nigeriaAvailability: 'available',
        bestFor: 'Commercial installs and homes wanting premium features at near-Growatt pricing',
        nigeriaStrength: 'Excellent SEMS monitoring portal. IP65 outdoor rated. Strong battery compatibility. High 7.5kW PV input. Recognized globally',
        nigeriaWeakness: 'Less brand recognition in Nigeria than Growatt. Fewer local installers familiar with it',
      },
    ],
  },

  {
    brandSlug: 'srne',
    brandName: 'SRNE Solar',
    country: 'China',
    founded: 2009,
    tier: 'tier1',
    nigeriaPresence: 'Growing — gaining traction with Nigerian installers for mid-range hybrid builds',
    models: [
      {
        modelSlug: 'srne-ml4860p20-h',
        modelName: 'ML4860P20-H 5kVA',
        type: 'hybrid',
        phase: 'single-phase',
        ratedPowerKva: 5.0,
        ratedPowerKw: 4.0,
        peakPowerKw: 10.0,
        efficiency: 94.0,
        mpptControllers: 1,
        maxPvInputV: 450,
        maxPvInputW: 5000,
        batteryVoltage: [48],
        chargeCurrentA: 80,
        outputVoltage: 220,
        outputFrequency: 50,
        switchoverTimeMs: 20,
        hasWifi: false,
        hasDisplay: true,
        parallelCapable: false,
        splitPhaseCapable: false,
        gridFeedIn: false,
        generatorCompatible: true,
        warranty: 3,
        ipRating: 'IP20',
        operatingTempMax: 55,
        weight: 16,
        batteryCompatibility: [
          'Felicity', 'Blue Carbon', 'BSL',
          'Most 48V LFP', 'Lead-acid'
        ],
        monitoringApp: 'SRNE App',
        priceMin: 600000,
        priceMax: 1000000,
        tier: 'tier1',
        nigeriaAvailability: 'available',
        bestFor: 'Mid-range build needing hybrid without Growatt price',
        nigeriaStrength: 'Good MPPT efficiency. Works with both LFP and lead-acid. Pure sine wave for sensitive electronics. Growing Nigerian installer community',
        nigeriaWeakness: 'No WiFi built-in on base models. Shorter warranty than Growatt/Deye. Less brand recognition',
      },
    ],
  },

  // ─── TIER 2 ───────────────────────────────

  {
    brandSlug: 'luminous',
    brandName: 'Luminous Power Technologies',
    country: 'India',
    founded: 1988,
    tier: 'tier2',
    nigeriaPresence: 'Very strong — household name in Nigeria. Largest service and repair network. Most Nigerian homes have experienced Luminous inverters',
    models: [
      {
        modelSlug: 'luminous-solar-pcu-5kva',
        modelName: 'Solar PCU 5kVA/48V',
        type: 'pcu',
        phase: 'single-phase',
        ratedPowerKva: 5.0,
        ratedPowerKw: 4.0,
        peakPowerKw: 7.5,
        efficiency: 95.0,
        mpptControllers: 1,
        maxPvInputV: 360,
        maxPvInputW: 5000,
        batteryVoltage: [48],
        chargeCurrentA: 70,
        outputVoltage: 220,
        outputFrequency: 50,
        switchoverTimeMs: 30,
        hasWifi: false,
        hasDisplay: true,
        parallelCapable: false,
        splitPhaseCapable: false,
        gridFeedIn: false,
        generatorCompatible: true,
        warranty: 2,
        ipRating: 'IP20',
        operatingTempMax: 45,
        weight: 28,
        batteryCompatibility: [
          'Luminous', 'Felicity', 'BSL',
          'Ritar', 'Amaron', 'Lead-acid'
        ],
        monitoringApp: 'None (LCD display only)',
        priceMin: 350000,
        priceMax: 650000,
        tier: 'tier2',
        nigeriaAvailability: 'widely-available',
        bestFor: 'Nigerians upgrading from old Luminous setup — familiar brand, easy servicing',
        nigeriaStrength: 'Most repaired inverter in Nigeria — any local technician can fix it. Works with existing Luminous battery setups. Widest service network. Very affordable. Simple operation — no app needed',
        nigeriaWeakness: 'Lower efficiency than hybrid competitors. No WiFi monitoring. Only 2-year warranty. Not compatible with premium LFP batteries. Max 45°C — can struggle in hot battery rooms',
      },
      {
        modelSlug: 'luminous-zelio-plus-1700',
        modelName: 'Zelio+ 1700 1.5kVA',
        type: 'off-grid',
        phase: 'single-phase',
        ratedPowerKva: 1.5,
        ratedPowerKw: 1.2,
        peakPowerKw: 2.0,
        efficiency: 92.0,
        mpptControllers: 0,
        maxPvInputV: 0,
        maxPvInputW: 0,
        batteryVoltage: [12, 24],
        chargeCurrentA: 12,
        outputVoltage: 220,
        outputFrequency: 50,
        switchoverTimeMs: 30,
        hasWifi: false,
        hasDisplay: true,
        parallelCapable: false,
        splitPhaseCapable: false,
        gridFeedIn: false,
        generatorCompatible: false,
        warranty: 2,
        ipRating: 'IP20',
        operatingTempMax: 45,
        weight: 7,
        batteryCompatibility: [
          'Luminous', 'Amaron', 'Ritar',
          'Any 12V lead-acid'
        ],
        monitoringApp: 'None',
        priceMin: 175000,
        priceMax: 280000,
        tier: 'tier2',
        nigeriaAvailability: 'widely-available',
        bestFor: 'Small apartments: lights, fans, phone charging, decoder',
        nigeriaStrength: 'Most affordable branded inverter in Nigeria. Widely available everywhere. Easy to get repaired',
        nigeriaWeakness: 'No solar input — grid/battery only. Very limited load capacity. Lead-acid only. No monitoring',
      },
    ],
  },

  {
    brandSlug: 'felicity-solar',
    brandName: 'Felicity Solar',
    country: 'China / Nigeria',
    founded: 2010,
    tier: 'tier2',
    nigeriaPresence: 'Very strong — known for complete solar systems (panel + inverter + battery) from one brand',
    models: [
      {
        modelSlug: 'felicity-hybrid-5kva-48v',
        modelName: 'Hybrid 5kVA/48V MPPT',
        type: 'hybrid',
        phase: 'single-phase',
        ratedPowerKva: 5.0,
        ratedPowerKw: 4.0,
        peakPowerKw: 8.0,
        efficiency: 93.0,
        mpptControllers: 1,
        maxPvInputV: 430,
        maxPvInputW: 4500,
        batteryVoltage: [48],
        chargeCurrentA: 60,
        outputVoltage: 220,
        outputFrequency: 50,
        switchoverTimeMs: 25,
        hasWifi: false,
        hasDisplay: true,
        parallelCapable: false,
        splitPhaseCapable: false,
        gridFeedIn: false,
        generatorCompatible: true,
        warranty: 2,
        ipRating: 'IP20',
        operatingTempMax: 55,
        weight: 22,
        batteryCompatibility: [
          'Felicity', 'Blue Carbon', 'BSL',
          'Most 48V LFP', 'Lead-acid'
        ],
        monitoringApp: 'None (LCD only)',
        priceMin: 550000,
        priceMax: 900000,
        tier: 'tier2',
        nigeriaAvailability: 'widely-available',
        bestFor: 'Felicity full-system buyers — panel + inverter + battery from one brand',
        nigeriaStrength: 'Designed for Nigerian voltage fluctuations. Good for complete Felicity system builds. Wide availability. Local warranty support',
        nigeriaWeakness: 'No WiFi monitoring. Lower efficiency than Growatt/Deye. Only 2-year warranty. Limited PV input capacity',
      },
      {
        modelSlug: 'felicity-hybrid-3-5kva-24v',
        modelName: 'Hybrid 3.5kVA/24V',
        type: 'hybrid',
        phase: 'single-phase',
        ratedPowerKva: 3.5,
        ratedPowerKw: 2.8,
        peakPowerKw: 5.0,
        efficiency: 92.0,
        mpptControllers: 1,
        maxPvInputV: 300,
        maxPvInputW: 3000,
        batteryVoltage: [24],
        chargeCurrentA: 40,
        outputVoltage: 220,
        outputFrequency: 50,
        switchoverTimeMs: 25,
        hasWifi: false,
        hasDisplay: true,
        parallelCapable: false,
        splitPhaseCapable: false,
        gridFeedIn: false,
        generatorCompatible: true,
        warranty: 2,
        ipRating: 'IP20',
        operatingTempMax: 55,
        weight: 15,
        batteryCompatibility: [
          'Felicity', 'Luminous', 
          'Any 24V lead-acid or LFP'
        ],
        monitoringApp: 'None',
        priceMin: 450000,
        priceMax: 695000,
        tier: 'tier2',
        nigeriaAvailability: 'widely-available',
        bestFor: 'Medium apartments and small shops on tight budget',
        nigeriaStrength: 'Good price for hybrid functionality. 24V system works with affordable battery bank',
        nigeriaWeakness: '24V limits battery capacity. Lower efficiency. 3kW PV max limits solar array size',
      },
    ],
  },

  {
    brandSlug: 'must-power',
    brandName: 'MUST Power',
    country: 'China',
    founded: 2003,
    tier: 'tier2',
    nigeriaPresence: 'Available — extremely popular for budget hybrid builds. Well loved by Nigerian DIY installers',
    models: [
      {
        modelSlug: 'must-ph18-5000u',
        modelName: 'PH18-5000U 5kVA',
        type: 'hybrid',
        phase: 'single-phase',
        ratedPowerKva: 5.0,
        ratedPowerKw: 4.0,
        peakPowerKw: 9.0,
        efficiency: 93.0,
        mpptControllers: 1,
        maxPvInputV: 450,
        maxPvInputW: 5000,
        batteryVoltage: [24, 48],
        chargeCurrentA: 60,
        outputVoltage: 220,
        outputFrequency: 50,
        switchoverTimeMs: 20,
        hasWifi: false,
        hasDisplay: true,
        parallelCapable: false,
        splitPhaseCapable: false,
        gridFeedIn: false,
        generatorCompatible: true,
        warranty: 2,
        ipRating: 'IP20',
        operatingTempMax: 55,
        weight: 17,
        batteryCompatibility: [
          'Felicity', 'BSL', 'Blue Carbon',
          'Most LFP', 'Lead-acid'
        ],
        monitoringApp: 'MUST App (optional)',
        priceMin: 380000,
        priceMax: 700000,
        tier: 'tier2',
        nigeriaAvailability: 'available',
        bestFor: 'Budget hybrid build — best Growatt alternative for cost-conscious buyers',
        nigeriaStrength: 'Works on both 24V and 48V battery systems. Affordable price. Popular with DIY installers. Good overload protection',
        nigeriaWeakness: 'No WiFi built-in. Only 2-year warranty. Lower efficiency. Less brand recognition in premium market',
      },
    ],
  },

  // ─── BUDGET TIER ──────────────────────────

  {
    brandSlug: 'prag',
    brandName: 'Prag',
    country: 'India',
    founded: 2000,
    tier: 'budget',
    nigeriaPresence: 'Widely available — popular entry-level inverter brand. Very easy to get repaired anywhere',
    models: [
      {
        modelSlug: 'prag-solar-5kva-48v',
        modelName: 'Solar 5kVA/48V',
        type: 'off-grid',
        phase: 'single-phase',
        ratedPowerKva: 5.0,
        ratedPowerKw: 3.5,
        peakPowerKw: 6.0,
        efficiency: 88.0,
        mpptControllers: 1,
        maxPvInputV: 300,
        maxPvInputW: 3500,
        batteryVoltage: [48],
        chargeCurrentA: 40,
        outputVoltage: 220,
        outputFrequency: 50,
        switchoverTimeMs: 40,
        hasWifi: false,
        hasDisplay: true,
        parallelCapable: false,
        splitPhaseCapable: false,
        gridFeedIn: false,
        generatorCompatible: false,
        warranty: 1,
        ipRating: 'IP20',
        operatingTempMax: 45,
        weight: 25,
        batteryCompatibility: [
          'Luminous', 'Felicity', 'Amaron',
          'Any lead-acid 48V'
        ],
        monitoringApp: 'None',
        priceMin: 180000,
        priceMax: 350000,
        tier: 'budget',
        nigeriaAvailability: 'widely-available',
        bestFor: 'Minimum viable solar system on very tight budget',
        nigeriaStrength: 'Very affordable. Repaired by virtually any Nigerian technician. Simple to operate',
        nigeriaWeakness: 'Low efficiency (88%). Low max PV input. No WiFi. 1-year warranty. Modified sine wave on older models damages sensitive electronics',
      },
    ],
  },

  {
    brandSlug: 'sukam',
    brandName: 'Su-Kam',
    country: 'India',
    founded: 1998,
    tier: 'budget',
    nigeriaPresence: 'Available — older brand with loyal Nigerian user base. Common in generator-free homes',
    models: [
      {
        modelSlug: 'sukam-falcon-plus-2kva',
        modelName: 'Falcon+ 2kVA/24V',
        type: 'off-grid',
        phase: 'single-phase',
        ratedPowerKva: 2.0,
        ratedPowerKw: 1.6,
        peakPowerKw: 3.0,
        efficiency: 88.0,
        mpptControllers: 0,
        maxPvInputV: 0,
        maxPvInputW: 0,
        batteryVoltage: [12, 24],
        chargeCurrentA: 16,
        outputVoltage: 220,
        outputFrequency: 50,
        switchoverTimeMs: 40,
        hasWifi: false,
        hasDisplay: false,
        parallelCapable: false,
        splitPhaseCapable: false,
        gridFeedIn: false,
        generatorCompatible: false,
        warranty: 1,
        ipRating: 'IP20',
        operatingTempMax: 40,
        weight: 9,
        batteryCompatibility: [
          'Any 12V or 24V lead-acid'
        ],
        monitoringApp: 'None',
        priceMin: 95000,
        priceMax: 220000,
        tier: 'budget',
        nigeriaAvailability: 'available',
        bestFor: 'Basic home backup — lights, fans, phone charging only',
        nigeriaStrength: 'Very cheap entry point. Simple installation. Reliable for basic loads',
        nigeriaWeakness: 'No solar input. No display. Very limited load. Not suitable for modern appliances',
      },
    ],
  },
]

// ─── HELPER FUNCTIONS ──────────────────────

export const INVERTER_BRAND_OPTIONS = 
  INVERTER_BRANDS.map(b => ({
    value: b.brandSlug,
    label: b.brandName,
    tier: b.tier,
  }))

export function getInverterModelsForBrand(
  brandSlug: string
): { value: string; label: string }[] {
  const brand = INVERTER_BRANDS.find(
    b => b.brandSlug === brandSlug
  )
  if (!brand) return []
  return brand.models.map(m => ({
    value: m.modelSlug,
    label: `${m.modelName} · ${m.ratedPowerKva}kVA · ${inverterTypeLabel(m.type)}`,
  }))
}

export function findInverterModel(
  brandSlug: string,
  modelSlug: string
): InverterModel | null {
  const brand = INVERTER_BRANDS.find(
    b => b.brandSlug === brandSlug
  )
  if (!brand) return null
  return brand.models.find(
    m => m.modelSlug === modelSlug
  ) || null
}

export function findInverterBrand(
  brandSlug: string
): InverterBrand | null {
  return INVERTER_BRANDS.find(
    b => b.brandSlug === brandSlug
  ) || null
}

export function inverterTypeLabel(
  t: InverterType
): string {
  const map: Record<InverterType, string> = {
    'hybrid': 'Hybrid (Solar + Grid + Battery)',
    'off-grid': 'Off-Grid (Solar + Battery)',
    'on-grid': 'On-Grid (Grid-Tie)',
    'pcu': 'PCU (Power Conditioning Unit)',
  }
  return map[t]
}

// Nigerian-specific: NEPA grid is unreliable 
// so switchover time matters enormously
export function switchoverRating(
  ms: number
): string {
  if (ms <= 10) return 'Excellent (protects all electronics)'
  if (ms <= 20) return 'Good (safe for most electronics)'
  if (ms <= 30) return 'Average (may reset some devices)'
  return 'Slow (may damage sensitive electronics)'
}

// Effective PV input % of rated power
// (how well it actually harvests solar)
export function solarHarvestScore(
  m: InverterModel
): number {
  if (m.mpptControllers === 0) return 0
  const ratio = m.maxPvInputW / 
    (m.ratedPowerKw * 1000)
  return Math.round(ratio * 100)
}
