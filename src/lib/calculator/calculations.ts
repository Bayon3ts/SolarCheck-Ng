/* ═══════════════════════════════════════════════════ */
/* SolarCheck Nigeria — Solar Calculation Engine       */
/* Market rates — Updated May 2026               */
/* ═══════════════════════════════════════════════════ */

import { supabase } from '@/lib/supabase/client';
import { CalculatorInputs, CalculatorResults } from './types';
import { MONTHLY_PSH, DEFAULT_MONTHLY_PSH } from './irradiance';

// ── Live fuel price (fetched from Supabase, falls back to constant) ────────
let _fuelPriceCache: number = 1000; // updated by getFuelPrice()

/** Call this once on client mount to sync the live price into the module cache */
export function updateFuelPriceCache(price: number): void {
  if (price >= 500 && price <= 5000) _fuelPriceCache = price;
}

/**
 * Fetch the current fuel price from Supabase site_settings.
 * Returns price, source, and updatedAt. Falls back to ₦1,000 if unreachable.
 */
export async function getFuelPrice(): Promise<{
  price: number;
  updatedAt: string;
  source: string;
}> {
  try {
    // Using the imported singleton client instead of creating a new one


    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', [
        'fuel_price_per_litre',
        'fuel_price_updated_at',
        'fuel_price_source',
      ]);

    const settings = Object.fromEntries(
      (data || []).map((r: { key: string; value: string }) => [r.key, r.value])
    );

    const price = parseInt(settings['fuel_price_per_litre'] || '1000');
    const validPrice = price >= 500 && price <= 5000 ? price : 1000;

    // Update module-level cache so subsequent calculateSolarSystem calls use it
    _fuelPriceCache = validPrice;

    return {
      price: validPrice,
      updatedAt: settings['fuel_price_updated_at'] || new Date().toISOString(),
      source: settings['fuel_price_source'] || 'Default',
    };
  } catch {
    // Fallback if Supabase unreachable
    return {
      price: _fuelPriceCache,
      updatedAt: new Date().toISOString(),
      source: 'Default (offline)',
    };
  }
}


