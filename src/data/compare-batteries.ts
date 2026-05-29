export type BatteryChemistry = 
  | 'LFP'         // Lithium Iron Phosphate
  | 'NMC'         // Lithium Nickel Manganese Cobalt
  | 'GEL'         // Gel Lead-Acid
  | 'AGM'         // Absorbed Glass Mat
  | 'TUBULAR'     // Tubular Lead-Acid (flooded)

export type BatteryTier = 
  | 'premium' 
  | 'tier1' 
  | 'tier2' 
  | 'budget'

export interface BatteryModel {
  modelSlug: string
  modelName: string
  voltage: number          // V: 12 | 24 | 48 | 51.2
  capacityAh: number       // Amp-hours e.g. 100, 200
  capacityKwh: number      // e.g. 4.8, 5.12, 10.0
  usableKwh: number        // usable at rated DoD
  chemistry: BatteryChemistry
  cycleLife: number        // e.g. 6000 at 80% DoD
  dod: number              // Depth of Discharge % e.g. 80
  peakPowerKw: number      // peak discharge rate kW
  continuousPowerKw: number // continuous discharge kW
  warranty: number         // years
  operatingTempMin: number // °C e.g. -10
  operatingTempMax: number // °C e.g. 55
  selfDischargePerMonth: number // % e.g. 2
  weight: number           // kg
  builtInBms: boolean      // has Battery Management System
  stackable: boolean       // can add units in parallel
  inverterCompatibility: string[] // e.g. ['Growatt','Deye']
  priceMin: number         // ₦
  priceMax: number         // ₦
  tier: BatteryTier
  nigeriaAvailability: 
    'widely-available' | 'available' | 'limited'
  maintenanceRequired: boolean
  bestFor: string
  nigeriaWarning?: string  // optional heat/ventilation note
}

export interface BatteryBrand {
  brandSlug: string
  brandName: string
  country: string
  founded: number
  tier: BatteryTier
  nigeriaPresence: string
  models: BatteryModel[]
}

