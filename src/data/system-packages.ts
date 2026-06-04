/* ═══════════════════════════════════════════════════ */
/* SolarCheck Nigeria — System Package Tiers           */
/* Lagos market estimates — Updated May 2026           */
/* ═══════════════════════════════════════════════════ */

export type SystemTier =
  | 'micro'     // ₦80k–₦250k  — Student/Kiosk
  | 'basic'     // ₦250k–₦500k — Small apartment
  | 'starter'   // ₦500k–₦950k — Small family
  | 'standard'  // ₦1M–₦3M    — Medium family
  | 'premium';  // ₦3M+         — Large home

export interface SystemPackage {
  tier: SystemTier;
  label: string;
  emoji: string;
  tagline: string;
  targetUser: string;
  priceMin: number;           // ₦
  priceMax: number;           // ₦
  panelWatts: number;         // total panel wattage
  recommendedPanelWatts: number; // size of individual panels used
  batteryKwh: number;         // usable kWh storage
  inverterKva: number;        // inverter size
  batteryVoltage: 12 | 24 | 48;
  batteryType: 'Lead-Acid' | 'LFP';
  dailyOutputKwh: number;     // realistic Lagos daily gen
  hoursBackup: number;        // backup hours on battery
  paybackYears: number;       // estimated payback

  // What it can and cannot power
  canPower: string[];
  cannotPower: string[];

  // Example component breakdown (₦)
  componentBreakdown: {
    panels: { description: string; cost: number };
    battery: { description: string; cost: number };
    inverter: { description: string; cost: number };
    installation: { description: string; cost: number };
    cabling: { description: string; cost: number };
  };

  // Appliance IDs (from APPLIANCES list) this tier supports in calculator
  supportedAppliances: string[];

  // Monthly savings estimate
  monthlySavingsMin: number;  // ₦
  monthlySavingsMax: number;  // ₦
}