// ── Appliance data (client + server share) ────────────────
export const APPLIANCES = [
  // ═══ COOLING ═══
  {
    id: 'ac_1hp_inv',
    name: '1HP Air Conditioner (Inverter)',
    category: 'Cooling',
    icon: '❄️',
    kwhPerDay: 4.4,
    typicalHours: 8,
    isInverter: true,
    watts: 550,
  },
  {
    id: 'ac_1hp_std',
    name: '1HP Air Conditioner (Standard)',
    category: 'Cooling',
    icon: '❄️',
    kwhPerDay: 6.0,
    typicalHours: 8,
    isInverter: false,
    watts: 750,
  },
  {
    id: 'ac_1_5hp_inv',
    name: '1.5HP Air Conditioner (Inverter)',
    category: 'Cooling',
    icon: '❄️',
    kwhPerDay: 6.0,
    typicalHours: 8,
    isInverter: true,
    watts: 750,
  },
  {
    id: 'ac_1_5hp_std',
    name: '1.5HP Air Conditioner (Standard)',
    category: 'Cooling',
    icon: '❄️',
    kwhPerDay: 8.8,
    typicalHours: 8,
    isInverter: false,
    watts: 1100,
  },
  {
    id: 'ac_2hp_inv',
    name: '2HP Air Conditioner (Inverter)',
    category: 'Cooling',
    icon: '❄️',
    kwhPerDay: 8.0,
    typicalHours: 8,
    isInverter: true,
    watts: 1000,
  },
  {
    id: 'ac_2hp_std',
    name: '2HP Air Conditioner (Standard)',
    category: 'Cooling',
    icon: '❄️',
    kwhPerDay: 12.0,
    typicalHours: 8,
    isInverter: false,
    watts: 1500,
  },
  {
    id: 'fan_ceiling',
    name: 'Ceiling Fan',
    category: 'Cooling',
    icon: '🌀',
    kwhPerDay: 0.48,
    typicalHours: 12,
    isInverter: false,
    watts: 40,
  },
  {
    id: 'fan_standing',
    name: 'Standing Fan',
    category: 'Cooling',
    icon: '🌀',
    kwhPerDay: 0.36,
    typicalHours: 12,
    isInverter: false,
    watts: 30,
  },
  {
    id: 'fan_exhaust',
    name: 'Exhaust Fan',
    category: 'Cooling',
    icon: '🌀',
    kwhPerDay: 0.18,
    typicalHours: 6,
    isInverter: false,
    watts: 30,
  },

  // ═══ REFRIGERATION ═══
  {
    id: 'fridge_inv',
    name: 'Refrigerator (Inverter/DC)',
    category: 'Refrigeration',
    icon: '🧊',
    kwhPerDay: 0.4,
    typicalHours: 24,
    isInverter: true,
    watts: 60,
  },
  {
    id: 'fridge_std',
    name: 'Refrigerator (Standard)',
    category: 'Refrigeration',
    icon: '🧊',
    kwhPerDay: 1.5,
    typicalHours: 24,
    isInverter: false,
    watts: 150,
    note: 'Compressor cycles on/off',
  },
  {
    id: 'fridge_large_std',
    name: 'Large Fridge/Side-by-Side (Standard)',
    category: 'Refrigeration',
    icon: '🧊',
    kwhPerDay: 2.5,
    typicalHours: 24,
    isInverter: false,
    watts: 250,
  },
  {
    id: 'freezer_chest',
    name: 'Chest Freezer (Standard)',
    category: 'Refrigeration',
    icon: '🧊',
    kwhPerDay: 1.2,
    typicalHours: 24,
    isInverter: false,
    watts: 120,
  },
  {
    id: 'freezer_upright',
    name: 'Upright Freezer (Standard)',
    category: 'Refrigeration',
    icon: '🧊',
    kwhPerDay: 1.8,
    typicalHours: 24,
    isInverter: false,
    watts: 180,
  },

  // ═══ LIGHTING ═══
  {
    id: 'light_led_9w',
    name: 'LED Bulb (9W)',
    category: 'Lighting',
    icon: '💡',
    kwhPerDay: 0.054,
    typicalHours: 6,
    isInverter: false,
    watts: 9,
  },
  {
    id: 'light_led_15w',
    name: 'LED Bulb (15W)',
    category: 'Lighting',
    icon: '💡',
    kwhPerDay: 0.09,
    typicalHours: 6,
    isInverter: false,
    watts: 15,
  },
  {
    id: 'light_fluorescent',
    name: 'Fluorescent Tube (40W)',
    category: 'Lighting',
    icon: '💡',
    kwhPerDay: 0.24,
    typicalHours: 6,
    isInverter: false,
    watts: 40,
    note: 'Consider upgrading to LED',
  },
  {
    id: 'light_security',
    name: 'Security/Floodlight (100W)',
    category: 'Lighting',
    icon: '🔦',
    kwhPerDay: 0.6,
    typicalHours: 6,
    isInverter: false,
    watts: 100,
  },

  // ═══ TV & ENTERTAINMENT ═══
  {
    id: 'tv_32_led',
    name: '32" LED TV (Standard)',
    category: 'Entertainment',
    icon: '📺',
    kwhPerDay: 0.3,
    typicalHours: 6,
    isInverter: false,
    watts: 50,
  },
  {
    id: 'tv_43_led',
    name: '43" LED TV (Standard)',
    category: 'Entertainment',
    icon: '📺',
    kwhPerDay: 0.5,
    typicalHours: 6,
    isInverter: false,
    watts: 80,
  },
  {
    id: 'tv_55_led',
    name: '55" LED/QLED TV (Standard)',
    category: 'Entertainment',
    icon: '📺',
    kwhPerDay: 0.8,
    typicalHours: 6,
    isInverter: false,
    watts: 130,
  },
  {
    id: 'decoder_dstv',
    name: 'DSTV Decoder',
    category: 'Entertainment',
    icon: '📡',
    kwhPerDay: 0.12,
    typicalHours: 6,
    isInverter: false,
    watts: 20,
  },
  {
    id: 'home_theatre',
    name: 'Home Theatre System',
    category: 'Entertainment',
    icon: '🔊',
    kwhPerDay: 0.36,
    typicalHours: 3,
    isInverter: false,
    watts: 120,
  },

  // ═══ COMPUTING ═══
  {
    id: 'laptop',
    name: 'Laptop',
    category: 'Computing',
    icon: '💻',
    kwhPerDay: 0.3,
    typicalHours: 6,
    isInverter: false,
    watts: 50,
  },
  {
    id: 'desktop_pc',
    name: 'Desktop PC + Monitor',
    category: 'Computing',
    icon: '🖥️',
    kwhPerDay: 0.6,
    typicalHours: 6,
    isInverter: false,
    watts: 100,
  },
  {
    id: 'wifi_router',
    name: 'WiFi Router',
    category: 'Computing',
    icon: '📶',
    kwhPerDay: 0.12,
    typicalHours: 24,
    isInverter: false,
    watts: 5,
  },
  {
    id: 'phone_charge',
    name: 'Phone Charger (×3)',
    category: 'Computing',
    icon: '📱',
    kwhPerDay: 0.06,
    typicalHours: 3,
    isInverter: false,
    watts: 20,
  },
  {
    id: 'printer',
    name: 'Inkjet Printer',
    category: 'Computing',
    icon: '🖨️',
    kwhPerDay: 0.12,
    typicalHours: 1,
    isInverter: false,
    watts: 40,
  },

  // ═══ WATER ═══
  {
    id: 'borehole_1hp',
    name: 'Borehole Pump (1HP)',
    category: 'Water',
    icon: '💧',
    kwhPerDay: 2.2,
    typicalHours: 3,
    isInverter: false,
    watts: 746,
    note: '3hrs pumping/day typical',
  },
  {
    id: 'borehole_2hp',
    name: 'Borehole Pump (2HP)',
    category: 'Water',
    icon: '💧',
    kwhPerDay: 4.0,
    typicalHours: 3,
    isInverter: false,
    watts: 1492,
  },
  {
    id: 'water_heater_instant',
    name: 'Instant Water Heater',
    category: 'Water',
    icon: '🚿',
    kwhPerDay: 1.5,
    typicalHours: 0.5,
    isInverter: false,
    watts: 3000,
    note: 'Very high wattage — runs briefly',
  },
  {
    id: 'water_dispenser',
    name: 'Water Dispenser (Hot+Cold)',
    category: 'Water',
    icon: '🚰',
    kwhPerDay: 1.0,
    typicalHours: 24,
    isInverter: false,
    watts: 90,
  },

  // ═══ KITCHEN ═══
  {
    id: 'microwave',
    name: 'Microwave Oven',
    category: 'Kitchen',
    icon: '📦',
    kwhPerDay: 1.0,
    typicalHours: 1,
    isInverter: false,
    watts: 1000,
  },
  {
    id: 'electric_kettle',
    name: 'Electric Kettle',
    category: 'Kitchen',
    icon: '☕',
    kwhPerDay: 0.75,
    typicalHours: 0.5,
    isInverter: false,
    watts: 1500,
  },
  {
    id: 'toaster',
    name: 'Toaster',
    category: 'Kitchen',
    icon: '🍞',
    kwhPerDay: 0.25,
    typicalHours: 0.25,
    isInverter: false,
    watts: 1000,
  },
  {
    id: 'blender',
    name: 'Blender/Smoothie Maker',
    category: 'Kitchen',
    icon: '🥤',
    kwhPerDay: 0.15,
    typicalHours: 0.25,
    isInverter: false,
    watts: 600,
  },
  {
    id: 'electric_cooker',
    name: 'Electric Cooker (2-plate)',
    category: 'Kitchen',
    icon: '🍳',
    kwhPerDay: 3.0,
    typicalHours: 2,
    isInverter: false,
    watts: 1500,
    note: 'High load — confirm with installer',
  },
  {
    id: 'rice_cooker',
    name: 'Rice Cooker',
    category: 'Kitchen',
    icon: '🍚',
    kwhPerDay: 0.4,
    typicalHours: 1,
    isInverter: false,
    watts: 400,
  },

  // ═══ LAUNDRY ═══
  {
    id: 'washing_machine_front',
    name: 'Washing Machine (Front Load)',
    category: 'Laundry',
    icon: '👔',
    kwhPerDay: 0.25,
    typicalHours: 1,
    isInverter: false,
    watts: 500,
    note: '0.5 wash/day average',
  },
  {
    id: 'washing_machine_top',
    name: 'Washing Machine (Top Load)',
    category: 'Laundry',
    icon: '👔',
    kwhPerDay: 0.5,
    typicalHours: 1,
    isInverter: false,
    watts: 500,
  },
  {
    id: 'iron_steam',
    name: 'Steam Iron',
    category: 'Laundry',
    icon: '👕',
    kwhPerDay: 0.5,
    typicalHours: 0.5,
    isInverter: false,
    watts: 1000,
  },

  // ═══ SECURITY ═══
  {
    id: 'cctv_4cam',
    name: 'CCTV System (4 cameras + DVR)',
    category: 'Security',
    icon: '📷',
    kwhPerDay: 0.96,
    typicalHours: 24,
    isInverter: false,
    watts: 40,
  },
  {
    id: 'cctv_8cam',
    name: 'CCTV System (8 cameras + DVR)',
    category: 'Security',
    icon: '📷',
    kwhPerDay: 1.68,
    typicalHours: 24,
    isInverter: false,
    watts: 70,
  },
  {
    id: 'electric_fence',
    name: 'Electric Fence Energizer',
    category: 'Security',
    icon: '⚡',
    kwhPerDay: 0.24,
    typicalHours: 24,
    isInverter: false,
    watts: 10,
  },
  {
    id: 'intercom',
    name: 'Intercom / Gate System',
    category: 'Security',
    icon: '🔔',
    kwhPerDay: 0.12,
    typicalHours: 24,
    isInverter: false,
    watts: 5,
  },

  // ═══ BUSINESS EQUIPMENT ═══
  {
    id: 'pos_terminal',
    name: 'POS Terminal',
    category: 'Business',
    icon: '💳',
    kwhPerDay: 0.06,
    typicalHours: 8,
    isInverter: false,
    watts: 8,
  },
  {
    id: 'cash_register',
    name: 'Cash Register / Till',
    category: 'Business',
    icon: '🏪',
    kwhPerDay: 0.08,
    typicalHours: 8,
    isInverter: false,
    watts: 10,
  },
  {
    id: 'photocopier',
    name: 'Photocopier / Printer (Office)',
    category: 'Business',
    icon: '🖨️',
    kwhPerDay: 0.8,
    typicalHours: 4,
    isInverter: false,
    watts: 200,
  },
  {
    id: 'hair_dryer',
    name: 'Hair Dryer (Salon)',
    category: 'Business',
    icon: '💇',
    kwhPerDay: 1.5,
    typicalHours: 2,
    isInverter: false,
    watts: 1800,
    note: 'Very high wattage',
  },
  {
    id: 'shop_fridge',
    name: 'Shop Display Fridge',
    category: 'Business',
    icon: '🛒',
    kwhPerDay: 3.0,
    typicalHours: 24,
    isInverter: false,
    watts: 200,
  },

  // ═══ MEDICAL ═══
  {
    id: 'cpap',
    name: 'CPAP Machine',
    category: 'Medical',
    icon: '😷',
    kwhPerDay: 0.3,
    typicalHours: 8,
    isInverter: false,
    watts: 40,
  },
  {
    id: 'oxygen_concentrator',
    name: 'Oxygen Concentrator',
    category: 'Medical',
    icon: '🫁',
    kwhPerDay: 2.4,
    typicalHours: 24,
    isInverter: false,
    watts: 100,
    note: 'Critical load — size battery for this',
  },
  {
    id: 'dialysis_machine',
    name: 'Home Dialysis Machine',
    category: 'Medical',
    icon: '🏥',
    kwhPerDay: 3.0,
    typicalHours: 4,
    isInverter: false,
    watts: 750,
    note: 'Critical load — contact installer',
  },
];