export const BATTERY_BRANDS: BatteryBrand[] = [

  // ─── PREMIUM TIER ─────────────────────────

  {
    brandSlug: 'pylontech',
    brandName: 'Pylontech',
    country: 'China',
    founded: 2009,
    tier: 'premium',
    nigeriaPresence: 'Available through select Lagos dealers — used in high-end estate and commercial installs',
    models: [
      {
        modelSlug: 'pylontech-us5000-4-8kwh',
        modelName: 'US5000 4.8kWh',
        voltage: 48,
        capacityAh: 100,
        capacityKwh: 4.8,
        usableKwh: 4.32,
        chemistry: 'LFP',
        cycleLife: 6000,
        dod: 90,
        peakPowerKw: 5.0,
        continuousPowerKw: 3.5,
        warranty: 10,
        operatingTempMin: -10,
        operatingTempMax: 50,
        selfDischargePerMonth: 2,
        weight: 54,
        builtInBms: true,
        stackable: true,
        inverterCompatibility: [
          'Growatt', 'Deye', 'Victron', 
          'SMA', 'Goodwe', 'Sunsynk'
        ],
        priceMin: 1100000,
        priceMax: 1800000,
        tier: 'premium',
        nigeriaAvailability: 'available',
        maintenanceRequired: false,
        bestFor: 'Long-term reliability — gold standard for Nigerian estates',
        nigeriaWarning: 'Ensure ventilated battery room — reduces life in ambient temps above 40°C',
      },
      {
        modelSlug: 'pylontech-us3000c-3-5kwh',
        modelName: 'US3000C 3.5kWh',
        voltage: 48,
        capacityAh: 74,
        capacityKwh: 3.55,
        usableKwh: 3.19,
        chemistry: 'LFP',
        cycleLife: 6000,
        dod: 90,
        peakPowerKw: 3.5,
        continuousPowerKw: 2.5,
        warranty: 10,
        operatingTempMin: -10,
        operatingTempMax: 50,
        selfDischargePerMonth: 2,
        weight: 37,
        builtInBms: true,
        stackable: true,
        inverterCompatibility: [
          'Growatt', 'Deye', 'Victron', 
          'SMA', 'Goodwe'
        ],
        priceMin: 850000,
        priceMax: 1400000,
        tier: 'premium',
        nigeriaAvailability: 'available',
        maintenanceRequired: false,
        bestFor: 'Entry point to premium lithium for medium-sized homes',
      },
      {
        modelSlug: 'pylontech-force-h2-10kwh',
        modelName: 'Force H2 10kWh',
        voltage: 48,
        capacityAh: 209,
        capacityKwh: 10.0,
        usableKwh: 9.0,
        chemistry: 'LFP',
        cycleLife: 6000,
        dod: 90,
        peakPowerKw: 10.0,
        continuousPowerKw: 7.5,
        warranty: 10,
        operatingTempMin: -20,
        operatingTempMax: 55,
        selfDischargePerMonth: 2,
        weight: 106,
        builtInBms: true,
        stackable: true,
        inverterCompatibility: [
          'Growatt', 'Deye', 'Victron', 
          'SMA', 'Huawei'
        ],
        priceMin: 2200000,
        priceMax: 3500000,
        tier: 'premium',
        nigeriaAvailability: 'limited',
        maintenanceRequired: false,
        bestFor: 'Large homes, businesses, and commercial buildings',
      },
    ],
  },

  {
    brandSlug: 'huawei',
    brandName: 'Huawei',
    country: 'China',
    founded: 1987,
    tier: 'premium',
    nigeriaPresence: 'Available through authorized Huawei dealers — usually sold as part of Huawei solar ecosystem',
    models: [
      {
        modelSlug: 'huawei-luna2000-5kwh',
        modelName: 'LUNA2000-5-S0 5kWh',
        voltage: 48,
        capacityAh: 104,
        capacityKwh: 5.0,
        usableKwh: 5.0,
        chemistry: 'LFP',
        cycleLife: 6000,
        dod: 100,
        peakPowerKw: 5.0,
        continuousPowerKw: 2.5,
        warranty: 10,
        operatingTempMin: -10,
        operatingTempMax: 55,
        selfDischargePerMonth: 1,
        weight: 56,
        builtInBms: true,
        stackable: true,
        inverterCompatibility: [
          'Huawei SUN2000'
        ],
        priceMin: 1800000,
        priceMax: 2800000,
        tier: 'premium',
        nigeriaAvailability: 'limited',
        maintenanceRequired: false,
        bestFor: 'Full Huawei ecosystem users — best AI optimization',
        nigeriaWarning: 'Requires Huawei SUN2000 inverter for full features. 100% DoD is excellent for Nigerian daily cycling',
      },
      {
        modelSlug: 'huawei-luna2000-10kwh',
        modelName: 'LUNA2000-10-S0 10kWh',
        voltage: 48,
        capacityAh: 208,
        capacityKwh: 10.0,
        usableKwh: 10.0,
        chemistry: 'LFP',
        cycleLife: 6000,
        dod: 100,
        peakPowerKw: 10.0,
        continuousPowerKw: 5.0,
        warranty: 10,
        operatingTempMin: -10,
        operatingTempMax: 55,
        selfDischargePerMonth: 1,
        weight: 106,
        builtInBms: true,
        stackable: true,
        inverterCompatibility: [
          'Huawei SUN2000'
        ],
        priceMin: 3000000,
        priceMax: 5000000,
        tier: 'premium',
        nigeriaAvailability: 'limited',
        maintenanceRequired: false,
        bestFor: 'Large premium homes and small commercial installations',
      },
    ],
  },

  {
    brandSlug: 'byd',
    brandName: 'BYD Battery',
    country: 'China',
    founded: 1995,
    tier: 'premium',
    nigeriaPresence: 'Limited — high-end commercial installs in Lagos and Abuja',
    models: [
      {
        modelSlug: 'byd-bbox-premium-hv-5-1kwh',
        modelName: 'B-Box Premium HV 5.1kWh',
        voltage: 48,
        capacityAh: 106,
        capacityKwh: 5.12,
        usableKwh: 5.12,
        chemistry: 'LFP',
        cycleLife: 6000,
        dod: 100,
        peakPowerKw: 7.0,
        continuousPowerKw: 5.0,
        warranty: 10,
        operatingTempMin: -10,
        operatingTempMax: 50,
        selfDischargePerMonth: 3,
        weight: 53,
        builtInBms: true,
        stackable: true,
        inverterCompatibility: [
          'Growatt', 'SMA', 'Victron', 
          'Fronius', 'Goodwe'
        ],
        priceMin: 2000000,
        priceMax: 3200000,
        tier: 'premium',
        nigeriaAvailability: 'limited',
        maintenanceRequired: false,
        bestFor: 'Maximum discharge rate — ideal for heavy-load homes',
      },
    ],
  },

  // ─── TIER 1 (LFP LITHIUM) ─────────────────

  {
    brandSlug: 'felicity-solar',
    brandName: 'Felicity Solar',
    country: 'China / Nigeria',
    founded: 2010,
    tier: 'tier1',
    nigeriaPresence: 'Very strong — local warranty centers across Nigeria. Most widely installed brand in Nigerian residential solar',
    models: [
      {
        modelSlug: 'felicity-lfp-48v-100ah',
        modelName: 'LiFePO4 48V 100Ah 4.8kWh',
        voltage: 48,
        capacityAh: 100,
        capacityKwh: 4.8,
        usableKwh: 4.8,
        chemistry: 'LFP',
        cycleLife: 4000,
        dod: 100,
        peakPowerKw: 5.0,
        continuousPowerKw: 3.0,
        warranty: 5,
        operatingTempMin: -20,
        operatingTempMax: 55,
        selfDischargePerMonth: 3,
        weight: 45,
        builtInBms: true,
        stackable: true,
        inverterCompatibility: [
          'Growatt', 'Deye', 'Victron', 
          'Luminous', 'Mecer', 'Felicity'
        ],
        priceMin: 750000,
        priceMax: 1050000,
        tier: 'tier1',
        nigeriaAvailability: 'widely-available',
        maintenanceRequired: false,
        bestFor: 'Best overall for Nigerian homes — local support, wide compatibility',
      },
      {
        modelSlug: 'felicity-lfp-24v-150ah',
        modelName: 'LiFePO4 24V 150Ah 3.5kWh',
        voltage: 24,
        capacityAh: 150,
        capacityKwh: 3.6,
        usableKwh: 3.6,
        chemistry: 'LFP',
        cycleLife: 4000,
        dod: 100,
        peakPowerKw: 3.0,
        continuousPowerKw: 2.0,
        warranty: 5,
        operatingTempMin: -20,
        operatingTempMax: 55,
        selfDischargePerMonth: 3,
        weight: 38,
        builtInBms: true,
        stackable: true,
        inverterCompatibility: [
          'Luminous', 'Felicity', 'Growatt'
        ],
        priceMin: 610000,
        priceMax: 985500,
        tier: 'tier1',
        nigeriaAvailability: 'widely-available',
        maintenanceRequired: false,
        bestFor: 'Smaller 24V inverter systems (1.5kVA–3kVA)',
      },
      {
        modelSlug: 'felicity-gel-12v-200ah',
        modelName: 'Gel Battery 12V 200Ah',
        voltage: 12,
        capacityAh: 200,
        capacityKwh: 2.4,
        usableKwh: 1.2,
        chemistry: 'GEL',
        cycleLife: 800,
        dod: 50,
        peakPowerKw: 1.2,
        continuousPowerKw: 0.6,
        warranty: 2,
        operatingTempMin: -15,
        operatingTempMax: 50,
        selfDischargePerMonth: 5,
        weight: 58,
        builtInBms: false,
        stackable: true,
        inverterCompatibility: [
          'Luminous', 'Sukam', 'Felicity',
          'Prag', 'Homage'
        ],
        priceMin: 314000,
        priceMax: 342000,
        tier: 'tier1',
        nigeriaAvailability: 'widely-available',
        maintenanceRequired: false,
        bestFor: 'Budget upgrade from tubular — maintenance-free lead-acid',
        nigeriaWarning: 'Only 50% usable capacity — you need 4 batteries for the same storage as 1 LFP unit',
      },
    ],
  },

  {
    brandSlug: 'blue-carbon',
    brandName: 'Blue Carbon',
    country: 'China',
    founded: 2010,
    tier: 'tier1',
    nigeriaPresence: 'Strong — popular with Lagos solar installers. Up to 6,000 cycle life praised by Nigerian users',
    models: [
      {
        modelSlug: 'blue-carbon-lfp-51v-100ah',
        modelName: 'LiFePO4 51.2V 100Ah 5.12kWh',
        voltage: 51,
        capacityAh: 100,
        capacityKwh: 5.12,
        usableKwh: 5.12,
        chemistry: 'LFP',
        cycleLife: 6000,
        dod: 100,
        peakPowerKw: 5.0,
        continuousPowerKw: 3.5,
        warranty: 5,
        operatingTempMin: -20,
        operatingTempMax: 60,
        selfDischargePerMonth: 3,
        weight: 46,
        builtInBms: true,
        stackable: true,
        inverterCompatibility: [
          'Growatt', 'Deye', 'Victron', 
          'Goodwe', 'Mecer'
        ],
        priceMin: 750000,
        priceMax: 1100000,
        tier: 'tier1',
        nigeriaAvailability: 'widely-available',
        maintenanceRequired: false,
        bestFor: 'Best cycle life at mid-range price — 6,000 cycles',
        nigeriaWarning: 'Can operate up to 60°C — excellent for hot Nigerian battery rooms',
      },
      {
        modelSlug: 'blue-carbon-lfp-48v-200ah',
        modelName: 'LiFePO4 48V 200Ah 9.6kWh',
        voltage: 48,
        capacityAh: 200,
        capacityKwh: 9.6,
        usableKwh: 9.6,
        chemistry: 'LFP',
        cycleLife: 6000,
        dod: 100,
        peakPowerKw: 10.0,
        continuousPowerKw: 7.0,
        warranty: 5,
        operatingTempMin: -20,
        operatingTempMax: 60,
        selfDischargePerMonth: 3,
        weight: 90,
        builtInBms: true,
        stackable: true,
        inverterCompatibility: [
          'Growatt', 'Deye', 'Victron'
        ],
        priceMin: 1400000,
        priceMax: 2000000,
        tier: 'tier1',
        nigeriaAvailability: 'available',
        maintenanceRequired: false,
        bestFor: 'Large homes needing whole-day backup without generator',
      },
    ],
  },

  {
    brandSlug: 'shoto',
    brandName: 'Shoto',
    country: 'China',
    founded: 1994,
    tier: 'tier1',
    nigeriaPresence: 'Growing — popular in Abuja commercial sector. Consistent manufacturing quality',
    models: [
      {
        modelSlug: 'shoto-sda10-48v-100ah',
        modelName: 'SDA10-48100 48V 100Ah',
        voltage: 48,
        capacityAh: 100,
        capacityKwh: 4.8,
        usableKwh: 4.8,
        chemistry: 'LFP',
        cycleLife: 4000,
        dod: 100,
        peakPowerKw: 5.0,
        continuousPowerKw: 3.0,
        warranty: 5,
        operatingTempMin: -20,
        operatingTempMax: 55,
        selfDischargePerMonth: 3,
        weight: 48,
        builtInBms: true,
        stackable: true,
        inverterCompatibility: [
          'Growatt', 'Deye', 'Victron', 
          'Sunsynk'
        ],
        priceMin: 620000,
        priceMax: 900000,
        tier: 'tier1',
        nigeriaAvailability: 'available',
        maintenanceRequired: false,
        bestFor: 'Consistent performer — good installer support network',
      },
    ],
  },

  {
    brandSlug: 'bsl-battery',
    brandName: 'BSL Battery',
    country: 'China',
    founded: 2005,
    tier: 'tier1',
    nigeriaPresence: 'Available — increasingly popular with Lagos installers as budget Tier 1 alternative',
    models: [
      {
        modelSlug: 'bsl-lfp-48v-100ah',
        modelName: 'LiFePO4 48V 100Ah',
        voltage: 48,
        capacityAh: 100,
        capacityKwh: 4.8,
        usableKwh: 4.8,
        chemistry: 'LFP',
        cycleLife: 4000,
        dod: 100,
        peakPowerKw: 5.0,
        continuousPowerKw: 3.0,
        warranty: 5,
        operatingTempMin: -20,
        operatingTempMax: 55,
        selfDischargePerMonth: 3,
        weight: 44,
        builtInBms: true,
        stackable: true,
        inverterCompatibility: [
          'Growatt', 'Deye', 'Victron'
        ],
        priceMin: 580000,
        priceMax: 820000,
        tier: 'tier1',
        nigeriaAvailability: 'available',
        maintenanceRequired: false,
        bestFor: 'Best price-per-kWh in the LFP lithium category',
      },
      {
        modelSlug: 'bsl-lfp-48v-200ah',
        modelName: 'LiFePO4 48V 200Ah',
        voltage: 48,
        capacityAh: 200,
        capacityKwh: 9.6,
        usableKwh: 9.6,
        chemistry: 'LFP',
        cycleLife: 4000,
        dod: 100,
        peakPowerKw: 10.0,
        continuousPowerKw: 7.0,
        warranty: 5,
        operatingTempMin: -20,
        operatingTempMax: 55,
        selfDischargePerMonth: 3,
        weight: 88,
        builtInBms: true,
        stackable: true,
        inverterCompatibility: [
          'Growatt', 'Deye', 'Victron'
        ],
        priceMin: 1100000,
        priceMax: 1600000,
        tier: 'tier1',
        nigeriaAvailability: 'available',
        maintenanceRequired: false,
        bestFor: 'Large capacity at lowest cost — value installer choice',
      },
    ],
  },

  {
    brandSlug: 'dyness',
    brandName: 'Dyness',
    country: 'China',
    founded: 2015,
    tier: 'tier1',
    nigeriaPresence: 'Growing — favored for tower-stackable design and competitive pricing',
    models: [
      {
        modelSlug: 'dyness-b4850-5-12kwh',
        modelName: 'B4850 Tower 5.12kWh',
        voltage: 48,
        capacityAh: 100,
        capacityKwh: 5.12,
        usableKwh: 5.12,
        chemistry: 'LFP',
        cycleLife: 6000,
        dod: 100,
        peakPowerKw: 5.0,
        continuousPowerKw: 3.5,
        warranty: 10,
        operatingTempMin: -10,
        operatingTempMax: 55,
        selfDischargePerMonth: 2,
        weight: 54,
        builtInBms: true,
        stackable: true,
        inverterCompatibility: [
          'Growatt', 'Deye', 'Goodwe', 
          'Sunsynk', 'SMA', 'Victron'
        ],
        priceMin: 850000,
        priceMax: 1400000,
        tier: 'tier1',
        nigeriaAvailability: 'available',
        maintenanceRequired: false,
        bestFor: '10-year warranty at Tier 1 price — Pylontech alternative',
      },
    ],
  },

  {
    brandSlug: 'powmr',
    brandName: 'PowMr',
    country: 'China',
    founded: 2012,
    tier: 'tier1',
    nigeriaPresence: 'Available — strong Lagos stock through PowMr Africa warehouse',
    models: [
      {
        modelSlug: 'powmr-lfp-48v-100ah',
        modelName: 'LiFePO4 48V 100Ah 4.8kWh',
        voltage: 48,
        capacityAh: 100,
        capacityKwh: 4.8,
        usableKwh: 4.8,
        chemistry: 'LFP',
        cycleLife: 6000,
        dod: 100,
        peakPowerKw: 5.0,
        continuousPowerKw: 3.0,
        warranty: 5,
        operatingTempMin: -20,
        operatingTempMax: 55,
        selfDischargePerMonth: 3,
        weight: 46,
        builtInBms: true,
        stackable: true,
        inverterCompatibility: [
          'Growatt', 'Deye', 'PowMr', 
          'Victron'
        ],
        priceMin: 480000,
        priceMax: 780000,
        tier: 'tier1',
        nigeriaAvailability: 'available',
        maintenanceRequired: false,
        bestFor: 'Most affordable 6,000-cycle LFP battery in Nigeria',
      },
    ],
  },

  {
    brandSlug: 'luminous',
    brandName: 'Luminous Power Technologies',
    country: 'India',
    founded: 1988,
    tier: 'tier1',
    nigeriaPresence: 'Very strong — largest inverter brand in Nigeria also sells batteries with nationwide service network',
    models: [
      {
        modelSlug: 'luminous-lithium-48v-100ah',
        modelName: 'Li-ON 1250 48V 100Ah',
        voltage: 48,
        capacityAh: 100,
        capacityKwh: 4.8,
        usableKwh: 4.8,
        chemistry: 'LFP',
        cycleLife: 3500,
        dod: 100,
        peakPowerKw: 4.5,
        continuousPowerKw: 3.0,
        warranty: 5,
        operatingTempMin: -10,
        operatingTempMax: 50,
        selfDischargePerMonth: 3,
        weight: 50,
        builtInBms: true,
        stackable: false,
        inverterCompatibility: [
          'Luminous', 'Growatt', 'Deye'
        ],
        priceMin: 680000,
        priceMax: 950000,
        tier: 'tier1',
        nigeriaAvailability: 'widely-available',
        maintenanceRequired: false,
        bestFor: 'Perfect match for Luminous inverter users — native compatibility',
      },
      {
        modelSlug: 'luminous-tubular-200ah-12v',
        modelName: 'Hercules Tubular 200Ah 12V',
        voltage: 12,
        capacityAh: 200,
        capacityKwh: 2.4,
        usableKwh: 1.2,
        chemistry: 'TUBULAR',
        cycleLife: 1500,
        dod: 50,
        peakPowerKw: 1.0,
        continuousPowerKw: 0.5,
        warranty: 5,
        operatingTempMin: 0,
        operatingTempMax: 45,
        selfDischargePerMonth: 8,
        weight: 62,
        builtInBms: false,
        stackable: true,
        inverterCompatibility: [
          'Luminous', 'Sukam', 'Prag', 
          'Homage', 'Felicity', 'Mecer'
        ],
        priceMin: 250000,
        priceMax: 380000,
        tier: 'tier1',
        nigeriaAvailability: 'widely-available',
        maintenanceRequired: true,
        bestFor: 'Budget-conscious buyers who already have a Luminous inverter',
        nigeriaWarning: 'Requires water topping every 2–3 months. Keep in ventilated space — emits hydrogen gas',
      },
    ],
  },

  // ─── TIER 2 (LEAD-ACID) ───────────────────

  {
    brandSlug: 'ritar',
    brandName: 'Ritar',
    country: 'China',
    founded: 2001,
    tier: 'tier2',
    nigeriaPresence: 'Available — widely used for gel deep-cycle backup systems',
    models: [
      {
        modelSlug: 'ritar-dc12-200-gel',
        modelName: 'DC12-200 Gel 12V 200Ah',
        voltage: 12,
        capacityAh: 200,
        capacityKwh: 2.4,
        usableKwh: 1.2,
        chemistry: 'GEL',
        cycleLife: 800,
        dod: 50,
        peakPowerKw: 1.2,
        continuousPowerKw: 0.6,
        warranty: 2,
        operatingTempMin: -15,
        operatingTempMax: 45,
        selfDischargePerMonth: 3,
        weight: 60,
        builtInBms: false,
        stackable: true,
        inverterCompatibility: [
          'Luminous', 'Felicity', 'Sukam', 
          'Prag', 'Homage', 'Mecer'
        ],
        priceMin: 240000,
        priceMax: 380000,
        tier: 'tier2',
        nigeriaAvailability: 'available',
        maintenanceRequired: false,
        bestFor: 'Maintenance-free lead-acid on a tight budget',
        nigeriaWarning: 'Heat above 35°C significantly reduces cycle life. Place in cool location',
      },
    ],
  },

  {
    brandSlug: 'amaron-quanta',
    brandName: 'Amaron Quanta',
    country: 'India',
    founded: 1997,
    tier: 'tier2',
    nigeriaPresence: 'Available — trusted brand in Lagos market, SMF technology popular for ease of use',
    models: [
      {
        modelSlug: 'amaron-quanta-smf-200ah',
        modelName: 'Quanta SMF 12V 200Ah',
        voltage: 12,
        capacityAh: 200,
        capacityKwh: 2.4,
        usableKwh: 1.2,
        chemistry: 'AGM',
        cycleLife: 600,
        dod: 50,
        peakPowerKw: 1.4,
        continuousPowerKw: 0.7,
        warranty: 2,
        operatingTempMin: -15,
        operatingTempMax: 45,
        selfDischargePerMonth: 4,
        weight: 55,
        builtInBms: false,
        stackable: true,
        inverterCompatibility: [
          'Luminous', 'Sukam', 'Felicity', 
          'Prag', 'Mecer'
        ],
        priceMin: 215000,
        priceMax: 400000,
        tier: 'tier2',
        nigeriaAvailability: 'available',
        maintenanceRequired: false,
        bestFor: 'Trusted Indian brand — good for small backup systems',
        nigeriaWarning: 'AGM batteries degrade fast in tropical heat above 40°C',
      },
      {
        modelSlug: 'amaron-quanta-smf-100ah',
        modelName: 'Quanta SMF 12V 100Ah',
        voltage: 12,
        capacityAh: 100,
        capacityKwh: 1.2,
        usableKwh: 0.6,
        chemistry: 'AGM',
        cycleLife: 600,
        dod: 50,
        peakPowerKw: 0.8,
        continuousPowerKw: 0.4,
        warranty: 2,
        operatingTempMin: -15,
        operatingTempMax: 45,
        selfDischargePerMonth: 4,
        weight: 30,
        builtInBms: false,
        stackable: true,
        inverterCompatibility: [
          'Luminous', 'Sukam', 'Prag'
        ],
        priceMin: 130000,
        priceMax: 215000,
        tier: 'tier2',
        nigeriaAvailability: 'available',
        maintenanceRequired: false,
        bestFor: 'Small 0.6–1kVA inverter systems for basic lighting',
      },
    ],
  },

  // ─── BUDGET TIER ──────────────────────────

  {
    brandSlug: 'narada',
    brandName: 'Narada',
    country: 'China',
    founded: 1994,
    tier: 'budget',
    nigeriaPresence: 'Available — sold through open market and online dealers',
    models: [
      {
        modelSlug: 'narada-gel-12v-200ah',
        modelName: 'Gel 12V 200Ah',
        voltage: 12,
        capacityAh: 200,
        capacityKwh: 2.4,
        usableKwh: 1.2,
        chemistry: 'GEL',
        cycleLife: 700,
        dod: 50,
        peakPowerKw: 1.0,
        continuousPowerKw: 0.5,
        warranty: 1,
        operatingTempMin: -15,
        operatingTempMax: 45,
        selfDischargePerMonth: 5,
        weight: 58,
        builtInBms: false,
        stackable: true,
        inverterCompatibility: [
          'Luminous', 'Felicity', 'Sukam'
        ],
        priceMin: 200000,
        priceMax: 320000,
        tier: 'budget',
        nigeriaAvailability: 'available',
        maintenanceRequired: false,
        bestFor: 'Lowest-cost entry for gel deep cycle backup',
        nigeriaWarning: 'Shorter cycle life and 1-year warranty — plan to replace every 2–3 years in Nigerian conditions',
      },
    ],
  },
]

