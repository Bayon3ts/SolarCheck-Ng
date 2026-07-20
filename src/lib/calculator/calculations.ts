/* ═══════════════════════════════════════════════════ */
/* SolarCheck Nigeria — Solar Calculation Engine       */
/* Market rates — Updated May 2026               */
/* ═══════════════════════════════════════════════════ */

import { supabase } from '@/lib/supabase/client';
import { CalculatorInputs, CalculatorResults } from './types';
import { MONTHLY_PSH, DEFAULT_MONTHLY_PSH } from './irradiance';
import { enforceTruth } from './truth-engine';

// ── Live fuel price (fetched from Supabase, falls back to constant) ────────
let _fuelPriceCache: number = 1350; // updated by getFuelPrice()

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

    const price = parseInt(settings['fuel_price_per_litre'] || '1350');
    const validPrice = price >= 500 && price <= 5000 ? price : 1350;

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
  // AC wattages: installer-verified field values, June 2026
  // Duty cycles: Nigerian ambient 30–35°C field averages
  //   Inverter AC: 0.70 (variable-speed compressor, cycles less aggressively)
  //   Standard AC: 0.85 (fixed-speed compressor, near-continuous in Nigerian heat)
  // Source: field installer review + IEC 62301 duty cycle methodology, June 2026
  {
    id: 'ac_1hp_inv',
    name: '1HP Air Conditioner (Inverter)',
    category: 'Cooling',
    icon: '❄️',
    kwhPerDay: 3.92,   // 700W × 8hrs × 0.70 ÷ 1000
    typicalHours: 8,
    isInverter: true,
    watts: 700,
    dutyCycle: 0.70,   // was 1.0 — inverter AC cycles ~70% in Nigerian ambient heat
  },
  {
    id: 'ac_1hp_std',
    name: '1HP Air Conditioner (Standard)',
    category: 'Cooling',
    icon: '❄️',
    kwhPerDay: 5.10,   // 750W × 8hrs × 0.85 ÷ 1000
    typicalHours: 8,
    isInverter: false,
    watts: 750,
    dutyCycle: 0.85,   // was 1.0 — standard AC runs ~85% in Nigerian ambient heat
  },
  {
    id: 'ac_1_5hp_inv',
    name: '1.5HP Air Conditioner (Inverter)',
    category: 'Cooling',
    icon: '❄️',
    kwhPerDay: 6.72,   // 1200W × 8hrs × 0.70 ÷ 1000
    typicalHours: 8,
    isInverter: true,
    watts: 1200,
    dutyCycle: 0.70,
  },
  {
    id: 'ac_1_5hp_std',
    name: '1.5HP Air Conditioner (Standard)',
    category: 'Cooling',
    icon: '❄️',
    kwhPerDay: 10.20,  // 1500W × 8hrs × 0.85 ÷ 1000
    typicalHours: 8,
    isInverter: false,
    watts: 1500,
    dutyCycle: 0.85,
  },
  {
    id: 'ac_2hp_inv',
    name: '2HP Air Conditioner (Inverter)',
    category: 'Cooling',
    icon: '❄️',
    kwhPerDay: 8.40,   // 1500W × 8hrs × 0.70 ÷ 1000
    typicalHours: 8,
    isInverter: true,
    watts: 1500,
    dutyCycle: 0.70,
  },
  {
    id: 'ac_2hp_std',
    name: '2HP Air Conditioner (Standard)',
    category: 'Cooling',
    icon: '❄️',
    kwhPerDay: 10.20,  // 1500W × 8hrs × 0.85 ÷ 1000
    typicalHours: 8,
    isInverter: false,
    watts: 1500,
    dutyCycle: 0.85,
  },
  // Ceiling fans: split into 3 sizes — installer-verified, June 2026
  {
    id: 'fan_ceiling',
    name: 'Ceiling Fan (30")',  // renamed from 'Ceiling Fan' — id kept for backward compat
    category: 'Cooling',
    icon: '🌀',
    kwhPerDay: 0.54,  // 45W × 12hrs ÷ 1000
    typicalHours: 12,
    isInverter: false,
    watts: 45,        // was 40W
    dutyCycle: 1,
  },
  {
    id: 'fan_ceiling_small',
    name: 'Ceiling Fan (24")',
    category: 'Cooling',
    icon: '🌀',
    kwhPerDay: 0.42,  // 35W × 12hrs ÷ 1000
    typicalHours: 12,
    isInverter: false,
    watts: 35,        // installer-verified June 2026
    dutyCycle: 1,
  },
  {
    id: 'fan_ceiling_large',
    name: 'Ceiling Fan (36")',
    category: 'Cooling',
    icon: '🌀',
    kwhPerDay: 0.66,  // 55W × 12hrs ÷ 1000
    typicalHours: 12,
    isInverter: false,
    watts: 55,        // installer-verified June 2026
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
  },

  // ═══ REFRIGERATION ═══
  {
    id: 'fridge_inv',
    name: 'Refrigerator (Inverter/DC)',
    category: 'Refrigeration',
    icon: '🧊',
    kwhPerDay: 1.10, // Tropical ambient (30–35°C indoor): real-world Lagos duty cycle
    typicalHours: 24,
    isInverter: true,
    watts: 90,
    dutyCycle: 1100 / (90 * 24),
  },
  {
    id: 'fridge_std',
    name: 'Refrigerator (Standard)',
    category: 'Refrigeration',
    icon: '🧊',
    kwhPerDay: 1.85, // Tropical ambient correction: compressor runs harder at 30–35°C
    typicalHours: 24,
    isInverter: false,
    watts: 180,
    note: 'Compressor cycles on/off',
    dutyCycle: 1850 / (180 * 24),
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
    dutyCycle: 0.42,
  },
  {
    id: 'freezer_chest',
    name: 'Chest Freezer (Standard)',
    category: 'Refrigeration',
    icon: '🧊',
    kwhPerDay: 2.10, // Tropical ambient correction: maintains -18°C in 32°C ambient
    typicalHours: 24,
    isInverter: false,
    watts: 150,
    dutyCycle: 2100 / (150 * 24),
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
    dutyCycle: 0.42,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1.04,
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
    dutyCycle: 1.03,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 3,
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
    dutyCycle: 0.98,
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
    dutyCycle: 0.89,
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
    dutyCycle: 1,
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
    dutyCycle: 0.46,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 0.5,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 0.94,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
    dutyCycle: 0.42,
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
    dutyCycle: 0.63,
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
    dutyCycle: 0.94,
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
    dutyCycle: 1,
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
    dutyCycle: 1,
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
  'EEDC': 52,
  'PHEDC': 55,
  'BEDC': 50,
  'AEDC': 62,
  'JEDC': 48,
  'KEDC': 45,
  'YEDC': 48,
  'KAEDCO': 43,
  'GEDC': 42,
  'KEDCO': 40,
};

export const PETROL_PRICE_PER_LITRE = 1350;  // ₦/L — update monthly

// ── IKEDC / EKEDC Band Tariffs (NERC ORDER/NERC/2025/050) ─────────────
export const IKEDC_BANDS = [
  { id: 'band_a', label: '20+ hours (Band A)', tariff: 209.50 },
  { id: 'band_b', label: '16–20 hours (Band B)', tariff: 62.48 },
  { id: 'band_c', label: '12–16 hours (Band C)', tariff: 45.80 },
  { id: 'band_d', label: '8–12 hours (Band D)', tariff: 31.24 },
  { id: 'band_e', label: 'Under 8 hours (Band E)', tariff: 31.24 },
  { id: 'none', label: 'Almost no supply', tariff: 31.24 },
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
  /** Three-tier load profile label driven by nightLoadRatio thresholds */
  loadProfileLabel?: string
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
  actualBatteryKwh: number, // <--- New parameter
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
  const nightLoadRatioAnalysis = totalKwh > 0 ? nighttimeKwh / totalKwh : 0

  // ── THREE-TIER LOAD PROFILE CLASSIFICATION ───────────────────────────────
  // Replaces binary isDaytimeHeavy (>=0.65) with explicit ratio-bucket labels.
  // Using 0.3001 upper bound on second tier guards against JS 0.1+0.2 float drift.
  let loadProfileLabel: string
  if (nightLoadRatioAnalysis <= 0.10) {
    loadProfileLabel = 'Day-Dominant Load Profile'
  } else if (nightLoadRatioAnalysis > 0.10 && nightLoadRatioAnalysis <= 0.3001) {
    loadProfileLabel = 'Mixed Day/Night Load Profile'
  } else {
    loadProfileLabel = 'Night-Heavy Load Profile'
  }

  // Backward-compat boolean: true for Day-Dominant OR Mixed (night ≤30%)
  const isDaytimeHeavy = nightLoadRatioAnalysis <= 0.30

  const daytimeLoadKw = daytimeKwh / 8
  const recommendedPanelKw = totalPanelWatts / 1000;

  // Bind the dynamic engineering text block explicitly to the final validated state variable
  // instead of computing a disjoint battery floor.
  const recommendedNightBatteryKwh = actualBatteryKwh;

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
    recommendedInverterNote = `Your panel array (${(panelWatts / 1000).toFixed(1)}kW) exceeds what a single MPPT input can handle (${(singleMpptMaxW / 1000).toFixed(1)}kW). You need an inverter with ${mpptInputsNeeded} MPPT inputs — such as the Deye SUN-8K (2 MPPT, 10.4kW PV) or Growatt MIN 6000 (2 MPPT, 8kW PV). Panels split: ${panelStringSplit}.`
  } else if (isDaytimeHeavy) {
    recommendedInverterNote = `Your load is mostly daytime — a standard hybrid inverter with 1 MPPT input handles your ${(panelWatts / 1000).toFixed(1)}kW array. The small battery bank (${recommendedNightBatteryKwh}kWh) covers your nighttime essentials only.`
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
    loadProfileLabel,
  }
}