export const SYSTEM_PACKAGES: Record<SystemTier, SystemPackage> = {

  micro: {
    tier: 'micro',
    label: 'Micro System',
    emoji: '🎓',
    tagline: 'Student & Kiosk Pack',
    targetUser: 'Students, security posts, kiosks, gate houses, hostels',
    priceMin: 150000,
    priceMax: 300000,
    panelWatts: 200,
    recommendedPanelWatts: 200,
    batteryKwh: 1.2,
    inverterKva: 0.6,
    batteryVoltage: 12,
    batteryType: 'Lead-Acid',
    dailyOutputKwh: 0.8,
    hoursBackup: 4,
    paybackYears: 1.5,
    canPower: [
      '4 LED bulbs (all night)',
      '2 phone charges simultaneously',
      '1 laptop (8 hours)',
      '1 small standing fan (8 hours)',
      '1 small transistor radio',
      'USB-C device charging',
      'Security lights (motion sensor)',
    ],
    cannotPower: [
      'Refrigerator or freezer',
      'Television (large)',
      'Electric pressing iron',
      'Water pump',
      'Air conditioner',
      'Washing machine',
    ],
    componentBreakdown: {
      panels:       { description: '1 × 200W Mono Panel',                        cost: 45000  },
      battery:      { description: '1 × 100Ah 12V Gel Battery',                  cost: 65000  },
      inverter:     { description: '600VA Pure Sine Wave Inverter',               cost: 55000  },
      installation: { description: 'Mounting + wiring',                           cost: 35000  },
      cabling:      { description: 'Cables + connectors + charge controller',     cost: 25000  },
    },
    supportedAppliances: [
      'light_led_9w', 'light_led_15w',
      'phone_charge', 'laptop',
      'fan_standing',
    ],
    monthlySavingsMin: 8000,
    monthlySavingsMax: 20000,
  },

  basic: {
    tier: 'basic',
    label: 'Basic System',
    emoji: '🏠',
    tagline: 'Small Apartment Pack',
    targetUser: 'Single rooms, small flats, shops, barbing salons, phone repair shops',
    priceMin: 350000,
    priceMax: 650000,
    panelWatts: 600,
    recommendedPanelWatts: 300,
    batteryKwh: 2.4,
    inverterKva: 1.5,
    batteryVoltage: 24,
    batteryType: 'Lead-Acid',
    dailyOutputKwh: 2.4,
    hoursBackup: 6,
    paybackYears: 2.0,
    canPower: [
      '6–8 LED bulbs (all night)',
      '1 ceiling fan (all day)',
      '1 standing fan',
      '1 LED television (32–40 inch)',
      'DSTV decoder',
      'WiFi router',
      'Multiple phone/laptop charging',
      'Small clipper/blender (briefly)',
    ],
    cannotPower: [
      'Large refrigerator (200L+)',
      'Water pump / submersible',
      'Pressing iron',
      'Air conditioner',
      'Electric cooker',
      'Washing machine',
    ],
    componentBreakdown: {
      panels:       { description: '2 × 300W Mono Panels',             cost: 90000  },
      battery:      { description: '2 × 200Ah 12V Gel Batteries',      cost: 130000 },
      inverter:     { description: '1.5kVA Luminous/Felicity PCU',     cost: 95000  },
      installation: { description: 'Mounting + wiring',                 cost: 50000  },
      cabling:      { description: 'Cables + connectors + fuses',       cost: 35000  },
    },
    supportedAppliances: [
      'light_led_9w', 'light_led_15w', 'light_security',
      'fan_ceiling', 'fan_standing', 'fan_exhaust',
      'tv_32_led', 'tv_43_led',
      'decoder_dstv',
      'wifi_router',
      'phone_charge', 'laptop',
    ],
    monthlySavingsMin: 18000,
    monthlySavingsMax: 45000,
  },

  starter: {
    tier: 'starter',
    label: 'Starter System',
    emoji: '🏡',
    tagline: 'Small Family Pack',
    targetUser: 'Couples, small families (2–3 people), small offices, clinics, pharmacies',
    priceMin: 750000,
    priceMax: 1200000,
    panelWatts: 1200,
    recommendedPanelWatts: 400,
    batteryKwh: 4.8,
    inverterKva: 3.5,
    batteryVoltage: 48,
    batteryType: 'LFP',
    dailyOutputKwh: 4.8,
    hoursBackup: 8,
    paybackYears: 2.5,
    canPower: [
      'All lights in a 3-bedroom flat',
      '2 ceiling fans + 1 standing fan',
      '1 large television (55 inch)',
      'DSTV + decoder',
      'WiFi router + modem',
      'All phone and laptop charging',
      '1 small bar fridge (100L)',
      'Water dispenser',
      'Small blender (briefly)',
      'Small water pump (briefly)',
      'POS machine',
    ],
    cannotPower: [
      'Air conditioner (1HP+)',
      'Large chest freezer',
      'Electric pressing iron (continuously)',
      'Washing machine',
      'Electric cooker',
      'Borehole submersible pump',
    ],
    componentBreakdown: {
      panels:       { description: '3 × 400W Mono Panels',                              cost: 195000 },
      battery:      { description: '1 × Felicity/Blue Carbon 48V 100Ah LFP',           cost: 320000 },
      inverter:     { description: '3.5kVA Felicity/Growatt Hybrid',                   cost: 220000 },
      installation: { description: 'Mounting + wiring + commissioning',                 cost: 95000  },
      cabling:      { description: 'DC cables + AC cables + breakers',                  cost: 70000  },
    },
    supportedAppliances: [
      'light_led_9w', 'light_led_15w', 'light_security',
      'fan_ceiling', 'fan_standing', 'fan_exhaust',
      'tv_43_led', 'tv_55_led', 'home_theatre',
      'decoder_dstv',
      'wifi_router', 'printer',
      'phone_charge', 'laptop', 'desktop_pc',
      'fridge_inv', 'fridge_std',
      'water_dispenser',
      'pos_terminal',
      'blender',
    ],
    monthlySavingsMin: 45000,
    monthlySavingsMax: 100000,
  },

  standard: {
    tier: 'standard',
    label: 'Standard System',
    emoji: '🏘️',
    tagline: 'Family Home Pack',
    targetUser: 'Medium families (4–6 people), offices, schools, small businesses',
    priceMin: 1800_000,
    priceMax: 3500_000,
    panelWatts: 2750,
    recommendedPanelWatts: 550,
    batteryKwh: 9.6,
    inverterKva: 5.0,
    batteryVoltage: 48,
    batteryType: 'LFP',
    dailyOutputKwh: 11.0,
    hoursBackup: 12,
    paybackYears: 3.0,
    canPower: [
      'Entire home lighting',
      'Multiple fans throughout home',
      '2 large televisions',
      'Full decoder + router setup',
      '1 standard refrigerator (300L)',
      '1 chest freezer',
      'All phone/laptop charging',
      'Water pump (0.5HP briefly)',
      'Small 1HP AC (1–2 hours)',
      'Blender, pressing iron (briefly)',
      'CCTV system',
    ],
    cannotPower: [
      '2HP+ air conditioners continuously',
      'Industrial borehole pump',
      'Electric cooker continuously',
      'Welding machine',
    ],
    componentBreakdown: {
      panels:       { description: '5 × 550W Jinko/LONGi Panels',                  cost: 600000 },
      battery:      { description: '2 × Blue Carbon/Felicity LFP 100Ah',           cost: 650000 },
      inverter:     { description: '5kVA Growatt SPH/Deye Hybrid',                 cost: 850000 },
      installation: { description: 'Full installation + commissioning',              cost: 250000 },
      cabling:      { description: 'Full cabling + protection',                      cost: 150000 },
    },
    supportedAppliances: [
      'light_led_9w', 'light_led_15w', 'light_fluorescent', 'light_security',
      'fan_ceiling', 'fan_standing', 'fan_exhaust',
      'tv_32_led', 'tv_43_led', 'tv_55_led', 'home_theatre',
      'decoder_dstv',
      'wifi_router', 'printer', 'desktop_pc',
      'phone_charge', 'laptop',
      'fridge_inv', 'fridge_std', 'fridge_large_std',
      'freezer_chest', 'freezer_upright',
      'water_dispenser',
      'borehole_1hp',
      'ac_1hp_inv', 'ac_1hp_std',
      'cctv_4cam', 'cctv_8cam', 'electric_fence', 'intercom',
      'iron_steam',
      'blender', 'rice_cooker', 'microwave',
      'pos_terminal', 'cash_register',
    ],
    monthlySavingsMin: 90000,
    monthlySavingsMax: 220000,
  },

  premium: {
    tier: 'premium',
    label: 'Premium System',
    emoji: '🏢',
    tagline: 'Large Home & Business Pack',
    targetUser: 'Large families, offices, clinics, restaurants, hotels, estate houses',
    priceMin: 4000_000,
    priceMax: 9500_000,
    panelWatts: 5500,
    recommendedPanelWatts: 550,
    batteryKwh: 19.2,
    inverterKva: 10.0,
    batteryVoltage: 48,
    batteryType: 'LFP',
    dailyOutputKwh: 22.0,
    hoursBackup: 16,
    paybackYears: 3.5,
    canPower: [
      'Everything in a large home',
      '2× 1.5HP Air conditioners',
      'Industrial fridge + freezer',
      'Full office equipment',
      'Borehole pump (1HP)',
      'Multiple TVs + full security',
      'Commercial catering equipment',
      'EV slow charging (overnight)',
    ],
    cannotPower: [
      '5HP+ industrial equipment',
      'Multiple 2HP ACs simultaneously',
    ],
    componentBreakdown: {
      panels:       { description: '10 × 550W Jinko/LONGi Panels',             cost: 1200000 },
      battery:      { description: '4 × Pylontech/Blue Carbon LFP 100Ah',      cost: 1800000 },
      inverter:     { description: '10kW Growatt/Deye/Victron',                 cost: 1800000 },
      installation: { description: 'Full installation + commissioning',          cost: 500000  },
      cabling:      { description: 'Full DC/AC cabling + protection',            cost: 300000  },
    },
    // premium supports everything
    supportedAppliances: [
      'light_led_9w', 'light_led_15w', 'light_fluorescent', 'light_security',
      'fan_ceiling', 'fan_standing', 'fan_exhaust',
      'tv_32_led', 'tv_43_led', 'tv_55_led', 'home_theatre',
      'decoder_dstv',
      'wifi_router', 'printer', 'desktop_pc',
      'phone_charge', 'laptop',
      'fridge_inv', 'fridge_std', 'fridge_large_std',
      'freezer_chest', 'freezer_upright',
      'water_dispenser',
      'borehole_1hp', 'borehole_2hp',
      'water_heater_instant',
      'ac_1hp_inv', 'ac_1hp_std', 'ac_1_5hp_inv', 'ac_1_5hp_std', 'ac_2hp_inv', 'ac_2hp_std',
      'cctv_4cam', 'cctv_8cam', 'electric_fence', 'intercom',
      'iron_steam',
      'blender', 'rice_cooker', 'microwave', 'electric_kettle', 'toaster', 'electric_cooker',
      'washing_machine_front', 'washing_machine_top',
      'pos_terminal', 'cash_register', 'photocopier', 'hair_dryer', 'shop_fridge',
      'cpap', 'oxygen_concentrator', 'dialysis_machine',
    ],
    monthlySavingsMin: 200000,
    monthlySavingsMax: 600000,
  },
};