// ─── HELPER FUNCTIONS ──────────────────────

export const BATTERY_BRAND_OPTIONS = 
  BATTERY_BRANDS.map(b => ({
    value: b.brandSlug,
    label: b.brandName,
    tier: b.tier,
  }))

export function getBatteryModelsForBrand(
  brandSlug: string
): { value: string; label: string }[] {
  const brand = BATTERY_BRANDS.find(
    b => b.brandSlug === brandSlug
  )
  if (!brand) return []
  return brand.models.map(m => ({
    value: m.modelSlug,
    label: `${m.modelName} · ${m.voltage}V · ${m.chemistry}`,
  }))
}

export function findBatteryModel(
  brandSlug: string,
  modelSlug: string
): BatteryModel | null {
  const brand = BATTERY_BRANDS.find(
    b => b.brandSlug === brandSlug
  )
  if (!brand) return null
  return brand.models.find(
    m => m.modelSlug === modelSlug
  ) || null
}

export function findBatteryBrand(
  brandSlug: string
): BatteryBrand | null {
  return BATTERY_BRANDS.find(
    b => b.brandSlug === brandSlug
  ) || null
}

// Chemistry label helper
export function chemistryLabel(
  c: BatteryChemistry
): string {
  const map: Record<BatteryChemistry, string> = {
    LFP: 'Lithium Iron Phosphate (LFP)',
    NMC: 'Lithium NMC',
    GEL: 'Gel Lead-Acid',
    AGM: 'AGM Lead-Acid',
    TUBULAR: 'Tubular Lead-Acid',
  }
  return map[c]
}

// Cost-per-cycle helper (Nigerian buyers care about lifetime value)
export function costPerCycle(
  m: BatteryModel
): number {
  const midPrice = (m.priceMin + m.priceMax) / 2
  return Math.round(midPrice / m.cycleLife)
}

// Estimated lifespan in Nigerian conditions
// (reduce by 15% for heat degradation)
export function nigeriaLifespanYears(
  m: BatteryModel
): number {
  const cyclesPerDay = 1.2
  const rawYears = m.cycleLife / (cyclesPerDay * 365)
  const heatPenalty = m.chemistry === 'LFP' ? 0.90 : 0.70
  return Math.round(rawYears * heatPenalty * 10) / 10
}
