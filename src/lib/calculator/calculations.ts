/* ═══════════════════════════════════════════════════ */
/* SolarCheck Nigeria — Solar Calculation Engine       */
/* Lagos market rates — Updated May 2026               */
/* ═══════════════════════════════════════════════════ */

import { CalculatorInputs, CalculatorResults } from './types';
import { MONTHLY_PSH, DEFAULT_MONTHLY_PSH } from './irradiance';


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
  // Lagos
  'IKEDC / EKEDC': 70, // Average for Lagos
  'IKEDC': 68,
  'EKEDC': 72,
  // SW
  'IBEDC': 58,
  'EEDC': 52,
  // SE/SS
  'PHEDC': 55,
  'BEDC': 50,
  'AEDC': 62,
  // North
  'JEDC': 48,
  'KEDC': 45,
  'YEDC': 48,
  'KAEDCO': 43,
  'GEDC': 42,
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
export function getEffectiveTariff(discoStr: string, lagosElectricityBand?: string): number {
  if (discoStr.includes('IKEDC / EKEDC')) {
    if (lagosElectricityBand) {
      const band = IKEDC_BANDS.find(b => b.id === lagosElectricityBand);
      if (band) return band.tariff;
    }
    // No band selected: use Band B (₦62.48) as the most common Lagos scenario
    // ₦70 from DISCO_TARIFF is a generic estimate — never use it for Lagos
    return 62.48;
  }
  const acronym = discoStr.split(' ')[0];
  return DISCO_TARIFF[acronym] ?? 65;
}