// ── STEP 2: DISCO tariff per kWh (₦) ─────────────────────
// Based on NERC Band A rates (updated 2025)
export const DISCO_BY_STATE: Record<string, string> = {
  'Lagos': 'IKEDC / EKEDC',
  'Federal Capital Territory': 'AEDC (Abuja Electric)',
  'Rivers': 'PHEDC (Port Harcourt Electric)',
  'Enugu': 'EEDC (Enugu Electric)',
  'Anambra': 'EEDC (Enugu Electric)',
  'Imo': 'EEDC (Enugu Electric)',
  'Abia': 'EEDC (Enugu Electric)',
  'Ebonyi': 'EEDC (Enugu Electric)',
  'Edo': 'BEDC (Benin Electric)',
  'Delta': 'BEDC (Benin Electric)',
  'Ondo': 'BEDC (Benin Electric)',
  'Ekiti': 'BEDC (Benin Electric)',
  'Akwa Ibom': 'PHEDC (Port Harcourt Electric)',
  'Cross River': 'PHEDC (Port Harcourt Electric)',
  'Bayelsa': 'PHEDC (Port Harcourt Electric)',
  'Kaduna': 'KAEDCO (Kaduna Electric)',
  'Katsina': 'KAEDCO (Kaduna Electric)',
  'Zamfara': 'KAEDCO (Kaduna Electric)',
  'Kebbi': 'KAEDCO (Kaduna Electric)',
  'Sokoto': 'KAEDCO (Kaduna Electric)',
  'Kano': 'KEDCO (Kano Electric)',
  'Jigawa': 'KEDCO (Kano Electric)',
  'Niger': 'AEDC (Abuja Electric)',
  'Nasarawa': 'AEDC (Abuja Electric)',
  'Kogi': 'AEDC (Abuja Electric)',
  'Plateau': 'JEDC (Jos Electric)',
  'Benue': 'JEDC (Jos Electric)',
  'Kwara': 'IBEDC (Ibadan Electric)',
  'Oyo': 'IBEDC (Ibadan Electric)',
  'Ogun': 'IBEDC (Ibadan Electric)',
  'Osun': 'IBEDC (Ibadan Electric)',
  'Adamawa': 'YEDC (Yola Electric)',
  'Taraba': 'YEDC (Yola Electric)',
  'Gombe': 'GEDC (Jos Electric)',
  'Bauchi': 'JEDC (Jos Electric)',
  'Borno': 'YEDC (Yola Electric)',
  'Yobe': 'YEDC (Yola Electric)',
};

export const DISCO_TARIFF: Record<string, number> = {
  'IBEDC': 58,
  'EEDC':  52,
  'PHEDC': 55,
  'BEDC':  50,
  'AEDC':  62,
  'JEDC':  48,
  'KEDC':  45,
  'YEDC':  48,
  'KAEDCO': 43,
  'GEDC':  42,
  'KEDCO': 40,
};

export const PETROL_PRICE_PER_LITRE = 1000;  // ₦/L — update monthly

// ── IKEDC / EKEDC Band Tariffs (NERC ORDER/NERC/2025/050) ─────────────
export const IKEDC_BANDS = [
  { id: 'band_a', label: '20+ hours (Band A)',       tariff: 209.50 },
  { id: 'band_b', label: '16–20 hours (Band B)',     tariff: 62.48  },
  { id: 'band_c', label: '12–16 hours (Band C)',     tariff: 45.80  },
  { id: 'band_d', label: '8–12 hours (Band D)',      tariff: 31.24  },
  { id: 'band_e', label: 'Under 8 hours (Band E)',   tariff: 31.24  },
  { id: 'none',   label: 'Almost no supply',         tariff: 31.24  },
] as const;

/**
 * Returns the effective tariff (₦/kWh) for a given DISCO string and optional Lagos band.
 * Single source of truth — used by both the engine and the UI.
 */
export function getEffectiveTariff(disco: string, band?: string): number {
  // Band-specific tariffs for IKEDC/EKEDC
  // Source: ORDER/NERC/2025/050, May 2025
  if (disco.includes('IKEDC') || disco.includes('EKEDC')) {
    const bandRates: Record<string, number> = {
      'band_a': 209.50,  // 20+ hrs/day
      'band_b': 62.48,   // 16-20 hrs/day
      'band_c': 45.80,   // 12-16 hrs/day
      'band_d': 31.24,   // 8-12 hrs/day
      'band_e': 31.24,   // under 8 hrs/day
    };
    return (band ? bandRates[band] : undefined) ?? 62.48;
  }

  const acronym = disco.split(' ')[0];
  return DISCO_TARIFF[acronym] ?? 65;
}

// ── Charge Controller ──────────────────────────────────────────
export type ChargeControllerType = 
  | 'None'   // hybrid inverter — built in
  | 'PWM'    // small off-grid systems
  | 'MPPT'   // larger off-grid systems

export interface ChargeControllerSpec {
  type: ChargeControllerType
  amps: number          // e.g. 40
  reason: string        // explanation string
  estimatedCost: number // ₦
}

/**
 * Determines whether a separate charge 
 * controller is needed and what spec.
 *
 * Hybrid inverters have built-in MPPT —
 * no external controller needed.
 * Off-grid / PCU inverters need a 
 * separate controller wired between 
 * the panels and the battery bank.
 */
export function getChargeControllerSpec(
  inverterType: 'hybrid' | 'off-grid' | 
                'pcu' | 'on-grid',
  totalPanelWatts: number,
  batteryVoltage: 12 | 24 | 48
): ChargeControllerSpec {

  // Hybrid inverters have built-in MPPT
  if (inverterType === 'hybrid' || 
      inverterType === 'on-grid') {
    return {
      type: 'None',
      amps: 0,
      reason: 'Hybrid inverter has built-in MPPT charge controller — no separate unit needed.',
      estimatedCost: 0,
    }
  }

  // Calculate required amps
  // Add 25% safety margin (standard practice)
  const requiredAmps = Math.ceil(
    (totalPanelWatts / batteryVoltage) * 1.25
  )

  // PWM for small 12V systems only
  // (PWM wastes power on 24V/48V systems)
  const usePWM = 
    batteryVoltage === 12 && 
    totalPanelWatts <= 300

  if (usePWM) {
    // Round up to nearest standard PWM size
    const pwmSize = requiredAmps <= 10 ? 10
      : requiredAmps <= 20 ? 20
      : 30

    // Nigerian market pricing for PWM
    const pwmCost = pwmSize <= 10 ? 15000
      : pwmSize <= 20 ? 22000
      : 35000

    return {
      type: 'PWM',
      amps: pwmSize,
      reason: `${pwmSize}A PWM charge controller required. Your off-grid inverter does not have a built-in solar charge controller. PWM is suitable for this small 12V system.`,
      estimatedCost: pwmCost,
    }
  }

  // MPPT for all other off-grid systems
  // Round up to nearest standard MPPT size
  const mpptSize = 
    requiredAmps <= 20 ? 20
    : requiredAmps <= 30 ? 30
    : requiredAmps <= 40 ? 40
    : requiredAmps <= 60 ? 60
    : requiredAmps <= 80 ? 80
    : 100

  // Nigerian market pricing for MPPT
  // (Victron, EPever, Renogy are common brands)
  const mpptCost = 
    mpptSize <= 20 ? 45000
    : mpptSize <= 30 ? 65000
    : mpptSize <= 40 ? 95000
    : mpptSize <= 60 ? 175000
    : mpptSize <= 80 ? 250000
    : 350000

  return {
    type: 'MPPT',
    amps: mpptSize,
    reason: `${mpptSize}A MPPT charge controller required. Your off-grid inverter has no built-in solar controller. MPPT is essential for 24V/48V systems — it recovers 10-30% more solar energy than PWM in Nigeria's climate.`,
    estimatedCost: mpptCost,
  }
}