// ── Helpers ─────────────────────────────────────────────────

/** Get a package by tier */
export function getPackage(tier: SystemTier): SystemPackage {
  return SYSTEM_PACKAGES[tier];
}

/** Get the "next" tier above the given one (for upgrade hints) */
export function getNextTier(tier: SystemTier): SystemTier | null {
  const order: SystemTier[] = ['micro', 'basic', 'starter', 'standard', 'premium'];
  const idx = order.indexOf(tier);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

/** Recommend tier from budget (₦) */
export function recommendTierFromBudget(budget: number): SystemTier {
  if (budget < 250000)  return 'micro';
  if (budget < 500000)  return 'basic';
  if (budget < 1000000) return 'starter';
  if (budget < 3000000) return 'standard';
  return 'premium';
}

/** Recommend tier from daily load (kWh/day) */
export function recommendTierFromLoad(dailyKwh: number): SystemTier {
  if (dailyKwh < 0.8)  return 'micro';
  if (dailyKwh < 2.5)  return 'basic';
  if (dailyKwh < 5.0)  return 'starter';
  if (dailyKwh < 12.0) return 'standard';
  return 'premium';
}

/** Format a naira amount as ₦80k / ₦1.5M */
export function formatTierPrice(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  return `₦${(n / 1000).toFixed(0)}k`;
}