export function getApplianceKwh(appDef: typeof APPLIANCES[0], dayHrs: number, nightHrs: number): number {
  return ((appDef.watts * (dayHrs + nightHrs) * (appDef.dutyCycle || 1)) / 1000);
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
  let dailyLoadKwh = 0;
  let nightLoadKwh = 0;
  let peakSurgeKw = 0;
  let dayActiveKw = 0;
  let nightActiveKw = 0;
  let simultaneousLoadKw = 0; // for inverter sizing
  let hasAC = false;
  let hasWaterPump = false;

  // ── DYNAMIC SIMULTANEITY FACTORS ──────────────────────────────────────────
  let totalACKw = 0;
  let totalFridgeKw = 0;
  let totalLightingKw = 0;
  let totalTVKw = 0;
  let totalGeneralKw = 0;
  let numAcUnits = 0;

  // Track pure motor loads for the surge checks
  let acMotorKw = 0;
  let fridgeMotorKw = 0;
  let pumpMotorKw = 0;

  let singleLargestActiveKw = 0;    // safety floor — biggest individual appliance running
  let baseLightingLoadsKw = 0;      // safety floor addition

  if (appliances.length > 0) {
    appliances.forEach(appSelection => {
      const appDef = APPLIANCES.find(a => a.id === appSelection.id);
      if (!appDef) return;

      const qty = appSelection.qty;
      if (qty <= 0) return;

      const totalUserHours = (appSelection as any).daytimeHours
        ?? (appSelection as any).dayHours
        ?? Math.min(appDef.typicalHours || 0, 24);

      // Split total hours across day (6am–6pm = 12hr window) and night (6pm–6am = 12hr).
      // Rule: fill the daytime window first, overflow goes to night.
      // Examples:
      //   8hr total  → dayHrs=8,  nightHrs=0  (fits in daytime)
      //   14hr total → dayHrs=12, nightHrs=2  (2hr overflow into night)
      //   18hr total → dayHrs=12, nightHrs=6
      //   24hr total → dayHrs=12, nightHrs=12 (full day + full night, e.g. fridge)
      const DAY_WINDOW = 12; // 6am–6pm
      const dayHrs = Math.min(totalUserHours, DAY_WINDOW);
      const nightHrs = Math.max(0, totalUserHours - DAY_WINDOW);
      console.log('APP CALC', appDef.id, { qty, dayHrs, nightHrs }, 'DAY KWH', getApplianceKwh(appDef, dayHrs, 0) * qty);

      // ── FIX 2: Strict Night Load separation ────────────────────────────────
      // We no longer rely on typicalHours static split. 
      // If daytime load exists, it calculates exactly. If night, exactly night.

      const climateFactor = appDef.category === 'Refrigeration' ? 1.0 : 1.0;

      const appDayKwh = getApplianceKwh(appDef, dayHrs, 0) * qty * climateFactor;
      dailyLoadKwh += appDayKwh;

      const nightKwh = getApplianceKwh(appDef, 0, nightHrs) * qty * climateFactor;
      nightLoadKwh += nightKwh;
      dailyLoadKwh += nightKwh; // Day+Night = Total daily load

      const continuousKw = (appDef.watts * qty) / 1000;

      // ── PEAK LOAD (MAX OVERLAP DAY VS NIGHT) ─────────────────────────────
      // Replaces flat-sum simultaneous load logic with realistic day/night partitioning
      if (dayHrs > 0) dayActiveKw += continuousKw;
      if (nightHrs > 0) nightActiveKw += continuousKw;

      // ── #12 SURGE FACTORS — Per installer-grade spec ──────────────────────
      const isFan = appDef.id.startsWith('fan_');
      const isAC = appDef.id.startsWith('ac_');
      const isWaterPump = appDef.id.startsWith('borehole_');
      const isFridge = appDef.category === 'Refrigeration';

      // Only count an appliance as active if it is actually running (hours > 0).
      // An appliance added at qty > 0 but set to 0 hours is "installed but off" —
      // it must not trigger the 5 kVA floor or inflate peak surge.
      const isActuallyRunning = (dayHrs + nightHrs) > 0;

      if (isAC && isActuallyRunning) hasAC = true;
      if (isWaterPump && isActuallyRunning) hasWaterPump = true;

      // ── SIMULTANEITY FACTOR BUCKETS ───────────────────────────────
      if (isActuallyRunning) {
        if (isAC) {
          totalACKw += continuousKw;
          numAcUnits += qty;
          acMotorKw += continuousKw;
        } else if (isWaterPump || appDef.category === 'Laundry') {
          totalGeneralKw += continuousKw;
          pumpMotorKw += continuousKw;
        } else if (isFridge) {
          totalFridgeKw += continuousKw;
          fridgeMotorKw += continuousKw;
        } else if (appDef.category === 'Lighting') {
          totalLightingKw += continuousKw;
        } else if (appDef.category === 'Entertainment') {
          totalTVKw += continuousKw;
        } else {
          totalGeneralKw += continuousKw;
        }
      }

      if (appDef.category === 'Lighting') {
        baseLightingLoadsKw += continuousKw;
      }

      // Track largest single appliance for safety floor
      if (continuousKw > singleLargestActiveKw) {
        singleLargestActiveKw = continuousKw;
      }

      let surgeMult = 1.0;
      if (isFan) {
        surgeMult = 1.2;                          // small inrush only
      } else if (isWaterPump) {
        surgeMult = 5.0;                          // 4–6× per spec — use 5× (mid)
      } else if (isAC) {
        surgeMult = appDef.isInverter ? 2.0 : 3.5; // inverter AC: 2×; standard: 3.5×
      } else if (isFridge) {
        surgeMult = appDef.isInverter ? 1.5 : 3.0; // DC fridge: 1.5×; compressor: 3×
      } else if (appDef.category === 'Laundry') {
        surgeMult = 2.0;                          // washing machine motor startup
      }
      if (isActuallyRunning) {
        peakSurgeKw += continuousKw * surgeMult;
      }
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
    peakSurgeKw = dailyLoadKwh * 0.2;  // rough estimate
    simultaneousLoadKw = dailyLoadKwh * 0.15;
  }

  // ── CALCULATE PEAK LOAD ──────────────────

  if (appliances.length > 0) {
    const acFactor = numAcUnits >= 2 ? 0.9 : 0.75;
    simultaneousLoadKw =
      (totalACKw * acFactor) +
      (totalFridgeKw * 0.6) +
      (totalLightingKw * 0.7) +
      (totalTVKw * 0.6) +
      (totalGeneralKw * 0.5);
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

  // SINGLE-PASS EFFICIENCY — applied ONCE only, never stacked
  // RULE: efficiency is applied ONCE in usablePvKwhFn(). DO NOT re-apply
  // for battery charging, rainy checks, inverter sizing, or coverage labels.
  //
  // Component breakdown (IEC 61724 / PVsyst):
  const panelLosses = 0.90; // temperature + dust
  const inverterEff = 0.96; // MPPT hybrid conversion
  const batteryRoundtrip = (inputs.systemMode !== 'grid-tied') ? 0.90 : 1.00; // LFP
  const wiringLosses = 0.97; // DC ohmic + junction losses
  // Spatial factors from roof geometry (orientation, pitch, shade):
  const spatialFactor = directionFactor * pitchFactor * shadeFactor;
  // Combine WITHOUT batteryRoundtrip — round-trip is a per-cycle electrochemical
  // loss inside the battery cell; it does NOT reduce PV generation capacity:
  const rawEfficiency = panelLosses * inverterEff * wiringLosses * spatialFactor;
  // Clamp to [0.75, 0.80] — Nigeria PR field data (IEC 61724 West Africa):
  const SYSTEM_EFF = Math.min(0.80, Math.max(0.75, rawEfficiency));
  const systemEfficiency = SYSTEM_EFF;  // legacy alias used by PV sizing formulas
  const totalEfficiency = SYSTEM_EFF;  // alias for efficiencyBreakdown object

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
  const rainyReq = targetDailyGenerationKwh / (rainyMinPSH * systemEfficiency);

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
  } else if (pvKwpRaw >= 1.5 && pvKwpRaw < 3.5) {
    panelSizeWatts = 450;
    panelTierLabel = 'Small-Medium (1.5–3.5 kWp range)';
  } else if (pvKwpRaw >= 3.5 && pvKwpRaw <= 6.0) {
    panelSizeWatts = 550;
    panelTierLabel = 'Standard Residential (3.5–6 kWp range)';
  } else if (pvKwpRaw > 6.0 && pvKwpRaw < 12.0) {
    panelSizeWatts = 650;
    panelTierLabel = 'Large Home / Business (6–12 kWp range)';
  } else {
    panelSizeWatts = 700;
    panelTierLabel = 'Commercial Scale (> 12 kWp range)';
  }

  // ── FIX: EVEN PANEL COUNT CONSTRAINT ──────────────────────────────────────────────
  // Standard hybrid inverters require balanced PV strings (e.g., 2S2P, 2S3P).
  // Total panel count must ALWAYS be an even number.
  let panelsNeeded = Math.ceil((pvKwpRaw * 1000) / panelSizeWatts);

  if (panelsNeeded % 2 !== 0) {
    // Test if rounding DOWN still meets the requested daily generation
    const capacityIfRoundedDown = ((panelsNeeded - 1) * panelSizeWatts) / 1000;
    const generationIfRoundedDown = capacityIfRoundedDown * avgPSH * systemEfficiency;

    // Round DOWN if it's already significantly over-generating (or within a tiny 2% tolerance)
    // Otherwise, round UP to ensure strict 100% target coverage is met safely.
    if (panelsNeeded > 1 && generationIfRoundedDown >= targetDailyGenerationKwh * 0.98) {
      panelsNeeded -= 1;
    } else {
      panelsNeeded += 1;
    }
  }

  let actualPvKwp = (panelsNeeded * panelSizeWatts) / 1000;

  // ── PEAK LOAD REALISM ──
  const PEAK_HOUR_MULTIPLIER = 1.3;
  const realPeakLoadKw = simultaneousLoadKw * PEAK_HOUR_MULTIPLIER;

  // ── FIX 6: INVERTER SIZING — load-based, not PV-based ────────────────────
  const peakLoadWatts = realPeakLoadKw * 1000;

  // Appliance-specific motor surge
  const surgeLoadWatts = (acMotorKw * 1000 * 1.5) + (fridgeMotorKw * 1000 * 2.5) + (pumpMotorKw * 1000 * 3.5);

  const POWER_FACTOR_NG = 0.8; // Nigerian standard

  // Inverters are rated in kVA (apparent power), not kW (real power).
  const targetCapacity = Math.max(peakLoadWatts * 1.25, surgeLoadWatts) / POWER_FACTOR_NG;

  // ── INVERTER STANDARD SIZE LADDER — full Nigerian market range ───────────────
  // Sizes: 1 → 1.5 → 2 → 3 → 5 → 8 → 10 → 12 → 15 → 20 → 30 kVA
  // Source: Luminous, Felicity, Mercury, Deye, Growatt Nigerian market ranges.
  // Previously started at 3kVA min — small loads (lights/phone/router) were
  // massively oversized. Fixed June 2026.
  // ── INVERTER STANDARD SIZE LADDER — exact Nigerian market sizes only ─────────
  // These are the ONLY sizes actually sold in the Nigerian market. Using any
  // other value (e.g. 8kVA, 25kVA) means recommending hardware that doesn't
  // exist for sale, forcing installers to round up anyway.
  // Source: installer-confirmed available stock, June 2026.
  const INVERTER_SIZES = [1, 1.5, 2, 3, 3.5, 4, 4.2, 5, 6.2, 7.5, 10, 12, 15, 20];

  function roundToStandardInverter(kva: number): number {
    for (const size of INVERTER_SIZES) {
      if (kva <= size) return size;
    }
    return INVERTER_SIZES[INVERTER_SIZES.length - 1];
  }

  let recommendedInverterKva: number = roundToStandardInverter(targetCapacity / 1000);

  // ── UPGRADE BLOCK A: Mode-Aware Inverter Hardware Floor ───────────────────────────────
  // optimizationMode is read here — AFTER the appliance loop has fully populated
  // hasAC, dayActiveKw, and nightActiveKw, so there is no stale-read risk.
  //
  // maximum_protection (default):
  //   AC or water pump present → hard 5 kVA floor (handles inductive startup surges).
  //   No AC/pump: proportionate floor based on total connected load.
  //
  // budget_conscious:
  //   If an AC is present BUT total nameplate connected load is below 2 200 W,
  //   the installer can step down to a 3 kVA / 24V class inverter.
  //   The UI MUST display a Load Management Alert Banner when budgetModeActive = true.
  //   Gate: totalConnectedLoadW < 2200W — if the user also selected a microwave (1000W)
  //   or kettle (1500W) alongside the AC, the total will exceed 2200W and the 5 kVA
  //   floor re-engages automatically, ensuring no unsafe step-down occurs.
  const optimizationMode = inputs.optimizationMode ?? 'maximum_protection';

  // Nameplate connected load: sum of all rated watts that are switched on
  // (day-active + night-active nameplate, before duty-cycle reduction).
  // dayActiveKw / nightActiveKw are accumulated in the appliance loop above.
  const totalConnectedLoadW = (dayActiveKw + nightActiveKw) * 1000;

  let minInverterKva: number;
  if (
    optimizationMode === 'budget_conscious' &&
    hasAC &&
    totalConnectedLoadW < 2200
  ) {
    // Budget step-down: 3 kVA / 24V class permitted — load-management banner required
    minInverterKva = 3;
  } else if (hasAC) {
    // AC startup surge: hard 5 kVA floor regardless of total load
    minInverterKva = 5;
  } else if (hasWaterPump) {
    // Borehole pump surge: hard 5 kVA floor
    minInverterKva = 5;
  } else if (totalConnectedLoadW > 1500) {
    // Mixed loads above 1.5kW nameplate → 3kVA floor for headroom
    minInverterKva = 3;
  } else if (totalConnectedLoadW > 800) {
    // Medium loads 800W–1500W → 2kVA floor
    minInverterKva = 2;
  } else if (totalConnectedLoadW > 400) {
    // Light loads 400W–800W → 1.5kVA floor
    minInverterKva = 1.5;
  } else {
    // Ultra-light loads under 400W → 1kVA sufficient
    minInverterKva = 1;
  }

  let inverterKva = Math.max(recommendedInverterKva, minInverterKva);

  // Freeze load-based inverter kVA BEFORE any PV-driven upgrade.
  // Battery bus minimum must use this value — not the PV-upgraded kVA —
  // otherwise daytime-dominant users with large PV arrays get massively oversized batteries.
  // Rule: night usage drives battery size, not inverter kVA. (Field audit June 2026)
  const loadBasedInverterKva = inverterKva;

  // budgetModeActive: true only when the relaxation actually changed the outcome
  // (i.e., the mode is budget_conscious AND the floor would otherwise have been 5 kVA
  //  AND the final inverterKva is indeed below 5).
  const budgetModeActive: boolean =
    optimizationMode === 'budget_conscious' &&
    hasAC &&
    totalConnectedLoadW < 2200 &&
    inverterKva < 5;

  // Re-declare variables for the downstream QA layers
  const requiredInverterKva = Math.max(targetCapacity / 1000, minInverterKva);

  // ========================================================
  // FIX: Inverter PV Input Cap (DC:AC Ratio Clamp)
  // ========================================================
  // Rule: LOAD drives inverter size. SOLAR fills the inverter's input capacity.
  // If solar needs exceed what the load-based inverter can accept, prefer clipping
  // panels over upgrading the inverter for typical residential loads — upgrading
  // the inverter just because panels are large forces users to overpay for AC
  // capacity they don't actually need.
  //
  // DC:AC ratio = 1.5 — most Nigerian market hybrid inverters (Deye, Growatt,
  // Felicity, Victron) accept 130–150% DC oversizing. A 5kVA inverter can accept
  // up to 7.5kWp before any upgrade is considered.

  const DC_AC_RATIO = 1.5;
  let maxAllowedPvKwp = inverterKva * DC_AC_RATIO;

  if (actualPvKwp > maxAllowedPvKwp) {
    const clippingPct = (actualPvKwp - maxAllowedPvKwp) / actualPvKwp;

    // Only upgrade the inverter if clipping would waste >28% of array output.
    // Below that threshold, clip panels instead — cheaper and still effective.
    if (clippingPct > 0.28) {
      const pvRequiredInverterKva = actualPvKwp / DC_AC_RATIO;
      const upgradedInverterKva = roundToStandardInverter(pvRequiredInverterKva);

      if (upgradedInverterKva > inverterKva) {
        inverterKva = upgradedInverterKva;
        maxAllowedPvKwp = inverterKva * DC_AC_RATIO;
      }
    }

    // Clip panels to fit whichever inverter capacity we ended up with
    if (actualPvKwp > maxAllowedPvKwp) {
      actualPvKwp = maxAllowedPvKwp;
      const rawPanelCount = (actualPvKwp * 1000) / panelSizeWatts;
      panelsNeeded = Math.floor(rawPanelCount / 2) * 2;
      panelsNeeded = Math.max(panelsNeeded, 2); // never below 2 panels
      actualPvKwp = (panelsNeeded * panelSizeWatts) / 1000;
    }
  }

  // ── UPGRADE BLOCK B: Roof Footprint Spatial Guardrail ───────────────────────────────────
  // Computed AFTER the DC:AC ratio clamp above — panelsNeeded and panelSizeWatts
  // are fully finalised at this point, eliminating any stale-value risk.
  //
  // Physical panel surface area lookup (IEC 61215 standard module footprints):
  //   ≥ 600 W panels (e.g. 650 W half-cut mono): 2.64 m² (approx. 2200 × 1200 mm)
  //   < 600 W panels (e.g. 550 W):               2.22 m² (approx. 2100 × 1050 mm)
  //
  // The 1.25 multiplier adds a mandatory 25% buffer accounting for:
  //   • Structural racking rail spacing (min. 200 mm inter-row gap)
  //   • Wind-load clearance (IEC 61215 mounting spec)
  //   • Installer access paths between panel rows
  // Without this buffer, the metric would imply edge-to-edge panel placement
  // which is physically impossible and violates roof-load safety codes.
  const panelSurfaceAreaSqM: number = panelSizeWatts >= 600 ? 2.64 : 2.22;
  const totalRequiredAreaSqM: number = Math.ceil(
    panelsNeeded * panelSurfaceAreaSqM * 1.25
  );

  // ── BATTERY SIZING — spec-accurate LFP constants ─────────────────────────
  // ENGINEERING NOTE:
  //   LFP_DOD  = 0.80  (Lithium Iron Phosphate: 80% depth of discharge)
  //   RT_EFF   = 0.92  (Round-trip efficiency: inverter + wiring losses)
  //   requiredUsable = nightLoadKwh × autonomyDays  (hybrid)
  //   requiredUsable = dailyLoadKwh × autonomyDays  (off-grid)
  //   batteryKwh = requiredUsable / LFP_DOD   ← RT_EFF intentionally excluded:
  //     RT_EFF is a per-cycle thermodynamic loss; it belongs in the solar
  //     production chain (systemEfficiency), NOT in nameplate battery sizing.
  //     Including it double-counts losses and forces clients to buy ~13%
  //     more physical battery modules than engineering spec requires.
  // usableBattery = batteryKwh × LFP_DOD  (same formula — no RT_EFF).
  const LFP_DOD = 0.80;
  const RT_EFF = 0.92;
  const BATT_MIN = 2.56; // kWh minimum — smallest standard pack

  // ── BATTERY STANDARD SIZE LADDER — exact Nigerian market pack sizes only ──
  // These are the ONLY battery bank sizes actually available for sale.
  // Every prior increment scheme (1.2kWh, 4.8kWh) produced sizes that don't
  // match real inventory. Fixed June 2026 per installer-confirmed stock list.
  const BATTERY_SIZES = [2.56, 5.12, 10.24, 15.36, 20.48, 25.6, 30.72];

  function roundToStandardBattery(kwh: number): number {
    for (const size of BATTERY_SIZES) {
      if (kwh <= size) return size;
    }
    // Beyond the largest single-bank size, snap to the nearest 5.12kWh
    // increment above the largest standard size (parallel banks).
    const largest = BATTERY_SIZES[BATTERY_SIZES.length - 1];
    const increment = 5.12;
    return largest + Math.ceil((kwh - largest) / increment) * increment;
  }

  let requiredUsableKwh = 0;
  let batterySufficiency: 'INSUFFICIENT ⚠️' | 'TIGHT ⚠️' | 'ADEQUATE ✅' | 'MINIMAL STORAGE (day-use focused)' = 'ADEQUATE ✅';

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

  // batteryKwh = requiredUsable / LFP_DOD  (RT_EFF excluded — see note above)
  let batteryKwh = requiredUsableKwh > 0
    ? requiredUsableKwh / LFP_DOD
    : 0;

  if (systemMode !== 'grid-tied') {
    if (batteryKwh > 0) {
      // Snap to the nearest standard pack size at or above what's needed.
      // No more silent under-tolerance snap-down — every standard size step
      // is small enough (2.56→5.12 is 2x, but 5.12→10.24→15.36... is finer
      // further up) that rounding up to the next real size is always correct.
      batteryKwh = roundToStandardBattery(batteryKwh);
    }

    // Engineering minimum floors — take the largest of three constraints:
    //   1. Hardware minimum: any hybrid/off-grid system needs a physical bank to operate.
    //   2. Night-load minimum: battery MUST cover the FULL requested autonomy window
    //      (nightLoadKwh × autonomyDays), not just a single night.
    //   3. Inverter AC-to-DC bus alignment: large inverters need large batteries to prevent sag.
    const nightLoadMinBattery = nightLoadKwh > 0
      ? (nightLoadKwh * autonomyDays) / LFP_DOD
      : 0;
    const hardwareMin = hasAC || hasWaterPump ? 5.12 : BATT_MIN;

    // Inverter bus minimum — scaled to inverter size using the same standard
    // battery ladder, not a flat increment. Only applies meaningful floors
    // when there is significant night load.
    // CRITICAL: night usage drives battery, not inverter size.
    const hasSignificantNightLoad = nightLoadKwh > 2.0;
    let inverterBusMin: number;
    if (!hasSignificantNightLoad) {
      // Daytime-dominant: minimal bus floor — don't over-battery
      inverterBusMin = loadBasedInverterKva >= 5 ? 2.56 : 2.56;
    } else if (loadBasedInverterKva >= 10) {
      inverterBusMin = 15.36; // 10kVA+ overnight
    } else if (loadBasedInverterKva >= 8) {
      inverterBusMin = 10.24; // 8kVA overnight
    } else if (loadBasedInverterKva >= 5) {
      inverterBusMin = 5.12;  // 5kVA overnight
    } else if (loadBasedInverterKva >= 3) {
      inverterBusMin = 2.56;  // 3kVA
    } else {
      inverterBusMin = 2.56;  // 1–2kVA minimum
    }

    let minBattery = Math.max(hardwareMin, nightLoadMinBattery, inverterBusMin);

    // Snap the floor itself to the standard ladder
    minBattery = roundToStandardBattery(minBattery);

    batteryKwh = Math.max(batteryKwh, minBattery);

    // Final snap — batteryKwh may have grown past its own rounded value
    // via Math.max against minBattery, so round once more to stay on-ladder.
    batteryKwh = roundToStandardBattery(batteryKwh);

    batteryKwh = Math.round(batteryKwh * 100) / 100;
  }

  // Usable battery capacity — LFP_DOD only (RT_EFF excluded per spec, see note above)
  const usableBattery = batteryKwh * LFP_DOD;

  // Fragile battery warning: only meaningful when there IS a real night load
  // that the battery struggles to cover. Zero/near-zero night load means the
  // battery is correctly sized for daytime-only use — not a warning scenario.
  // Fragile battery warning: only fire when the battery has genuinely thin margin
  // (ratio < 1.3), not just because night load happens to be small. A 0.9kWh
  // night load against a 4.8kWh battery (4x+ margin) is NOT fragile — it has
  // huge headroom. Previously fired on night load range alone, contradicting
  // a "Full night covered" badge shown right above it.
  const isFragileBatteryWarning = nightLoadKwh > 0.5 && usableBattery > 0
    && (usableBattery / nightLoadKwh) < 1.3;

  // Autonomy hours — capped to prevent nonsensical values from tiny night loads
  // e.g. 0.2 kWh night load + 4.8 kWh battery (AC floor) → uncapped = 288h (impossible)
  // Hard engineering ceilings:
  //   Hybrid:   12h × autonomyDays  (exact design window — 1 night = 12h, 2 nights = 24h)
  //   Off-grid: 48h absolute maximum (2-day design limit for display)
  let autonomyHours = 0;
  let hasClampedAutonomyNote = false;
  let hasMultiNightNote = false;
  const absoluteMaxCeiling = systemMode === 'off-grid' ? 48.0 : 12.0 * autonomyDays;
  if (batteryKwh > 0 && nightLoadKwh > 0) {
    // Autonomy in hours: usable kWh ÷ (night load kW, averaged over 12h window)
    autonomyHours = usableBattery / (nightLoadKwh / 12);
    if (autonomyHours > 16 && nightLoadKwh < 1.5) {
      hasMultiNightNote = true;
    } else if (autonomyHours > absoluteMaxCeiling) {
      autonomyHours = absoluteMaxCeiling;
      hasClampedAutonomyNote = true;
    }
  } else if (batteryKwh > 0 && dailyLoadKwh > 0) {
    autonomyHours = usableBattery / (dailyLoadKwh / 24);
    if (autonomyHours > 16 && nightLoadKwh < 1.5) {
      hasMultiNightNote = true;
    } else if (autonomyHours > absoluteMaxCeiling) {
      autonomyHours = absoluteMaxCeiling;
      hasClampedAutonomyNote = true;
    }
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
    batterySufficiency = 'INSUFFICIENT ⚠️';
  } else if (usableBattery < nightLoadKwh * 0.6) {
    batterySufficiency = 'MINIMAL STORAGE (day-use focused)';
  } else if (usableBattery < nightLoadKwh) {
    batterySufficiency = 'INSUFFICIENT ⚠️';
  } else if (usableBattery < nightLoadKwh * 1.2) {
    batterySufficiency = 'TIGHT ⚠️';
  } else {
    batterySufficiency = 'ADEQUATE ✅';
  }

  // Autonomy note — two cases:
  //   1. Clamped: battery overshoots design window (tiny load + large floored bank)
  //   2. Naturally high: low night load creates mathematically valid multi-night coverage
  let autonomyNote: string | undefined;
  if (hasMultiNightNote) {
    autonomyNote = "Multi-night reserve capability active (Covers up to ~3+ nights of your low nighttime essentials).";
  } else if (hasClampedAutonomyNote) {
    const windowLabel = systemMode === 'off-grid'
      ? '2-day (48h)'
      : `${autonomyDays === 0.5 ? 'half-night' : autonomyDays === 1 ? '1-night' : '2-night'}`;
    autonomyNote = `Battery capacity exceeds your ${windowLabel} autonomy design window. Shown at the ${absoluteMaxCeiling.toFixed(0)}h ceiling — your actual reserve is larger than your typical load requires.`;
  } else if (autonomyHours > 24 && systemMode !== 'off-grid') {
    const avgNightWatts = Math.round(nightLoadKw * 1000);
    autonomyNote = `${autonomyHours.toFixed(1)} hours of autonomy reflects your low nightly load (~${avgNightWatts}W average, ${nightLoadKwh.toFixed(2)} kWh/night). This is not a full-day backup claim — the battery covers your night load for multiple nights precisely because your night consumption is small.`;
  }



  // PV classification against true coverage
  let pvClassification: 'UNDER SIZED' | 'WELL SIZED' | 'OPTIMAL' | 'OVER SIZED' | 'OVER SIZED (DAYTIME)' = 'WELL SIZED';
  const pvCoverage = dailyLoadKwh > 0 ? (actualPvKwp * avgPSH * systemEfficiency) / dailyLoadKwh : 1;
  const isMinimumPanelCount = panelsNeeded <= 2; // Physical minimum — suppress oversized label

  if (pvCoverage < 0.9) {
    pvClassification = 'UNDER SIZED';
  } else if (pvCoverage <= 1.15) {
    pvClassification = 'WELL SIZED';
  } else if (pvCoverage <= 1.35) {
    // 15–35% over minimum — healthy degradation buffer, not genuinely oversized
    pvClassification = isMinimumPanelCount ? 'WELL SIZED' : 'OPTIMAL';
  } else if (pvCoverage > 1.5 && batteryKwh === 0) {
    pvClassification = isMinimumPanelCount ? 'WELL SIZED' : 'OVER SIZED (DAYTIME)';
  } else {
    pvClassification = isMinimumPanelCount ? 'WELL SIZED' : 'OVER SIZED';
  }

  // ── UPGRADE BLOCK C: Appliance Remediation & Recommendation Engine ──────────────────
  // Fires ONLY when pvClassification === 'UNDER SIZED' so the output is never
  // deadlocked on a cold error — it pivots to active, consultative remediation.
  //
  // The STD_TO_INV_MAP keys off exact APPLIANCES.id strings (verified against the
  // constant at lines 68–682). Each pair carries the published kWh/day values
  // from the APPLIANCES data so the savings delta is data-consistent, not hardcoded.
  //
  // Execution dependency: pvClassification is locked above; inputs.appliances is
  // an immutable input reference — no mutation risk.
  const efficiencyRecommendations: string[] = [];

  if (pvClassification === 'UNDER SIZED') {
    // Standard-to-Inverter AC substitution map
    // stdKwh / invKwh sourced directly from APPLIANCES constant (lines 86–35)
    const STD_TO_INV_MAP: Array<{
      stdId: string;
      invId: string;
      stdKwh: number;
      invKwh: number;
      label: string;
    }> = [
        { stdId: 'ac_1hp_std', invId: 'ac_1hp_inv', stdKwh: 5.10, invKwh: 3.92, label: '1HP' },
        { stdId: 'ac_1_5hp_std', invId: 'ac_1_5hp_inv', stdKwh: 10.20, invKwh: 6.72, label: '1.5HP' },
        { stdId: 'ac_2hp_std', invId: 'ac_2hp_inv', stdKwh: 10.20, invKwh: 8.40, label: '2HP' },
        // kWh values updated June 2026 — duty-cycle corrected (inverter 0.70, standard 0.85)
      ];

    for (const pair of STD_TO_INV_MAP) {
      const sel = inputs.appliances.find(
        (a) => a.id === pair.stdId && a.qty > 0
      );
      if (sel) {
        // Per-unit daily kWh delta × quantity = total household saving
        const savingsDeltaKwh = (pair.stdKwh - pair.invKwh) * sel.qty;
        efficiencyRecommendations.push(
          `Optimization Tip: Swapping your ${sel.qty}× ${pair.label} Standard AC for an ` +
          `Inverter AC will drop your daily energy demand by ${savingsDeltaKwh.toFixed(1)} kWh, ` +
          `bringing your system configuration to 100% Optimal Coverage without hardware upsells.`
        );
      }
    }
  }

  // #16 RAINY SEASON — 1.15× safety margin required
  // Classification: ratio = worst_month_output / daily_load
  //   >=1.25 → safe  |  1.15–1.25 → borderline  |  <1.15 → at-risk
  let seasonalRisk: 'Rainy season stable' | 'Rainy season borderline' | 'Rainy season at risk';
  const rainyProduction = actualPvKwp * rainyMinPSH * systemEfficiency;
  const rainyToLoadRatio = targetDailyGenerationKwh > 0 ? rainyProduction / targetDailyGenerationKwh : 0;
  if (rainyToLoadRatio >= 1.25) seasonalRisk = 'Rainy season stable';
  else if (rainyToLoadRatio >= 1.15) seasonalRisk = 'Rainy season borderline';
  else seasonalRisk = 'Rainy season at risk';

  // STEP 6 — COST & SAVINGS (Itemized Nigerian Retail Pricing)
  // All prices: Lagos retail market, June 2026. Source: installer field review.
  // Min = budget/local brands. Max = premium/tier-1 brands (Jinko, Victron, Deye).
  // Always get 3 competing quotes — prices vary ±20% by vendor and location.

  // ── PANEL COST (per unit, by wattage tier) ────────────────────────────────
  // 400W: ₦80k–₦110k | 450W: ₦90k–₦120k | 550W: ₦110k–₦140k
  // 650W: ₦140k–₦170k | 700W: ₦150k–₦180k
  const panelUnitCostMin =
    panelSizeWatts <= 400 ? 80000
      : panelSizeWatts <= 450 ? 90000
        : panelSizeWatts <= 550 ? 110000
          : panelSizeWatts <= 650 ? 140000
            : 150000;
  const panelUnitCostMax =
    panelSizeWatts <= 400 ? 110000
      : panelSizeWatts <= 450 ? 120000
        : panelSizeWatts <= 550 ? 140000
          : panelSizeWatts <= 650 ? 170000
            : 180000;
  const totalPanelCostMin = panelsNeeded * panelUnitCostMin;
  const totalPanelCostMax = panelsNeeded * panelUnitCostMax;

  // ── INVERTER COST (by kVA tier) ───────────────────────────────────────────
  // Nigerian market hybrid inverter pricing (Felicity, Growatt, Deye, Victron)
  // 1kVA: ₦80k–₦120k | 1.5kVA: ₦95k–₦140k | 2kVA: ₦120k–₦165k
  // 3kVA: ₦165k–₦230k | 5kVA: ₦280k–₦380k | 8kVA: ₦450k–₦600k
  // 10kVA: ₦600k–₦800k | 12kVA+: ₦800k–₦1.2M
  const inverterCostMin =
    inverterKva <= 1 ? 80000
      : inverterKva <= 1.5 ? 95000
        : inverterKva <= 2 ? 120000
          : inverterKva <= 3 ? 165000
            : inverterKva <= 5 ? 280000
              : inverterKva <= 8 ? 450000
                : inverterKva <= 10 ? 600000
                  : 800000;
  const inverterCostMax =
    inverterKva <= 1 ? 120000
      : inverterKva <= 1.5 ? 140000
        : inverterKva <= 2 ? 165000
          : inverterKva <= 3 ? 230000
            : inverterKva <= 5 ? 380000
              : inverterKva <= 8 ? 600000
                : inverterKva <= 10 ? 800000
                  : 1200000;

  // ── BATTERY COST (per kWh, by pack size) ─────────────────────────────────
  // LFP packs: Nigerian retail June 2026
  // ≤5kWh: ₦60k–₦80k/kWh | 5–10kWh: ₦55k–₦75k/kWh | >10kWh: ₦50k–₦70k/kWh
  // (bulk/larger packs have slightly lower per-kWh cost)
  const batteryPerKwhMin = batteryKwh <= 5 ? 60000 : batteryKwh <= 10 ? 55000 : 50000;
  const batteryPerKwhMax = batteryKwh <= 5 ? 80000 : batteryKwh <= 10 ? 75000 : 70000;
  const totalBatteryCostMin = batteryKwh * batteryPerKwhMin;
  const totalBatteryCostMax = batteryKwh * batteryPerKwhMax;

  // ── MOUNTING + LABOUR (per panel + roof type premium) ────────────────────
  // Per panel: ₦12k–₦20k (includes brackets, roof penetration, labour)
  // Clay tiles: +₦5k/panel extra (harder to penetrate safely)
  // Flat concrete: +₦3k/panel extra (ballast/anchor system)
  const isFlatConcrete = roofType === 'flat_concrete';
  const mountingPerPanelMin = roofType === 'clay_tiles' ? 17000 : isFlatConcrete ? 15000 : 12000;
  const mountingPerPanelMax = roofType === 'clay_tiles' ? 25000 : isFlatConcrete ? 23000 : 20000;
  const totalMountingCostMin = panelsNeeded * mountingPerPanelMin;
  const totalMountingCostMax = panelsNeeded * mountingPerPanelMax;

  // ── CABLES + ACCESSORIES ──────────────────────────────────────────────────
  // Copper cables, breakers, lugs, trunking, surge protection
  // Scales with system size: small (1–2kVA) = ₦15k–₦25k, large (5kVA+) = ₦25k–₦45k
  const accessoriesCostMin = inverterKva <= 2 ? 15000 : inverterKva <= 5 ? 20000 : 25000;
  const accessoriesCostMax = inverterKva <= 2 ? 25000 : inverterKva <= 5 ? 35000 : 45000;

  // ── TOTALS ────────────────────────────────────────────────────────────────
  let systemCostMin = totalPanelCostMin + inverterCostMin + totalBatteryCostMin
    + totalMountingCostMin + accessoriesCostMin;
  let systemCostMax = totalPanelCostMax + inverterCostMax + totalBatteryCostMax
    + totalMountingCostMax + accessoriesCostMax;

  // Store itemized breakdown for UI display
  const costBreakdown = {
    panels: { min: totalPanelCostMin, max: totalPanelCostMax, label: `${panelsNeeded} × ${panelSizeWatts}W panels` },
    inverter: { min: inverterCostMin, max: inverterCostMax, label: `${inverterKva}kVA hybrid inverter` },
    battery: { min: totalBatteryCostMin, max: totalBatteryCostMax, label: `${batteryKwh}kWh LFP battery bank` },
    mounting: { min: totalMountingCostMin, max: totalMountingCostMax, label: 'Mounting + labour' },
    accessories: { min: accessoriesCostMin, max: accessoriesCostMax, label: 'Cables + accessories' },
  };

  const totalPanelWatts = actualPvKwp * 1000;
  const batteryVoltage: 12 | 24 | 48 =
    inverterKva <= 1.5 ? 12
      : inverterKva <= 3 ? 24
        : 48;
  // Source: Field standard — voltage class follows inverter size, not PV array.
  // 96V excluded: SolarCheck targets residential systems (48V LFP ceiling).
  const selectedInverterType: 'hybrid' | 'off-grid' | 'pcu' | 'on-grid' = systemMode === 'grid-tied' ? 'on-grid' : (systemMode === 'off-grid' ? 'off-grid' : 'hybrid');

  const chargeController = getChargeControllerSpec(selectedInverterType, totalPanelWatts, batteryVoltage);
  systemCostMin += chargeController.estimatedCost;
  systemCostMax += chargeController.estimatedCost;

  const monthlyCurrentSpend = monthlyBill + generatorSpend;

  let monthlyGridSavingsExpected = 0;
  let monthlyGeneratorSavingsExpected = 0;

  // #11 TOU ENERGY FLOW — formalized model
  const daytimeLoadKwh = dailyLoadKwh - nightLoadKwh;
  const dailySolarProduction = actualPvKwp * avgPSH * systemEfficiency;
  const solarUsedDirect = Math.min(daytimeLoadKwh, dailySolarProduction);
  const excessSolar = Math.max(0, dailySolarProduction - solarUsedDirect);
  const batteryEff = batteryRoundtrip; // already defined in efficiency breakdown
  const batteryCapRemaining = usableBattery;
  const batteryCharged = Math.min(excessSolar * batteryEff, batteryCapRemaining);
  const nightSupply = Math.min(batteryCharged, nightLoadKwh);
  const unmetLoad = Math.max(0, (daytimeLoadKwh - solarUsedDirect) + (nightLoadKwh - nightSupply));
  const totalLoad = dailyLoadKwh > 0 ? dailyLoadKwh : 1;
  const directSolarPct = Math.round((solarUsedDirect / totalLoad) * 100);
  const batteryPct = Math.round((nightSupply / totalLoad) * 100);
  const unmetPct = Math.max(0, 100 - directSolarPct - batteryPct);
  const batteryInsufficientFlag = nightLoadKwh > usableBattery;

  // #17 BACKUP FRACTION — derived from unmet energy, no hardcoded probabilities
  const backupFraction = totalLoad > 0 ? unmetLoad / totalLoad : 0;

  // CANONICAL usableDailyGenerationKwh — single derating pass (SYSTEM_EFF applied once)
  // This is the same formula used in pvCoverage / pvClassification above.
  // DO NOT multiply by an additional factor here.
  const usableDailyGenerationKwh = actualPvKwp * avgPSH * SYSTEM_EFF;
  const netUsableDailyGen = usableDailyGenerationKwh; // alias kept for legacy references

  // Coverage label: claim "100%" only when usable generation exceeds load by 15%
  // safety margin (1.15×), protecting against Harmattan / cloudy-streak shortfalls.
  // Fix 1: Compute actual solar coverage from real daily generation, not user target.
  // Source: field installer review June 2026 — coverage must reflect physics, not input.
  const actualSolarCoveragePct = dailyLoadKwh > 0
    ? Math.min(100, Math.round((netUsableDailyGen / dailyLoadKwh) * 100))
    : 100;

  const coverageLabel: string = (() => {
    if (dailyLoadKwh <= 0) return '100% Coverage';
    if (actualSolarCoveragePct >= 95) return `${actualSolarCoveragePct}% Full Coverage`;
    if (actualSolarCoveragePct >= 85) return `${actualSolarCoveragePct}% Realistic Coverage`;
    if (actualSolarCoveragePct >= 70) return `~${actualSolarCoveragePct}% Partial Coverage`;
    return `~${actualSolarCoveragePct}% \u2014 Significantly Undersized`;
  })();

  const rainySeasonCoverageLabel = '65% \u2013 80% Rainy Season Est.';

  // ── UPGRADE 3: Night load ratio for main engine (mirrors analyzeDaytimeLoad logic)
  const nightLoadRatio = dailyLoadKwh > 0 ? nightLoadKwh / dailyLoadKwh : 0;
  let loadProfileLabel: string;
  if (nightLoadRatio <= 0.10) {
    loadProfileLabel = 'Day-Dominant Load Profile';
  } else if (nightLoadRatio > 0.10 && nightLoadRatio <= 0.3001) {
    loadProfileLabel = 'Mixed Day/Night Load Profile';
  } else {
    loadProfileLabel = 'Night-Heavy Load Profile';
  }

  // Fix 3: Scale savings by actualSolarCoveragePct (real physics) not coveragePct (user input).
  // coveragePct is the user's target; actualSolarCoveragePct is what the panel array
  // can actually deliver. An undersized array must not claim 100% savings.
  if (systemMode === 'off-grid') {
    monthlyGridSavingsExpected = monthlyBill;
    monthlyGeneratorSavingsExpected = generatorSpend * (actualSolarCoveragePct / 100);
  } else {
    // Grid savings: proportional to actual solar coverage
    monthlyGridSavingsExpected = Math.min(
      monthlyBill * (actualSolarCoveragePct / 100),
      monthlyBill
    );
    // Generator savings: proportional to actual coverage × (1 - backup fraction)
    if (generatorSpend > 0) {
      monthlyGeneratorSavingsExpected =
        generatorSpend * (actualSolarCoveragePct / 100) * (1 - backupFraction);
    }
    // Cap: total savings cannot exceed total spend × actual coverage
    const totalSavingsCap = monthlyCurrentSpend * (actualSolarCoveragePct / 100);
    const totalSavings = monthlyGridSavingsExpected + monthlyGeneratorSavingsExpected;
    if (totalSavings > totalSavingsCap) {
      const scale = totalSavingsCap / totalSavings;
      monthlyGridSavingsExpected *= scale;
      monthlyGeneratorSavingsExpected *= scale;
    }
  }

  const calculateRange = (base: number) => ({
    conservative: Math.round(base * 0.8),
    expected: Math.round(base),
    stressCase: Math.round(base * 0.5)
  });

  const monthlyGridSavings = calculateRange(monthlyGridSavingsExpected);
  const monthlyGeneratorSavings = calculateRange(monthlyGeneratorSavingsExpected);

  // #13 Degradation constants — used in NPV loop and model object below
  const DEGRADATION_RATE = 0.006;  // 0.6%/yr per IEC 61215
  const SYSTEM_LIFE_YEARS = 25;

  const calculateNPVSavings = (years: number) => {
    const fInf = fuelInflation / 100;
    const tInf = nepaInflation / 100;
    const dRate = discountRate / 100;
    const monthlyMaintenance = actualPvKwp * 500 / 12;

    // ── UPGRADE 4: Mid-lifecycle hardware replacement penalty ─────────────────
    // ₦1,500,000 represents a realistic Lithium battery bank or hybrid inverter
    // field replacement cost at year 6 (mid-lifecycle), discounted to present value.
    // Applied ONLY to the 10-year projection — not the 5-year view.
    const BATTERY_REPLACEMENT_COST = 1_500_000; // ₦

    let totalSavingsExpected = 0;
    for (let year = 1; year <= years; year++) {
      // Apply panel degradation factor — year 1 = (1-0.006)^1, etc.
      const yearDegradFactor = Math.pow(1 - DEGRADATION_RATE, year);
      const nepaSaving = monthlyGridSavingsExpected * yearDegradFactor * Math.pow(1 + tInf, year);
      const generatorSaving = monthlyGeneratorSavingsExpected * yearDegradFactor * Math.pow(1 + fInf, year);
      const yearSaving = ((nepaSaving + generatorSaving) - monthlyMaintenance) * 12;

      // Year 6 penalty: mid-lifecycle hardware replacement (10-year run only)
      const replacementPenalty = (years >= 10 && year === 6) ? BATTERY_REPLACEMENT_COST : 0;

      totalSavingsExpected += (yearSaving - replacementPenalty) / Math.pow(1 + dRate, year);
    }

    // ── UPGRADE 4: 5-year maintenance + battery degradation overhead ──────────
    // Deduct 15% of gross 5-year NPV to account for battery capacity fade,
    // unplanned O&M, and real-world performance shortfalls not in monthly maintenance.
    if (years === 5) {
      totalSavingsExpected = totalSavingsExpected * (1 - 0.15);
    }

    return calculateRange(totalSavingsExpected);
  };

  const fiveYearSavings = calculateNPVSavings(5);
  const tenYearSavings = calculateNPVSavings(10);

  const firstYearMonthlySavingExpected = (monthlyGridSavingsExpected * (1 + (nepaInflation / 100) / 2)) + (monthlyGeneratorSavingsExpected * (1 + (fuelInflation / 100) / 2));
  const newSystemCostMid = (systemCostMin + systemCostMax) / 2;
  const paybackMonths = Math.round(newSystemCostMid / firstYearMonthlySavingExpected);

  let afterSolarMonthlyCost = monthlyCurrentSpend * (1 - coveragePct / 100);
  afterSolarMonthlyCost += actualPvKwp * 500 / 12;

  const monthlyProductionArray = pshArray.map(h => actualPvKwp * h * 30 * systemEfficiency);
  const co2SavedKgPerYear = monthlyProductionArray.reduce((a, b) => a + b, 0) * 0.43;
  const treesEquivalent = Math.round(co2SavedKgPerYear / 21);

  // #13 DEGRADATION MODEL — 0.6%/yr per IEC 61215 LeTID-free LFP modules
  let degradationSum = 0;
  for (let y = 1; y <= SYSTEM_LIFE_YEARS; y++) {
    degradationSum += Math.pow(1 - DEGRADATION_RATE, y);
  }
  const avgDegradationFactor = degradationSum / SYSTEM_LIFE_YEARS; // ~0.924
  const year1ProductionKwh = monthlyProductionArray.reduce((a, b) => a + b, 0);
  const year10ProductionKwh = year1ProductionKwh * Math.pow(1 - DEGRADATION_RATE, 9);
  const percentDropYear10 = (1 - Math.pow(1 - DEGRADATION_RATE, 9)) * 100;

  // STEP 7 — VALIDATION LAYER
  let validationError: string | undefined;
  let isValid = true;
  const errors: string[] = [];

  if (batterySufficiency === 'ADEQUATE ✅' && autonomyHours < 11.0) {
    errors.push("Contradiction: Battery labeled 'ADEQUATE' but usable capacity is less than one night's load.");
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
  // There is no night-hours UI field — the user's slider sets ONLY daytime hours.
  // Therefore: totalHoursPerDay === daytimeHours, nighttimeHours === 0.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appliancesWithDaytimeHours = inputs.appliances.map(appSelection => {
    const appDef = APPLIANCES.find(a => a.id === appSelection.id);
    const watts = appDef?.watts || 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let daytimeHours: number;
    if ((appDef?.typicalHours || 0) === 24) {
      // 24h appliances (CCTV, router, fridge): 12h day / 12h night
      daytimeHours = 12;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      daytimeHours = (appSelection as any).daytimeHours ?? Math.min(appDef?.typicalHours || 8, 8);
    }
    // hoursPerDay = daytimeHours (no separate night field exists in the UI)
    return { name: appDef?.name || appSelection.id, watts, quantity: appSelection.qty, hoursPerDay: daytimeHours, daytimeHours };
  });
  // Fix 7: Bind daytime text descriptions directly to actualPvKwp and batteryKwh state values
  const daytimeAnalysis = analyzeDaytimeLoad(appliancesWithDaytimeHours, actualPvKwp * 1000, batteryKwh, 5500);


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
  // Match usableBattery formula: LFP_DOD only, no RT_EFF double-accounting
  const theoreticalAutonomy = nightLoadKwh > 0
    ? (batteryKwh * LFP_DOD) / (nightLoadKwh / 12)
    : 0;

  const CEILING_HOURS = 12.0;
  const isBatteryValid = theoreticalAutonomy >= CEILING_HOURS
    ? autonomyHours === CEILING_HOURS
    : Math.abs(theoreticalAutonomy - autonomyHours) < 0.1;

  if (isBatteryValid || theoreticalAutonomy === 0) {
    // Math checks out
    batteryIntegrity = 'PASS';
  } else if (Math.abs(theoreticalAutonomy - autonomyHours) <= theoreticalAutonomy * 0.20) {
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

  // D. Battery-PV Balance — verify PV can realistically recharge the battery daily.
  // A battery that cannot fully recharge daily will chronically undercharge,
  // accelerating degradation and defeating rated cycle-life claims.
  const CHARGE_EFFICIENCY = 0.90; // MPPT charge efficiency (standard)
  const dailyChargeableKwh = netUsableDailyGen * CHARGE_EFFICIENCY;
  const batteryPvRatio = batteryKwh > 0 ? dailyChargeableKwh / batteryKwh : 1;

  let batteryPvBalance: 'HEALTHY' | 'MARGINAL' | 'MISMATCH' = 'HEALTHY';
  if (batteryPvRatio >= 0.5) {
    batteryPvBalance = 'HEALTHY';
  } else if (batteryPvRatio >= 0.3) {
    batteryPvBalance = 'MARGINAL';
    qaScore -= 10;
    qaWarnings.push(
      `Battery-PV imbalance: your ${actualPvKwp.toFixed(1)} kWp array delivers ` +
      `~${dailyChargeableKwh.toFixed(1)} kWh/day chargeable energy but your battery ` +
      `bank is ${batteryKwh.toFixed(1)} kWh. Battery will only reach ` +
      `~${Math.round(batteryPvRatio * 100)}% charge daily — consider reducing battery ` +
      `to ${(dailyChargeableKwh * 0.8).toFixed(1)} kWh or increasing panels.`
    );
  } else {
    batteryPvBalance = 'MISMATCH';
    qaScore -= 20;
    qaWarnings.push(
      `\u26a0\ufe0f Battery-PV mismatch: your ${actualPvKwp.toFixed(1)} kWp array can only charge ` +
      `~${Math.round(batteryPvRatio * 100)}% of your ${batteryKwh.toFixed(1)} kWh battery daily. ` +
      `Chronic undercharging will significantly reduce battery lifespan. ` +
      `Increase panels to at least ${(batteryKwh / CHARGE_EFFICIENCY).toFixed(1)} kWp ` +
      `or reduce battery to ${(dailyChargeableKwh * 0.8).toFixed(1)} kWh.`
    );
  }

  // E. Hard contradiction checks — these are genuine physics failures, not oversizing
  // Deduct heavily for label vs physics contradictions
  if (pvClassification === 'WELL SIZED' && pvRatio > 1.5) {
    qaScore -= 15;
    qaWarnings.push("Label contradiction: PV classified 'WELL SIZED' but ratio exceeds 1.5× annual requirement.");
  }
  if (batterySufficiency === 'ADEQUATE ✅' && autonomyHours < 11.0) {
    qaScore -= 20;
    qaWarnings.push("Label contradiction: Battery labeled 'ADEQUATE' but cannot cover one night of load.");
  }
  // autonomyHours > 24 in a non-off-grid system with large battery claiming full backup
  // is a marketing flag — but if night load is genuinely low it's physically valid.
  // We only flag if battery is large (>15kWh) yet autonomyHours seems inflated vs off-grid claim.
  // Autonomy >48h check is now largely redundant (ceiling clamp prevents it),
  // but keep as a final safety net for edge cases the clamp misses.
  if (systemMode !== 'off-grid' && autonomyHours > 48 && !autonomyNote) {
    qaScore -= 10;
    qaWarnings.push(`Autonomy > 48h on a ${systemMode} system — verify night load calculation.`);
  }

  // Rule 4: Over-generation guard — daily solar output should not exceed
  // (dailyLoad + batteryKwh) × 1.20 per engineering spec.
  // Handled as a soft QA penalty (not a hard constraint) because user autonomy
  // preferences legitimately drive larger arrays in some configurations.
  const maxAllowedDailyGeneration = (dailyLoadKwh + batteryKwh) * 1.20;
  if (dailySolarProduction > maxAllowedDailyGeneration && targetDailyGenerationKwh > 0) {
    qaScore -= 10;
    qaWarnings.push(
      `Over-generation: daily solar output ${dailySolarProduction.toFixed(1)} kWh exceeds ` +
      `load + battery ceiling of ${maxAllowedDailyGeneration.toFixed(1)} kWh (>20% excess). ` +
      `Consider reducing array size or increasing battery storage.`
    );
  }

  // Clamp score to [0, 100]
  qaScore = Math.max(0, Math.min(100, qaScore));

  let finalVerdict: 'Physics-Accurate' | 'Installer-Conservative' | 'Marketing-Biased' = 'Physics-Accurate';
  if (qaScore >= 85) finalVerdict = 'Physics-Accurate';
  else if (qaScore >= 60) finalVerdict = 'Installer-Conservative';
  else finalVerdict = 'Marketing-Biased';

  // ── SYSTEM VERDICT ENGINE ─────────────────────────────────────────────────
  // One dominant truth that all warnings must support, never contradict.
  // Uses seasonal coverage (not just annual avg) — rainy season is the real
  // binding constraint in Lagos, not the annual average.
  // Source: Based on real Lagos irradiance data (annual avg 3.75, rainy 3.32 PSH).

  const rainyCoverage = dailyLoadKwh > 0
    ? (actualPvKwp * rainyProduction / (actualPvKwp > 0 ? actualPvKwp : 1)) / dailyLoadKwh
    : 1;
  // Simpler: rainy season coverage = rainyProduction / dailyLoadKwh
  const rainySeasonCoverage = dailyLoadKwh > 0 ? rainyProduction / dailyLoadKwh : 1;
  const batteryCoversNight = nightLoadKwh <= 0 || (usableBattery / Math.max(nightLoadKwh, 0.1)) >= 1.1;
  // Threshold raised from 1.0 to 1.1 — a battery at exactly 1.0x ratio has zero
  // margin for inverter losses, battery degradation, or a cloudy evening.
  const pvCanChargeBattery = batteryPvBalance !== 'MISMATCH';

  type SystemClass = 'FULL_SOLAR' | 'GRID_ASSISTED' | 'GRID_DEPENDENT';
  let systemClass: SystemClass;

  if (pvCoverage >= 1.05 && batteryCoversNight && pvCanChargeBattery && rainySeasonCoverage >= 0.90) {
    // True full solar: covers load year-round including rainy season.
    // Threshold raised from 0.75 to 0.90 — Nigeria's rainy season (Jun-Sep) is
    // a real 4-month event; a system dropping to 80% for a third of the year
    // is grid-assisted, not full solar.
    systemClass = 'FULL_SOLAR';
  } else if (pvCoverage >= 0.75) {
    // Even if annual avg looks good, rainy season < 60% means grid-dependent in practice
    systemClass = rainySeasonCoverage >= 0.60 ? 'GRID_ASSISTED' : 'GRID_DEPENDENT';
  } else {
    systemClass = 'GRID_DEPENDENT';
  }

  const systemVerdictText: string =
    systemClass === 'FULL_SOLAR' ? 'Runs fully on solar under normal conditions' :
      systemClass === 'GRID_ASSISTED' ? 'Covers most of your energy — grid or generator needed during low sunlight' :
        'Solar offsets a portion of your usage — grid remains primary source';

  type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
  const systemConfidence: ConfidenceLevel =
    pvCoverage >= 1.1 && pvCanChargeBattery && batteryCoversNight ? 'HIGH' :
      pvCoverage >= 0.85 && batteryCoversNight ? 'MEDIUM' : 'LOW';

  // Verdict-aligned warnings — NEVER contradict the system class
  type VerdictWarningLevel = 'INFO' | 'ADVISORY' | 'CRITICAL';
  interface VerdictWarning { level: VerdictWarningLevel; text: string; }
  const verdictWarnings: VerdictWarning[] = [];

  if (rainySeasonCoverage < 0.75) {
    verdictWarnings.push({
      level: systemClass === 'FULL_SOLAR' ? 'ADVISORY' : 'INFO',
      text: 'Output drops during rainy season — grid or generator backup recommended June–September'
    });
  }
  if (!pvCanChargeBattery) {
    verdictWarnings.push({
      level: 'ADVISORY',
      text: `Battery may not fully recharge daily — panels deliver ~${Math.round(batteryPvRatio * 100)}% of battery capacity per day`
    });
  }
  if (!batteryCoversNight && nightLoadKwh > 0) {
    verdictWarnings.push({
      level: systemClass === 'FULL_SOLAR' ? 'ADVISORY' : 'CRITICAL',
      text: 'Battery cannot cover full night usage — some appliances will need grid backup after midnight'
    });
  }
  if (pvCoverage < 0.75) {
    verdictWarnings.push({
      level: 'CRITICAL',
      text: `Solar covers ~${Math.round(pvCoverage * 100)}% of your load — consider reducing load or adding panels`
    });
  }
  if (hasAC && autonomyHours > 24) {
    verdictWarnings.push({
      level: 'INFO',
      text: 'Backup time assumes limited night AC usage — running AC overnight will reduce autonomy significantly'
    });
  }

  // Filter: FULL_SOLAR systems should not show CRITICAL warnings (they contradict the class)
  const filteredVerdictWarnings = verdictWarnings.filter(w => {
    if (systemClass === 'FULL_SOLAR' && w.level === 'CRITICAL') return false;
    return true;
  });

  const systemVerdict = {
    systemClass,
    verdictText: systemVerdictText,
    confidence: systemConfidence,
    warnings: filteredVerdictWarnings,
    annualCoveragePct: Math.round(pvCoverage * 100),
    rainySeasonCoveragePct: Math.round(rainySeasonCoverage * 100),
  };

  const truthQAReport = {
    score: qaScore,
    pvStatus,
    batteryIntegrity,
    savingsIntegrity,
    flags,
    finalVerdict,
    warnings: qaWarnings
  };

  // ── #14 EFFICIENCY BREAKDOWN OBJECT ──────────────────────────────────────
  const efficiencyBreakdown = {
    panelLosses,
    inverterEfficiency: inverterEff,
    batteryRoundtrip,
    wiringLosses,
    directionFactor,
    pitchFactor,
    shadeFactor,
    totalEfficiency,
  };

  // ── #11 ENERGY FLOW MODEL OBJECT ─────────────────────────────────────────
  const energyFlow = {
    daytimeLoadKwh,
    nightLoadKwh,
    solarUsedDirectKwh: solarUsedDirect,
    excessSolarKwh: excessSolar,
    batteryChargedKwh: batteryCharged,
    nightSupplyFromBatteryKwh: nightSupply,
    unmetLoadKwh: unmetLoad,
    directSolarPct,
    batteryPct,
    unmetPct,
    batteryInsufficientFlag,
    batteryInsufficientWarning: batteryInsufficientFlag
      ? `Battery insufficient for night usage: night load ${nightLoadKwh.toFixed(2)} kWh > usable capacity ${usableBattery.toFixed(2)} kWh`
      : undefined,
  };

  // ── #12 SURGE ANALYSIS OBJECT ────────────────────────────────────────────
  const inverterSurgeMarginPct = requiredInverterKva > 0
    ? ((inverterKva - requiredInverterKva) / requiredInverterKva) * 100
    : 0;
  let inverterAssessment: 'risky' | 'acceptable' | 'oversized';
  if (inverterSurgeMarginPct < 10) inverterAssessment = 'risky';
  else if (inverterSurgeMarginPct <= 25) inverterAssessment = 'acceptable';
  else inverterAssessment = 'oversized';

  const surgeAnalysis = {
    steadyPeakKw: realPeakLoadKw,
    surgePeakKw: peakSurgeKw,
    inverterRequired: requiredInverterKva,
    inverterProvided: inverterKva,
    surgeMarginPct: Math.round(inverterSurgeMarginPct),
    assessment: inverterAssessment,
    assessmentLabel:
      inverterAssessment === 'risky' ? 'Inverter undersized — startup failure risk' :
        inverterAssessment === 'acceptable' ? 'Acceptable surge margin' :
          'Inverter oversized — consider downsizing',
    undersizedWarning: inverterAssessment === 'risky'
      ? `Inverter ${inverterKva} kVA < surge requirement ${requiredInverterKva.toFixed(1)} kVA — motor startup may trip inverter`
      : undefined,
  };

  // ── #13 DEGRADATION MODEL OBJECT ─────────────────────────────────────────
  const degradationModel = {
    degradationRatePerYear: DEGRADATION_RATE,
    year1ProductionKwh: Math.round(year1ProductionKwh),
    year10ProductionKwh: Math.round(year10ProductionKwh),
    percentDropYear10: Math.round(percentDropYear10 * 10) / 10,
    averageOutputFactor: Math.round(avgDegradationFactor * 1000) / 1000,
    systemLifetimeYears: SYSTEM_LIFE_YEARS,
  };

  // ── #15 BATTERY DoD DUAL MODEL ────────────────────────────────────────────
  const theoreticalUsableKwh = batteryKwh * 0.90;
  const conservativeUsableKwh = batteryKwh * 0.80;
  const nightLoadNonZero = nightLoadKwh > 0 ? nightLoadKwh : 1;
  const batteryDodModel = {
    theoreticalUsableKwh: Math.round(theoreticalUsableKwh * 100) / 100,
    conservativeUsableKwh: Math.round(conservativeUsableKwh * 100) / 100,
    autonomyTheoreticalNights: Math.round((theoreticalUsableKwh / nightLoadNonZero) * 10) / 10,
    autonomyConservativeNights: Math.round((conservativeUsableKwh / nightLoadNonZero) * 10) / 10,
  };

  // ── #16 RAINY SEASON ANALYSIS OBJECT ────────────────────────────────────
  let rainySeasonStatus: 'safe' | 'borderline' | 'at-risk';
  let rainySeasonStatusLabel: string;
  if (rainyToLoadRatio >= 1.25) { rainySeasonStatus = 'safe'; rainySeasonStatusLabel = 'Safe (≥1.25× margin)'; }
  else if (rainyToLoadRatio >= 1.15) { rainySeasonStatus = 'borderline'; rainySeasonStatusLabel = 'Borderline (1.15–1.25× margin)'; }
  else { rainySeasonStatus = 'at-risk'; rainySeasonStatusLabel = 'At-Risk (<1.15× margin)'; }

  const rainySeasonAnalysis = {
    worstMonthProductionKwh: Math.round(rainyProduction * 100) / 100,
    requiredWithMarginKwh: Math.round(targetDailyGenerationKwh * 1.15 * 100) / 100,
    safetyRatio: Math.round(rainyToLoadRatio * 100) / 100,
    status: rainySeasonStatus,
    statusLabel: rainySeasonStatusLabel,
  };

  // ── #18 ENGINEERING TRUTH CHECK — all rule-based ─────────────────────────
  const sizingRatio = targetDailyGenerationKwh > 0 ? dailySolarProduction / targetDailyGenerationKwh : 0;
  let systemSizingLabel: 'undersized' | 'balanced' | 'oversized';
  if (sizingRatio < 1.1) systemSizingLabel = 'undersized';
  else if (sizingRatio <= 1.3) systemSizingLabel = 'balanced';
  else systemSizingLabel = 'oversized';

  const batteryNightsRatio = nightLoadNonZero > 0 ? usableBattery / nightLoadNonZero : 0;
  let batteryAssessmentLabel: 'insufficient' | 'minimal' | 'comfortable';
  if (batteryNightsRatio < 1) batteryAssessmentLabel = 'insufficient';
  else if (batteryNightsRatio < 2) batteryAssessmentLabel = 'minimal';
  else batteryAssessmentLabel = 'comfortable';

  const truthWarnings: string[] = [];
  if (systemSizingLabel === 'undersized') truthWarnings.push('System undersized: solar production < 1.1× daily load target');
  if (batteryAssessmentLabel === 'insufficient') truthWarnings.push('Battery cannot cover one full night of load');
  if (inverterAssessment === 'risky') truthWarnings.push(surgeAnalysis.undersizedWarning ?? 'Inverter undersized for surge');
  if (rainySeasonStatus === 'at-risk') truthWarnings.push('Rainy season production below 1.15× safety margin');
  if (batteryInsufficientFlag) truthWarnings.push(energyFlow.batteryInsufficientWarning ?? 'Battery insufficient for night usage');

  const engineeringTruthCheck = {
    systemSizingRatio: Math.round(sizingRatio * 100) / 100,
    systemSizingLabel,
    batteryNightsRatio: Math.round(batteryNightsRatio * 100) / 100,
    batteryAssessment: batteryAssessmentLabel,
    inverterSurgeMarginPct: Math.round(inverterSurgeMarginPct),
    inverterAssessment,
    warnings: truthWarnings,
    passed: truthWarnings.length === 0,
  };

  // ═─ TRUTH ENFORCEMENT ENGINE ─═══════════════════════════════════
  // Runs AFTER all calculations are complete. Passes a flat inputs
  // bundle through the hard-clamp validation layer. The corrected
  // values are attached as `truthEnforcement` and should be preferred
  // by the UI over raw values when they differ.
  // Honest simultaneous peak = max(all-day appliances, all-night appliances) nameplate watts
  // Surge stays internal to inverter sizing — NOT exposed to users.
  const coincidenceWeightedPeakKw = simultaneousLoadKw;
  const simultaneousPeakKw = appliances.length > 0
    ? Math.max(coincidenceWeightedPeakKw, singleLargestActiveKw + baseLightingLoadsKw)
    : Math.max(dayActiveKw, nightActiveKw);
  const truthEnforcement = enforceTruth({
    dailyLoadKwh,
    peakLoadKw: simultaneousPeakKw,
    pvKwp: actualPvKwp,
    batteryKwh,
    batteryVoltage,
    inverterKva,
    avgPSH,
    systemEfficiency: totalEfficiency,
    monthlyGenerationKwh: monthlyProductionArray,
    monthlyGridCost: monthlyBill,
    monthlyGeneratorCost: generatorSpend,
    tariffPerKwh: discoTariff,
    nightLoadKwh,
    coveragePct,
    systemMode,
    // Pre-computed values the engine needs
    afterSolarMonthlyCost,
    monthlyGridSavings,
    monthlyGeneratorSavings,
    autonomyHours: Math.round(autonomyHours * 10) / 10,
    autonomyNote,
  });

  // ── INSTALLER-GRADE CONSISTENCY CHECKS ──
  const systemConsistencyWarnings: string[] = [];

  // Surge Power Check
  // surgeLoadWatts was calculated precisely using appliance-specific motor rules
  if (inverterKva < surgeLoadWatts / 1000) {
    systemConsistencyWarnings.push("Startup failure risk ⚠️: inverter cannot handle motor surge");
  }

  // Location-Aware Rainy Season Derating
  const isSouth = ['Lagos', 'Rivers', 'Delta', 'Ogun', 'Edo', 'Cross River', 'Akwa Ibom', 'Ondo', 'Osun', 'Oyo', 'Ekiti', 'Anambra', 'Enugu', 'Imo', 'Abia', 'Ebonyi', 'Bayelsa'].includes(inputs.state);
  const rainy_factor = isSouth ? 0.65 : 0.75;
  const rainy_output = usableDailyGenerationKwh * rainy_factor;
  if (rainy_output < dailyLoadKwh) {
    systemConsistencyWarnings.push("Rainy season energy deficit ⚠️");
  }

  // Battery Charging Realism (Losses)
  if (batteryKwh > 0) {
    const battery_charge_efficiency = 0.85;
    const required_pv_for_battery = batteryKwh / battery_charge_efficiency;
    if (usableDailyGenerationKwh < required_pv_for_battery) {
      systemConsistencyWarnings.push("Battery may not fully charge daily ⚠️");
    }
  }

  // Charge Rate Constraint (Time-based)
  if (batteryKwh > 0 && avgPSH > 0) {
    const required_charge_power = batteryKwh / avgPSH;
    if (actualPvKwp < required_charge_power) {
      systemConsistencyWarnings.push("Insufficient PV power for timely battery charging ⚠️");
    }
  }

  // MPPT Limit Flexibility
  const inverter_mppt_factor = 1.3; // Configurable default
  const inverter_max_pv = inverterKva * inverter_mppt_factor;
  if (actualPvKwp > inverter_max_pv) {
    systemConsistencyWarnings.push("PV array exceeds inverter MPPT capacity ❌");
  }

  // Economic Sanity Check
  if (totalBatteryCostMin > systemCostMax * 0.4) {
    systemConsistencyWarnings.push("Battery may not be cost-optimal ⚠️");
  }

  // Grid Dependency Context
  const pvCoverageRatio = dailyLoadKwh > 0 ? usableDailyGenerationKwh / dailyLoadKwh : 1;
  if (pvCoverageRatio < 0.8 && batteryKwh > 0) {
    systemConsistencyWarnings.push("High grid reliance despite battery ⚠️");
  } else if (pvCoverageRatio < 0.8) {
    systemConsistencyWarnings.push("Grid-tied system behavior (intentional)");
  }

  return {
    isValid,
    validationError,
    peakLoadKw: simultaneousPeakKw,
    totalConnectedLoadW,
    dailyLoadKwh,
    nightLoadKwh,
    pvKwp: actualPvKwp,
    panelsNeeded,
    panelSizeWatts,
    panelTierLabel,
    inverterKva,
    batteryKwh,
    batteryVoltage,
    batteryType: batteryKwh > 0 ? 'lithium' : 'none',
    realUsableBattery: usableBattery,
    batteryCoverageRatio: engineeringTruthCheck.batteryNightsRatio,
    batteryRiskLevel: isFragileBatteryWarning ? 'fragile' : (batterySufficiency === 'INSUFFICIENT ⚠️' ? 'critical' : (batterySufficiency === 'TIGHT ⚠️' ? 'moderate' : 'safe')),
    dynamicApplianceInsights: efficiencyRecommendations,
    systemCostMin,
    systemCostMax,
    costBreakdown,
    systemVerdict,
    paybackMonths,
    fiveYearSavings,
    systemStatus: finalVerdict === 'Marketing-Biased' ? 'FAIL' : 'PASS',
    tenYearSavings,
    monthlyGridSavings,
    monthlyGeneratorSavings,
    batterySufficiency,
    nightCoverageRatio,
    energyOffsetPct: coveragePct,
    coverageLabel,
    actualSolarCoveragePct,
    batteryPvBalance,
    rainySeasonCoverageLabel,
    loadProfileLabel,
    autonomyHours: Math.round(autonomyHours * 10) / 10,
    autonomyNote,
    isFragileBatteryWarning,
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
    // ── Installer-grade analyses ──
    efficiencyBreakdown,
    energyFlow,
    surgeAnalysis,
    degradationModel,
    batteryDodModel,
    rainySeasonAnalysis,
    engineeringTruthCheck,
    truthEnforcement,
    // ── Upgrade Block B: Roof Footprint Guardrail ──
    totalRequiredAreaSqM,
    // ── Upgrade Block C: Appliance Remediation Engine ──
    efficiencyRecommendations,
    // ── Upgrade Block A: Budget Mode Signal ──
    budgetModeActive,
    systemConsistencyWarnings,
  };
}

export function getInverterSize(kva: number): string {
  if (kva <= 1.5) return '1.5KVA';
  if (kva <= 2) return '2KVA';
  if (kva <= 3) return '3KVA';
  if (kva <= 5) return '5KVA';
  if (kva <= 10) return '10KVA';
  return '15KVA';
}

/** Format naira with commas */
export function fmt(n: number): string {
  return '₦' + Math.round(n).toLocaleString('en-NG');
}

/** Format naira in millions (e.g. ₦1.65M) */
export function fmtM(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
}