// ── Daytime Heavy Analysis ──────────────────────────────────────
export interface DaytimeHeavyAnalysis {
  isDaytimeHeavy: boolean
  daytimeLoadKw: number
  nighttimeLoadKw: number
  daytimeRatio: number    // e.g. 0.78 = 78% of load is daytime
  recommendedPanelKw: number  // for daytime load
  recommendedNightBatteryKwh: number // minimum for night
  requiresMultipleMppt: boolean
  mpptInputsNeeded: number
  recommendedInverterNote: string
  panelStringSplit?: string  // e.g. "2 strings of 4 panels"
}

/**
 * Detects whether the user's load 
 * pattern favours a daytime-heavy 
 * solar setup — large panel array 
 * for direct daytime use, small battery 
 * bank covering only nighttime essentials.
 */
export function analyzeDaytimeLoad(
  appliances: Array<{
    name: string
    watts: number
    quantity: number
    hoursPerDay: number
    daytimeHours: number
  }>,
  totalPanelWatts: number,
  singleMpptMaxW: number = 5500
): DaytimeHeavyAnalysis {

  let daytimeKwh = 0
  let nighttimeKwh = 0

  appliances.forEach(a => {
    const totalWh = a.watts * a.quantity * a.hoursPerDay
    const daytimeWh = a.watts * a.quantity * a.daytimeHours
    const nighttimeWh = totalWh - daytimeWh

    daytimeKwh += daytimeWh / 1000
    nighttimeKwh += nighttimeWh / 1000
  })

  const totalKwh = daytimeKwh + nighttimeKwh
  const daytimeRatio = totalKwh > 0 ? daytimeKwh / totalKwh : 0

  const isDaytimeHeavy = daytimeRatio >= 0.65

  const daytimeLoadKw = daytimeKwh / 8
  const recommendedPanelKw = isDaytimeHeavy
    ? Math.ceil((daytimeLoadKw + (nighttimeKwh / 8)) * 1.3 * 10) / 10
    : totalPanelWatts / 1000

  const rawNightBatteryKwh = isDaytimeHeavy
    ? Math.ceil(nighttimeKwh * 1.2 * 10) / 10
    : 0
  const batteryFloor = 0;
  const recommendedNightBatteryKwh = Math.max(rawNightBatteryKwh, batteryFloor)

  const panelWatts = recommendedPanelKw * 1000
  const requiresMultipleMppt = panelWatts > singleMpptMaxW

  const mpptInputsNeeded = requiresMultipleMppt
    ? Math.ceil(panelWatts / singleMpptMaxW)
    : 1

  let panelStringSplit: string | undefined
  if (requiresMultipleMppt) {
    const totalPanels = Math.ceil(panelWatts / 550)
    const panelsPerString = Math.floor(totalPanels / mpptInputsNeeded)
    const remainder = totalPanels - (panelsPerString * (mpptInputsNeeded - 1))
    panelStringSplit = `${mpptInputsNeeded - 1} strings of ${panelsPerString} panels + 1 string of ${remainder} panels`
  }

  let recommendedInverterNote = ''
  if (isDaytimeHeavy && requiresMultipleMppt) {
    recommendedInverterNote = `Your panel array (${(panelWatts/1000).toFixed(1)}kW) exceeds what a single MPPT input can handle (${(singleMpptMaxW/1000).toFixed(1)}kW). You need an inverter with ${mpptInputsNeeded} MPPT inputs — such as the Deye SUN-8K (2 MPPT, 10.4kW PV) or Growatt MIN 6000 (2 MPPT, 8kW PV). Panels split: ${panelStringSplit}.`
  } else if (isDaytimeHeavy) {
    recommendedInverterNote = `Your load is mostly daytime — a standard hybrid inverter with 1 MPPT input handles your ${(panelWatts/1000).toFixed(1)}kW array. The small battery bank (${recommendedNightBatteryKwh}kWh) covers your nighttime essentials only.`
  }

  return {
    isDaytimeHeavy,
    daytimeLoadKw,
    nighttimeLoadKw: nighttimeKwh / 12,
    daytimeRatio,
    recommendedPanelKw,
    recommendedNightBatteryKwh,
    requiresMultipleMppt,
    mpptInputsNeeded,
    recommendedInverterNote,
    panelStringSplit,
  }
}