export function calculateSolarSystem(inputs: CalculatorInputs): CalculatorResults {
  const {
    state, monthlyBill, generatorSpend,
    appliances, coveragePct, batteryScenario,
    roofType, roofDirection, roofPitch, shadeObstruction,
    fuelInflation, nepaInflation, discountRate
  } = inputs;

  const discoStr = DISCO_BY_STATE[state] || 'Unknown';
  const discoTariff = getEffectiveTariff(discoStr, inputs.lagosElectricityBand);

  // STEP 1 — CONVERT NEPA BILL TO kWh
  const monthlyKwhFromNepa = monthlyBill / discoTariff;

  // STEP 2 — CONVERT GENERATOR FUEL TO kWh
  const fuelEff = inputs.fuelEfficiency || 2.0;
  const generatorFuelLiters = generatorSpend / PETROL_PRICE_PER_LITRE;
  const monthlyKwhFromGenerator = generatorFuelLiters * fuelEff;

  // STEP 3 — TOTAL LOAD
  const totalApplianceKwh = appliances.reduce((sum, appSelection) => {
    const appDef = APPLIANCES.find(a => a.id === appSelection.id);
    return sum + (appDef ? appDef.kwhPerDay * appSelection.qty : 0);
  }, 0);
  
  const applianceMonthlyKwh = totalApplianceKwh * 30;
  
  let totalMonthlyKwh = 0;
  if (appliances.length > 0 && applianceMonthlyKwh > 0) {
    totalMonthlyKwh = applianceMonthlyKwh;
  } else {
    totalMonthlyKwh = monthlyKwhFromNepa + monthlyKwhFromGenerator;
  }

  // STEP 4 — TARGET kWh FROM SOLAR
  const targetMonthlyKwh = totalMonthlyKwh * (coveragePct / 100);

  // STEP 5 — GET STATE PSH
  const pshArray = MONTHLY_PSH[state] ?? DEFAULT_MONTHLY_PSH;
  const avgPSH = pshArray.reduce((a, b) => a + b, 0) / pshArray.length;

  // STEP 6 — APPLY ROOF FACTORS
  let directionFactor = 1.0;
  if (roofDirection === 'South') directionFactor = 1.0;
  else if (roofDirection === 'South-East' || roofDirection === 'South-West') directionFactor = 0.95;
  else if (roofDirection === 'East' || roofDirection === 'West') directionFactor = 0.85;
  else if (roofDirection === 'North-East' || roofDirection === 'North-West') directionFactor = 0.80; // Reasonable assumption
  else if (roofDirection === 'North') directionFactor = 0.75;

  let pitchFactor = 1.0;
  if (roofPitch === 'Flat (0°)') pitchFactor = 0.92;
  else if (roofPitch === 'Low (10-15°)') pitchFactor = 0.97;
  else if (roofPitch === 'Medium (20-30°)') pitchFactor = 1.00;
  else if (roofPitch === 'Steep (35-45°)') pitchFactor = 0.97;

  const shadeFactor = 1 - (shadeObstruction / 100);
  const systemEfficiency = 0.80 * directionFactor * pitchFactor * shadeFactor;

  const roofMountingCost = roofType === 'clay_tiles' ? 35000 : 0; // +₦35,000 flat
  const isFlatConcrete = roofType === 'flat_concrete'; // +5% later

  // STEP 7 — CALCULATE ARRAY SIZE
  const pvKwp = targetMonthlyKwh / (avgPSH * 30 * systemEfficiency);
  const panelsNeeded = Math.ceil(pvKwp / 0.4);
  const actualPvKwp = panelsNeeded * 0.4;

  // STEP 8 — INVERTER / KVA SIZE
  const calculatedInverterKva = actualPvKwp * 1.25;
  const inverterSizes = [3, 5, 8, 10, 15, 20];
  const inverterKva = inverterSizes.find(size => size >= calculatedInverterKva) || inverterSizes[inverterSizes.length - 1];

  // STEP 9 — BATTERY SIZING
  let batteryKwh = 0;
  if (batteryScenario === 'surplus') {
    batteryKwh = actualPvKwp * 2;
  } else if (batteryScenario === 'overnight') {
    const dailyNightLoad = (totalMonthlyKwh / 30) * 0.4; // 40% of daily load
    batteryKwh = dailyNightLoad / 0.80; // Account for 80% DoD
  } else if (batteryScenario === 'specific' || (batteryScenario as string) === 'full_backup') { // Full backup
    batteryKwh = (totalMonthlyKwh / 30) * 1.5 / 0.80; // 1.5 days autonomy
  }
  
  if (batteryKwh > 0) {
    batteryKwh = Math.round(batteryKwh / 2) * 2; // Round to nearest 2
    if (batteryKwh < 4) batteryKwh = 4; // Min 4kWh lithium
  }

  // COST CALCULATIONS
  // System costs (₦/kWp)
  let baseSystemCostMin = actualPvKwp * 500000;
  let baseSystemCostMax = actualPvKwp * 700000;

  if (isFlatConcrete) {
    baseSystemCostMin *= 1.05;
    baseSystemCostMax *= 1.05;
  }
  
  const batteryUnitCost = 180000; // ₦/kWh
  const totalBatteryCost = batteryKwh * batteryUnitCost;

  const systemCostMin = baseSystemCostMin + totalBatteryCost + roofMountingCost;
  const systemCostMax = baseSystemCostMax + totalBatteryCost + roofMountingCost;

  // SAVINGS CALCULATION (NPV)
  const monthlyCurrentSpend = monthlyBill + generatorSpend;
  
  const calculateNPVSavings = (years: number) => {
    const fInf = fuelInflation / 100;
    const tInf = nepaInflation / 100; // Map nepaInflation to tariffInflation
    const dRate = discountRate / 100;

    const nepaOffset = monthlyBill * (coveragePct / 100);
    const generatorOffset = generatorSpend * (coveragePct / 100);
    const monthlyMaintenance = actualPvKwp * 500 / 12;

    let totalSavings = 0;
    for (let year = 1; year <= years; year++) {
      const nepaSaving = nepaOffset * Math.pow(1 + tInf, year);
      const generatorSaving = generatorOffset * Math.pow(1 + fInf, year);
      const yearSaving = ((nepaSaving + generatorSaving) - monthlyMaintenance) * 12;
      
      const presentValue = yearSaving / Math.pow(1 + dRate, year);
      totalSavings += presentValue;
    }
    return Math.round(totalSavings);
  };

  const fiveYearSavings = calculateNPVSavings(5);
  const tenYearSavings = calculateNPVSavings(10);

  // Payback period
  const systemCostMid = (systemCostMin + systemCostMax) / 2;
  const fInf = fuelInflation / 100;
  const tInf = nepaInflation / 100;
  
  const monthlySolarOffset = monthlyCurrentSpend * (coveragePct / 100);
  const firstYearMonthlySaving = monthlySolarOffset * (1 + (tInf + fInf) / 2) * 12 / 12;

  const paybackMonths = Math.round(
    systemCostMid / (firstYearMonthlySaving * (1 + (tInf + fInf) / 4))
  );

  // AFTER SOLAR MONTHLY COST
  let afterSolarMonthlyCost = monthlyCurrentSpend * (1 - coveragePct / 100);
  afterSolarMonthlyCost += actualPvKwp * 500 / 12; // Maintenance

  // Monthly Production (for chart)
  const monthlyProduction = pshArray.map(h => actualPvKwp * h * 30 * systemEfficiency);

  const co2SavedKgPerYear = (monthlyProduction.reduce((a, b) => a + b, 0)) * 0.43;
  const treesEquivalent = Math.round(co2SavedKgPerYear / 21);

  return {
    pvKwp: actualPvKwp,
    panelsNeeded,
    inverterKva,
    batteryKwh,
    batteryType: batteryKwh > 0 ? 'lithium' : 'none',
    systemCostMin,
    systemCostMax,
    paybackMonths,
    fiveYearSavings,
    tenYearSavings,
    monthlyCurrentSpend,
    afterSolarMonthlyCost,
    monthlyProduction,
    discoName: discoStr,
    discoTariff,
    avgPSH,
    co2SavedKgPerYear,
    treesEquivalent
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