export function calculateSolarSystem(inputs: CalculatorInputs): CalculatorResults & { chargeController: ChargeControllerSpec; daytimeAnalysis: DaytimeHeavyAnalysis } {
  const {
    state, monthlyBill, generatorSpend,
    appliances, coveragePct, systemMode, autonomyDays,
    roofType, roofDirection, roofPitch, shadeObstruction,
    fuelInflation, nepaInflation, discountRate
  } = inputs;

  const discoStr = DISCO_BY_STATE[state] || 'Unknown';
  const discoTariff = getEffectiveTariff(discoStr, inputs.lagosElectricityBand);

  // STEP 1 & 2 — LOAD CALCULATION & DAY/NIGHT CLASSIFICATION
  // ─────────────────────────────────────────────────────────
  // ENGINEERING NOTE: We use kwhPerDay × qty (not watts × typicalHours).
  // kwhPerDay already accounts for real-world duty cycles:
  //   • Fridge compressor cycles on ~40% of the time → 1.5 kWh/day not 3.6
  //   • Washing machine used 0.5×/day average → 0.25 kWh not 0.5
  //   • This matches what a trained solar engineer would enter in a load sheet.
  let dailyLoadKwh = 0;
  let nightLoadKwh = 0;
  let peakSurgeKw = 0;
  let simultaneousLoadKw = 0; // for inverter sizing
  let hasAC = false;
  let hasWaterPump = false;

  if (appliances.length > 0) {
    appliances.forEach(appSelection => {
      const appDef = APPLIANCES.find(a => a.id === appSelection.id);
      if (!appDef) return;

      const qty = appSelection.qty;
      if (qty <= 0) return;

      const typicalHours = appDef.typicalHours || 1;

      // ── FIX 1: Use kwhPerDay × qty (duty-cycle-aware) ──────────────────
      const appDayKwh = appDef.kwhPerDay * qty;
      dailyLoadKwh += appDayKwh;

      // ── FIX 2: Night load — proportional split using actual hours ────────
      let nightKwh = 0;
      if (typicalHours === 24) {
        // 24h appliances (fridge, router, CCTV, etc.) split 50/50 day/night
        nightKwh = appDayKwh * 0.5;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dayHrs = Math.min((appSelection as any).daytimeHours ?? Math.min(typicalHours, 8), typicalHours);
        const nightHrs = Math.max(0, typicalHours - dayHrs);
        nightKwh = typicalHours > 0 ? appDayKwh * (nightHrs / typicalHours) : 0;
      }
      nightLoadKwh += nightKwh;

      // ── FIX 3: Correct surge factors ────────────────────────────────────
      // Fans are NOT compressors — they don't have 2.5× startup surge.
      // Only compressors (AC, fridge, water pump) need high surge factors.
      const continuousKw = (appDef.watts * qty) / 1000;
      simultaneousLoadKw += continuousKw;

      const isFan = appDef.id.startsWith('fan_');
      const isAC  = appDef.id.startsWith('ac_');
      const isCompressor = !isFan && ['Cooling', 'Refrigeration', 'Water'].includes(appDef.category);
      const isWaterPump  = appDef.id.startsWith('borehole_');

      if (isAC)  hasAC = true;
      if (isWaterPump) hasWaterPump = true;

      let surgeMult = 1.0;
      if (isFan) {
        surgeMult = 1.2;  // Small startup inrush — NOT compressor-level
      } else if (isCompressor) {
        surgeMult = appDef.isInverter ? 1.5 : 2.5;
      } else if (appDef.category === 'Laundry') {
        surgeMult = 2.0;  // Motor startup
      }
      peakSurgeKw += continuousKw * surgeMult;
    });
  } else {
    // No appliances entered — estimate from bill + generator spend
    const monthlyKwhFromNepa = monthlyBill / discoTariff;
    const effectiveFuelPrice = _fuelPriceCache > 0 ? _fuelPriceCache : PETROL_PRICE_PER_LITRE;
    const generatorFuelLiters = generatorSpend / effectiveFuelPrice;
    const fuelEff = inputs.fuelEfficiency || 2.0;
    const monthlyKwhFromGenerator = generatorFuelLiters * fuelEff;

    dailyLoadKwh = (monthlyKwhFromNepa + monthlyKwhFromGenerator) / 30;
    nightLoadKwh = dailyLoadKwh * 0.45; // 45% at night (typical Nigerian home)
    peakSurgeKw  = dailyLoadKwh * 0.2;  // rough estimate
    simultaneousLoadKw = dailyLoadKwh * 0.15;
  }

  // Target Energy Offset
  // 100% coverage = energy offset target only, NOT guarantee of autonomy.
  const targetDailyGenerationKwh = dailyLoadKwh * (coveragePct / 100);

  // STEP 3 — SOLAR PRODUCTION MODEL (PHYSICS)
  const pshArray = MONTHLY_PSH[state] ?? DEFAULT_MONTHLY_PSH;
  const avgPSH = pshArray.reduce((a, b) => a + b, 0) / pshArray.length;

  let directionFactor = 1.0;
  if (roofDirection === 'South') directionFactor = 1.0;
  else if (roofDirection === 'South-East' || roofDirection === 'South-West') directionFactor = 0.95;
  else if (roofDirection === 'East' || roofDirection === 'West') directionFactor = 0.85;
  else if (roofDirection === 'North-East' || roofDirection === 'North-West') directionFactor = 0.80;
  else if (roofDirection === 'North') directionFactor = 0.75;

  let pitchFactor = 1.0;
  if (roofPitch === 'Flat (0°)') pitchFactor = 0.92;
  else if (roofPitch === 'Low (10-15°)') pitchFactor = 0.97;
  else if (roofPitch === 'Medium (20-30°)') pitchFactor = 1.00;
  else if (roofPitch === 'Steep (35-45°)') pitchFactor = 0.97;

  const shadeFactor = 1 - (shadeObstruction / 100);
  
  // System efficiency default ~0.75 (reduced from 0.80 to be more realistic)
  const systemEfficiency = 0.75 * directionFactor * pitchFactor * shadeFactor;

  // ── PV SIZING — annual average is the baseline ──────────────────────────
  // ENGINEERING NOTE: Size to annual average PSH. The rainy-season worst-month
  // (rainyReq) is used only for classification and QA warnings — NOT as a sizing
  // floor. Forcing pvKwp = Math.max(annual, rainy) causes ~67% oversizing in
  // Nigerian humid states because Jul/Aug PSH reductions already baked into the
  // annual average.
  const minPSH = Math.min(...pshArray); // e.g. Lagos July = 3.0 hrs
  const rainyMinPSH = minPSH * 0.9;    // 10% extra buffer for unusually bad rainy days

  // Annual average requirement (sizing basis)
  const annualReq = targetDailyGenerationKwh / (avgPSH * systemEfficiency);
  // Worst-month (rainy season) — used for QA classification only, not as floor
  const rainyReq  = targetDailyGenerationKwh / (rainyMinPSH * systemEfficiency);

  // Off-grid gets a 15% irradiance buffer to handle low-irradiance months
  // without a grid/generator bridge. Hybrid/grid-tied: no buffer needed.
  const pvKwpRaw = systemMode === 'off-grid' ? annualReq * 1.15 : annualReq;

  // ── ADAPTIVE PANEL WATTAGE TIER SELECTION ────────────────────────────────
  // Select the most appropriate panel wattage based on system kWp.
  // Source: SolarCheck Nigeria engineering spec (IEC 62109 / Nigerian installer practice 2025)
  // < 1.5 kWp  → 400W  (small systems need granularity, not oversized panels)
  // 1.5–3 kWp  → 450W  (small-medium hybrid; standard 1–2 room setups)
  // 3–6 kWp    → 550W  (standard residential; most common Nigerian installer choice)
  // 6–12 kWp   → 650W  (large home / small business; fewer roof penetrations)
  // >12 kWp    → 700W  (commercial scale; cost per Wp improves at higher wattage)
  let panelSizeWatts: number;
  let panelTierLabel: string;
  if (pvKwpRaw < 1.5) {
    panelSizeWatts = 400;
    panelTierLabel = 'Compact (< 1.5 kWp range)';
  } else if (pvKwpRaw < 3.0) {
    panelSizeWatts = 450;
    panelTierLabel = 'Small-Medium (1.5–3 kWp range)';
  } else if (pvKwpRaw < 6.0) {
    panelSizeWatts = 550;
    panelTierLabel = 'Standard Residential (3–6 kWp range)';
  } else if (pvKwpRaw < 12.0) {
    panelSizeWatts = 650;
    panelTierLabel = 'Large Home / Business (6–12 kWp range)';
  } else {
    panelSizeWatts = 700;
    panelTierLabel = 'Commercial Scale (> 12 kWp range)';
  }

  // Round UP panel count — actual installed kWp will always be ≥ target
  const panelsNeeded = Math.ceil((pvKwpRaw * 1000) / panelSizeWatts);
  const actualPvKwp  = (panelsNeeded * panelSizeWatts) / 1000;

  // ── BATTERY SIZING — spec-accurate LFP constants ─────────────────────────
  // ENGINEERING NOTE:
  //   LFP_DOD  = 0.80  (Lithium Iron Phosphate: 80% depth of discharge)
  //   RT_EFF   = 0.92  (Round-trip efficiency: inverter + wiring losses)
  //   requiredUsable = nightLoadKwh × autonomyDays  (hybrid)
  //   requiredUsable = dailyLoadKwh × autonomyDays  (off-grid)
  //   batteryKwh = requiredUsable / (LFP_DOD × RT_EFF)
  // These same constants MUST be used in autonomy calculation to stay consistent.
  const LFP_DOD  = 0.80;
  const RT_EFF   = 0.92;
  const BATT_INCREMENT = 1.2; // kWh per module (100Ah@12V)
  const BATT_MIN       = 2.4; // kWh minimum (200Ah@12V)

  let requiredUsableKwh = 0;
  let batterySufficiency: 'insufficient' | 'limited' | 'adequate' | 'strong' | 'full' | 'daytime-optimized' = 'adequate';

  if (systemMode === 'grid-tied') {
    requiredUsableKwh = 0;
  } else if (systemMode === 'off-grid') {
    // Off-grid: cover full daily load for autonomyDays
    requiredUsableKwh = dailyLoadKwh * autonomyDays;
  } else {
    // Hybrid: cover night load for autonomyDays nights.
    // Respect the user's autonomy selection — do NOT force a minimum 1.4× floor.
    requiredUsableKwh = nightLoadKwh * autonomyDays;
  }

  // batteryKwh = requiredUsable / (LFP_DOD × RT_EFF)
  let batteryKwh = requiredUsableKwh > 0
    ? requiredUsableKwh / (LFP_DOD * RT_EFF)
    : 0;

  if (batteryKwh > 0) {
    // Round up to nearest LFP unit size (1.2 kWh steps, min 2.4)
    batteryKwh = Math.max(BATT_MIN, Math.ceil(batteryKwh / BATT_INCREMENT) * BATT_INCREMENT);
    batteryKwh = Math.round(batteryKwh * 10) / 10;

    // Nigerian engineering minimum floors
    const minBattery = hasAC || hasWaterPump ? 4.8 : BATT_MIN;
    batteryKwh = Math.max(batteryKwh, minBattery);
  }

  // Autonomy calculation — MUST use identical constants (LFP_DOD × RT_EFF)
  // usableBattery = batteryKwh × LFP_DOD × RT_EFF
  const usableBattery = batteryKwh * LFP_DOD * RT_EFF;
  let autonomyHours = 0;
  if (batteryKwh > 0 && nightLoadKwh > 0) {
    // Autonomy in hours: usable kWh ÷ (night load kW, averaged over 12h window)
    autonomyHours = usableBattery / (nightLoadKwh / 12);
  } else if (batteryKwh > 0 && dailyLoadKwh > 0) {
    autonomyHours = usableBattery / (dailyLoadKwh / 24);
  }

  // Battery sufficiency rating
  // Thresholds are ratios of usableBattery to nightLoadKwh.
  // ratio < 1.0  → battery cannot cover a full night → LIMITED
  // ratio ≥ 1.0  → adequate for the night
  // daytime-optimized → majority of load is solar-direct (daytime heavy pattern)
  const nightHoursWindow = 12; // 7pm–7am
  const nightLoadKw = nightLoadKwh > 0 ? nightLoadKwh / nightHoursWindow : 0;
  const nightCoverageRatio = nightLoadKwh > 0 ? usableBattery / nightLoadKwh : 0;
  const isDaytimeOptimized = dailyLoadKwh > 0 && (nightLoadKwh / dailyLoadKwh) < 0.30;

  if (systemMode === 'grid-tied') {
    batterySufficiency = 'insufficient';
  } else if (nightLoadKwh <= 0) {
    batterySufficiency = 'full';
  } else if (isDaytimeOptimized) {
    // Most load is solar-direct; battery exists mainly to top up small night essentials
    batterySufficiency = 'daytime-optimized';
  } else {
    // Standard night-coverage rating
    if      (nightCoverageRatio < 1.0) batterySufficiency = 'limited';      // cannot cover 1 full night
    else if (nightCoverageRatio < 1.5) batterySufficiency = 'adequate';     // covers night comfortably
    else if (nightCoverageRatio < 2.5) batterySufficiency = 'strong';       // covers night + buffer
    else                               batterySufficiency = 'full';         // well over a night
  }

  // Autonomy note — emitted when autonomy > 24h so the UI can clarify it's
  // due to low night usage, NOT full-day backup capability.
  let autonomyNote: string | undefined;
  if (autonomyHours > 24 && systemMode !== 'off-grid') {
    const avgNightWatts = Math.round(nightLoadKw * 1000);
    autonomyNote = `${autonomyHours.toFixed(1)} hours of autonomy reflects your low nightly load (~${avgNightWatts}W average, ${nightLoadKwh.toFixed(2)} kWh/night). This is not a full-day backup claim — the battery covers your night load for multiple nights precisely because your night consumption is small.`;
  }

  // ── FIX 6: INVERTER SIZING — load-based, not PV-based ────────────────────
  // ENGINEERING NOTE: Inverter kVA must match AC output demand, NOT solar input.
  // The old code used pvKwp × 1.1 which oversizes inverter when PV is oversized.
  // Correct method:
  //   1. Sum all simultaneous watts (continuous rating)
  //   2. Add the startup surge of the SINGLE heaviest motor (not all at once)
  //   3. Apply 25% safety margin
  //   4. Nigerian floor: any AC present → min 5kVA
  const inverterSizes = [3, 5, 8, 10, 15, 20, 30];

  // Heaviest single motor startup additional watts
  let heaviestStartupAddKw = 0;
  if (appliances.length > 0) {
    appliances.forEach(appSelection => {
      const appDef = APPLIANCES.find(a => a.id === appSelection.id);
      if (!appDef || appSelection.qty <= 0) return;
      const continuousKw = (appDef.watts * appSelection.qty) / 1000;
      const isFan = appDef.id.startsWith('fan_');
      const isCompressor = !isFan && ['Cooling', 'Refrigeration', 'Water'].includes(appDef.category);
      const isLaundry = appDef.category === 'Laundry';
      let mult = 1.0;
      if (isCompressor) mult = appDef.isInverter ? 1.5 : 2.5;
      else if (isLaundry) mult = 2.0;
      else if (isFan) mult = 1.2;
      const startupAdd = continuousKw * (mult - 1.0); // additional above continuous
      if (startupAdd > heaviestStartupAddKw) heaviestStartupAddKw = startupAdd;
    });
  }

  // Required kVA = (continuous loads × diversity factor + heaviest startup surge) × 1.25
  // BUG FIX C: 0.7 diversity factor — not all appliances run simultaneously in real life.
  // The heaviest startup surge is NOT diversified (it IS the simultaneous worst case).
  const rawInverterKva = (simultaneousLoadKw * 0.7 + heaviestStartupAddKw) * 1.25;

  // Nigerian engineering floor: 5kVA minimum when AC is present
  const minInverterKva = hasAC ? 5 : hasWaterPump ? 5 : 3;
  const requiredInverterKva = Math.max(rawInverterKva, minInverterKva);
  const inverterKva = inverterSizes.find(sz => sz >= requiredInverterKva) ?? 30;

  // PV classification against annualReq (the actual sizing basis).
  // rainyReq is used ONLY for seasonalRisk below — it is a risk flag, not a sizing threshold.
  let pvClassification: 'UNDER SIZED' | 'OPTIMAL' | 'OVER SIZED' = 'OPTIMAL';
  if (actualPvKwp < annualReq * 0.95)      pvClassification = 'UNDER SIZED';
  else if (actualPvKwp <= annualReq * 1.5) pvClassification = 'OPTIMAL';
  else                                      pvClassification = 'OVER SIZED';

  // Seasonal risk using actual minPSH
  let seasonalRisk: 'Rainy season stable' | 'Rainy season borderline' | 'Rainy season at risk';
  const rainyProduction = actualPvKwp * rainyMinPSH * systemEfficiency;
  if      (rainyProduction >= targetDailyGenerationKwh)       seasonalRisk = 'Rainy season stable';
  else if (rainyProduction >= targetDailyGenerationKwh * 0.85) seasonalRisk = 'Rainy season borderline';
  else                                                          seasonalRisk = 'Rainy season at risk';

  // STEP 6 — COST & SAVINGS (Ranges)
  const roofMountingCost = roofType === 'clay_tiles' ? 35000 : 0;
  let baseSystemCostMin = actualPvKwp * 500000;
  let baseSystemCostMax = actualPvKwp * 700000;
  const isFlatConcrete = roofType === 'flat_concrete';
  if (isFlatConcrete) { baseSystemCostMin *= 1.05; baseSystemCostMax *= 1.05; }

  const batteryUnitCost = 180000;
  const totalBatteryCost = batteryKwh * batteryUnitCost;
  
  let systemCostMin = baseSystemCostMin + totalBatteryCost + roofMountingCost;
  let systemCostMax = baseSystemCostMax + totalBatteryCost + roofMountingCost;

  const totalPanelWatts = actualPvKwp * 1000;
  const batteryVoltage: 12 | 24 | 48 = (actualPvKwp < 1 ? 12 : actualPvKwp < 3 ? 24 : 48);
  const selectedInverterType: 'hybrid' | 'off-grid' | 'pcu' | 'on-grid' = systemMode === 'grid-tied' ? 'on-grid' : (systemMode === 'off-grid' ? 'off-grid' : 'hybrid');
  
  const chargeController = getChargeControllerSpec(selectedInverterType, totalPanelWatts, batteryVoltage);
  systemCostMin += chargeController.estimatedCost;
  systemCostMax += chargeController.estimatedCost;

  const monthlyCurrentSpend = monthlyBill + generatorSpend;
  
  let monthlyGridSavingsExpected = 0;
  let monthlyGeneratorSavingsExpected = 0;

  if (systemMode === 'off-grid') {
    monthlyGridSavingsExpected = monthlyBill;
    monthlyGeneratorSavingsExpected = generatorSpend;
  } else {
    const potentialSavings = monthlyCurrentSpend * (coveragePct / 100);
    monthlyGridSavingsExpected = Math.min(potentialSavings, monthlyBill);
    const remainingSavings = potentialSavings - monthlyGridSavingsExpected;
    
    if (generatorSpend > 0 && remainingSavings > 0) {
      monthlyGeneratorSavingsExpected = Math.min(remainingSavings, generatorSpend);
    } else {
      monthlyGeneratorSavingsExpected = 0;
    }

    if (monthlyGridSavingsExpected >= monthlyBill * 0.99 && monthlyGeneratorSavingsExpected >= generatorSpend * 0.99) {
      // Prevent 100% dual savings if not off-grid
      monthlyGeneratorSavingsExpected = generatorSpend * 0.8;
    }
    if (systemMode === 'hybrid') {
      monthlyGeneratorSavingsExpected *= 0.5; // 50% probability factor
    }
  }

  const calculateRange = (base: number) => ({
    conservative: Math.round(base * 0.8),
    expected: Math.round(base),
    stressCase: Math.round(base * 0.5)
  });

  const monthlyGridSavings = calculateRange(monthlyGridSavingsExpected);
  const monthlyGeneratorSavings = calculateRange(monthlyGeneratorSavingsExpected);

  const calculateNPVSavings = (years: number) => {
    const fInf = fuelInflation / 100;
    const tInf = nepaInflation / 100;
    const dRate = discountRate / 100;
    const monthlyMaintenance = actualPvKwp * 500 / 12;

    let totalSavingsExpected = 0;
    for (let year = 1; year <= years; year++) {
      const nepaSaving = monthlyGridSavingsExpected * Math.pow(1 + tInf, year);
      const generatorSaving = monthlyGeneratorSavingsExpected * Math.pow(1 + fInf, year);
      const yearSaving = ((nepaSaving + generatorSaving) - monthlyMaintenance) * 12;
      totalSavingsExpected += yearSaving / Math.pow(1 + dRate, year);
    }
    return calculateRange(totalSavingsExpected);
  };

  const fiveYearSavings = calculateNPVSavings(5);
  const tenYearSavings = calculateNPVSavings(10);

  const firstYearMonthlySavingExpected = (monthlyGridSavingsExpected * (1 + (nepaInflation/100)/2)) + (monthlyGeneratorSavingsExpected * (1 + (fuelInflation/100)/2));
  const newSystemCostMid = (systemCostMin + systemCostMax) / 2;
  const paybackMonths = Math.round(newSystemCostMid / firstYearMonthlySavingExpected);

  let afterSolarMonthlyCost = monthlyCurrentSpend * (1 - coveragePct / 100);
  afterSolarMonthlyCost += actualPvKwp * 500 / 12;

  const monthlyProductionArray = pshArray.map(h => actualPvKwp * h * 30 * systemEfficiency);
  const co2SavedKgPerYear = monthlyProductionArray.reduce((a, b) => a + b, 0) * 0.43;
  const treesEquivalent = Math.round(co2SavedKgPerYear / 21);

  // STEP 7 — VALIDATION LAYER
  let validationError: string | undefined;
  let isValid = true;
  const errors: string[] = [];

  if (batterySufficiency === 'full' && usableBattery < nightLoadKwh) {
    errors.push("Contradiction: Battery labeled 'FULL' but usable capacity is less than one night's load.");
  }
  if (autonomyHours < 24 && systemMode === 'off-grid') {
    errors.push("Invalid configuration: Off-grid mode requires at least 24h autonomy.");
  }
  if ((monthlyGridSavingsExpected + monthlyGeneratorSavingsExpected) > monthlyCurrentSpend * 0.9 && generatorSpend === 0 && systemMode !== 'off-grid') {
    errors.push("Savings validation: Claimed savings exceed 90% of total bill without generator dependency confirmation.");
  }
  // NOTE: coveragePct=100 means energy OFFSET, not physical autonomy. A hybrid system
  // can offset 100% of annual energy from solar while the battery covers only the night.
  // These are independent metrics — do NOT conflate them.

  if (errors.length > 0) {
    isValid = false;
    validationError = 'WARNINGS IN SYSTEM DESIGN\n\n' + errors.join('\n');
  }

  // DAYTIME ANALYSIS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appliancesWithDaytimeHours = inputs.appliances.map(appSelection => {
    const appDef = APPLIANCES.find(a => a.id === appSelection.id);
    const watts = appDef?.watts || 0;
    const hoursPerDay = appDef?.typicalHours || 1;
    let daytimeHours = 0;
    if (hoursPerDay === 24) {
      daytimeHours = 12;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      daytimeHours = (appSelection as any).daytimeHours ?? Math.min(hoursPerDay, 8);
    }
    return { name: appDef?.name || appSelection.id, watts, quantity: appSelection.qty, hoursPerDay, daytimeHours };
  });
  const daytimeAnalysis = analyzeDaytimeLoad(appliancesWithDaytimeHours, totalPanelWatts, 5500);


  // --- TRUTH QA LAYER ---
  // Score starts at 100 — deductions only for:
  //   • math errors (claimed ≠ calculated)
  //   • physical contradictions (label vs physics)
  //   • impossible physics (savings > spend, autonomy > 24h on small battery while claiming full-day)
  // Safe oversizing (e.g. 15% panel rounding, conservative battery) is NOT penalized.
  let qaScore = 100;
  const qaWarnings: string[] = [];
  const flags = { pvBias: false, savingsBias: false, autonomyBias: false };

  // A. PV Accuracy — compare actual installed kWp against annualReq (sizing basis).
  // Panel rounding naturally adds 0–15% margin; this is expected and NOT a deduction.
  // Deduct only when pvRatio is impossibly high (>2.0) — genuine oversizing bias.
  const pvRatio = actualPvKwp / annualReq;
  let pvStatus: 'OPTIMAL' | 'CONSERVATIVE' | 'OVERBUILT' | 'UNDERPOWERED' = 'OPTIMAL';

  if (pvRatio >= 0.95 && pvRatio <= 1.5) {
    // No deduction — optimal or conservative sizing (includes panel rounding margin)
    pvStatus = pvRatio <= 1.2 ? 'OPTIMAL' : 'CONSERVATIVE';
  } else if (pvRatio > 1.5 && pvRatio <= 2.0) {
    // Intentional oversizing — reduce score mildly, but not a hard failure
    qaScore -= 10;
    pvStatus = 'CONSERVATIVE';
    qaWarnings.push(`PV array is ${((pvRatio - 1) * 100).toFixed(0)}% over annual requirement — may be intentional for reliability.`);
  } else if (pvRatio > 2.0) {
    // Genuine oversizing bias
    qaScore -= 25;
    pvStatus = 'OVERBUILT';
    flags.pvBias = true;
    qaWarnings.push(`PV array is ${((pvRatio - 1) * 100).toFixed(0)}% over annual requirement — significant oversizing detected.`);
  } else {
    // pvRatio < 0.95 — underpowered (math issue or missing appliances)
    qaScore -= 20;
    pvStatus = 'UNDERPOWERED';
    qaWarnings.push('PV array appears underpowered for the stated load. Verify appliance list.');
  }

  // B. Battery Integrity — verify claimed autonomy matches calculated autonomy.
  // Deduct ONLY if there is a genuine math mismatch (> 15% discrepancy).
  // High autonomy from low night load is physically valid — do NOT penalize it.
  let batteryIntegrity: 'PASS' | 'BORDERLINE' | 'FAIL' = 'PASS';
  const theoreticalAutonomy = nightLoadKwh > 0
    ? (batteryKwh * LFP_DOD * RT_EFF) / (nightLoadKwh / 12)
    : 0;
  const autonomyDiff = Math.abs(autonomyHours - theoreticalAutonomy);
  const autonomyTolerance = Math.max(theoreticalAutonomy * 0.10, 0.5); // 10% or 30min

  if (autonomyDiff <= autonomyTolerance || theoreticalAutonomy === 0) {
    // Math checks out
    batteryIntegrity = 'PASS';
  } else if (autonomyDiff <= theoreticalAutonomy * 0.20) {
    // Small rounding discrepancy
    batteryIntegrity = 'BORDERLINE';
    qaScore -= 5;
  } else {
    // Genuine math error — claimed autonomy does not match battery sizing
    batteryIntegrity = 'FAIL';
    qaScore -= 20;
    flags.autonomyBias = true;
    qaWarnings.push(`Battery math contradiction: claimed ${autonomyHours.toFixed(1)}h autonomy does not match calculated ${theoreticalAutonomy.toFixed(1)}h from battery sizing.`);
  }

  // C. Savings Realism — claimed savings must not exceed physical displacement
  let savingsIntegrity: 'PASS' | 'INFLATED' | 'FAIL' = 'PASS';
  const totalClaimedSavings = monthlyGridSavingsExpected + monthlyGeneratorSavingsExpected;
  const theoreticalDisplacement = monthlyCurrentSpend * (coveragePct / 100);

  if (totalClaimedSavings <= theoreticalDisplacement * 1.05) {
    // Within 5% — rounding tolerance
    savingsIntegrity = 'PASS';
  } else if (totalClaimedSavings <= theoreticalDisplacement * 1.30) {
    // Mildly inflated
    savingsIntegrity = 'INFLATED';
    qaScore -= 10;
    qaWarnings.push('Savings estimate slightly above expected displacement — real-world variance expected.');
  } else {
    // Significantly inflated — math contradiction
    savingsIntegrity = 'FAIL';
    qaScore -= 25;
    flags.savingsBias = true;
    qaWarnings.push(`Claimed savings (${Math.round(totalClaimedSavings).toLocaleString()}₦) exceed physical displacement capacity (${Math.round(theoreticalDisplacement).toLocaleString()}₦).`);
  }

  // D. Hard contradiction checks — these are genuine physics failures, not oversizing
  // Deduct heavily for label vs physics contradictions
  if (pvClassification === 'OPTIMAL' && pvRatio > 1.5) {
    qaScore -= 15;
    qaWarnings.push("Label contradiction: PV classified 'OPTIMAL' but ratio exceeds 1.5× annual requirement.");
  }
  if (batterySufficiency === 'full' && nightCoverageRatio < 1.0) {
    qaScore -= 20;
    qaWarnings.push("Label contradiction: Battery labeled 'FULL' but cannot cover one night of load.");
  }
  // autonomyHours > 24 in a non-off-grid system with large battery claiming full backup
  // is a marketing flag — but if night load is genuinely low it's physically valid.
  // We only flag if battery is large (>15kWh) yet autonomyHours seems inflated vs off-grid claim.
  if (systemMode !== 'off-grid' && autonomyHours > 48 && !autonomyNote) {
    qaScore -= 10;
    qaWarnings.push(`Autonomy > 48h on a ${systemMode} system — verify night load calculation.`);
  }

  // Clamp score to [0, 100]
  qaScore = Math.max(0, Math.min(100, qaScore));

  let finalVerdict: 'Physics-Accurate' | 'Installer-Conservative' | 'Marketing-Biased' = 'Physics-Accurate';
  if (qaScore >= 85) finalVerdict = 'Physics-Accurate';
  else if (qaScore >= 60) finalVerdict = 'Installer-Conservative';
  else finalVerdict = 'Marketing-Biased';

  const truthQAReport = {
    score: qaScore,
    pvStatus,
    batteryIntegrity,
    savingsIntegrity,
    flags,
    finalVerdict,
    warnings: qaWarnings
  };

  return {
    isValid,
    validationError,
    peakLoadKw: peakSurgeKw,
    dailyLoadKwh,
    pvKwp: actualPvKwp,
    panelsNeeded,
    panelSizeWatts,
    panelTierLabel,
    inverterKva,
    batteryKwh,
    batteryType: batteryKwh > 0 ? 'lithium' : 'none',
    systemCostMin,
    systemCostMax,
    paybackMonths,
    fiveYearSavings,
    systemStatus: finalVerdict === 'Marketing-Biased' ? 'FAIL' : 'PASS',
    tenYearSavings,
    monthlyGridSavings,
    monthlyGeneratorSavings,
    batterySufficiency,
    energyOffsetPct: coveragePct,
    autonomyHours: Math.round(autonomyHours * 10) / 10,
    autonomyNote,
    monthlyCurrentSpend,
    afterSolarMonthlyCost,
    monthlyProduction: monthlyProductionArray,
    discoName: discoStr,
    discoTariff,
    selectedBand: inputs.lagosElectricityBand
      ? (inputs.lagosElectricityBand.replace('band_', '').toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E')
      : null,
    avgPSH,
    co2SavedKgPerYear,
    treesEquivalent,
    pvClassification,
    seasonalRisk,
    chargeController,
    daytimeAnalysis,
    truthQAReport,
  };
}

export function getInverterSize(kva: number): string {
  if (kva <= 1.5) return '1.5KVA';
  if (kva <= 2)   return '2KVA';
  if (kva <= 3)   return '3KVA';
  if (kva <= 5)   return '5KVA';
  if (kva <= 10)  return '10KVA';
  return '15KVA';
}

/** Format naira with commas */
export function fmt(n: number): string {
  return '₦' + Math.round(n).toLocaleString('en-NG');
}

/** Format naira in millions (e.g. ₦1.65M) */
export function fmtM(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
}