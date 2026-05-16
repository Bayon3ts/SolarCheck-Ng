/* ═══════════════════════════════════════════════════ */
/* SolarCheck Nigeria — Solar Calculation Engine       */
/* Lagos market rates — Updated May 2026               */
/* ═══════════════════════════════════════════════════ */

import { CalculatorInputs, CalculatorResults, CostBand, RoofType } from './types';
import { MONTHLY_PSH, DEFAULT_MONTHLY_PSH } from './irradiance';


// ── Appliance data (client + server share) ────────────────
export const APPLIANCES = [
  // ── COOLING (highest priority — 40-60% of Nigerian home consumption) ──
  {
    id: 'ac_1hp_inv',
    label: '1HP Air Conditioner (Inverter)',
    icon: '❄️',
    watts: 550,
    hoursPerDay: 8,
    kwhPerDay: 4.4,
    note: '8hrs/day',
    category: 'Cooling',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'ac_1_5hp_inv',
    label: '1.5HP Air Conditioner (Inverter)',
    icon: '❄️',
    watts: 750,
    hoursPerDay: 8,
    kwhPerDay: 6.0,
    note: '8hrs/day',
    category: 'Cooling',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'ac_1_5hp_std',
    label: '1.5HP Air Conditioner (Standard)',
    icon: '❄️',
    watts: 1100,
    hoursPerDay: 8,
    kwhPerDay: 8.8,
    note: '8hrs/day',
    category: 'Cooling',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'ac_2hp_inv',
    label: '2HP Air Conditioner (Inverter)',
    icon: '❄️',
    watts: 1000,
    hoursPerDay: 8,
    kwhPerDay: 8.0,
    note: '8hrs/day',
    category: 'Cooling',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'ac_2hp_std',
    label: '2HP Air Conditioner (Standard)',
    icon: '❄️',
    watts: 1500,
    hoursPerDay: 8,
    kwhPerDay: 12.0,
    note: '8hrs/day',
    category: 'Cooling',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'ac_3hp',
    label: '3HP Air Conditioner (Commercial)',
    icon: '❄️',
    watts: 2200,
    hoursPerDay: 8,
    kwhPerDay: 17.6,
    note: '8hrs/day',
    category: 'Cooling',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'air_cooler',
    label: 'Air Cooler (evaporative)',
    icon: '🌬️',
    watts: 200,
    hoursPerDay: 8,
    kwhPerDay: 1.6,
    note: '8hrs/day',
    category: 'Cooling',
    maxQuantity: 10,
    quantity: 0,
  },

  // ── REFRIGERATION (25-30% of Nigerian home consumption) ──────────────
  {
    id: 'fridge_sm',
    label: 'Refrigerator — Small (100–150L)',
    icon: '🧊',
    watts: 80,
    hoursPerDay: 24,
    kwhPerDay: 0.9,
    note: 'Always on',
    category: 'Refrigeration',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'fridge_md',
    label: 'Refrigerator — Medium (200–300L)',
    icon: '🧊',
    watts: 120,
    hoursPerDay: 24,
    kwhPerDay: 1.5,
    note: 'Always on',
    category: 'Refrigeration',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'fridge_lg',
    label: 'Refrigerator — Large (400L+)',
    icon: '🧊',
    watts: 200,
    hoursPerDay: 24,
    kwhPerDay: 2.8,
    note: 'Always on',
    category: 'Refrigeration',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'freezer_sm',
    label: 'Chest Freezer — Small (100–200L)',
    icon: '🧊',
    watts: 100,
    hoursPerDay: 24,
    kwhPerDay: 1.4,
    note: 'Always on',
    category: 'Refrigeration',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'freezer_lg',
    label: 'Chest Freezer — Large (300–500L)',
    icon: '🧊',
    watts: 160,
    hoursPerDay: 24,
    kwhPerDay: 2.2,
    note: 'Always on',
    category: 'Refrigeration',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'fridge_comm',
    label: 'Commercial Display Fridge/Freezer',
    icon: '🧊',
    watts: 300,
    hoursPerDay: 24,
    kwhPerDay: 4.5,
    note: 'Always on',
    category: 'Refrigeration',
    maxQuantity: 10,
    quantity: 0,
  },

  // ── LIGHTING & FANS ───────────────────────────────────────────────────
  {
    id: 'lights_4',
    label: 'LED Lights (4 bulbs × 9W)',
    icon: '💡',
    watts: 36,
    hoursPerDay: 8,
    kwhPerDay: 0.3,
    note: '8hrs/day',
    category: 'Lighting & Fans',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'lights_8',
    label: 'LED Lights (8 bulbs × 9W)',
    icon: '💡',
    watts: 72,
    hoursPerDay: 8,
    kwhPerDay: 0.6,
    note: '8hrs/day',
    category: 'Lighting & Fans',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'lights_12',
    label: 'LED Lights (12 bulbs × 9W)',
    icon: '💡',
    watts: 108,
    hoursPerDay: 8,
    kwhPerDay: 0.9,
    note: '8hrs/day',
    category: 'Lighting & Fans',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'outdoor_lights',
    label: 'Outdoor / Security Flood Lights',
    icon: '🏮',
    watts: 60,
    hoursPerDay: 10,
    kwhPerDay: 0.6,
    note: '10hrs/day',
    category: 'Lighting & Fans',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'fan_ceil',
    label: 'Ceiling Fan (per fan)',
    icon: '🌀',
    watts: 65,
    hoursPerDay: 8,
    kwhPerDay: 0.5,
    note: '8hrs/day',
    category: 'Lighting & Fans',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'fan_stand',
    label: 'Standing / Table Fan',
    icon: '🌀',
    watts: 45,
    hoursPerDay: 8,
    kwhPerDay: 0.4,
    note: '8hrs/day',
    category: 'Lighting & Fans',
    maxQuantity: 10,
    quantity: 0,
  },

  // ── ENTERTAINMENT ─────────────────────────────────────────────────────
  {
    id: 'tv_24',
    label: '24" LED TV',
    icon: '📺',
    watts: 30,
    hoursPerDay: 6,
    kwhPerDay: 0.18,
    note: '6hrs/day',
    category: 'Entertainment',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'tv_32',
    label: '32" LED TV',
    icon: '📺',
    watts: 40,
    hoursPerDay: 6,
    kwhPerDay: 0.24,
    note: '6hrs/day',
    category: 'Entertainment',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'tv_43',
    label: '43" LED TV',
    icon: '📺',
    watts: 65,
    hoursPerDay: 6,
    kwhPerDay: 0.39,
    note: '6hrs/day',
    category: 'Entertainment',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'tv_55',
    label: '55"+ LED / OLED TV',
    icon: '📺',
    watts: 100,
    hoursPerDay: 6,
    kwhPerDay: 0.6,
    note: '6hrs/day',
    category: 'Entertainment',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'dstv',
    label: 'DSTV / Satellite Decoder',
    icon: '📡',
    watts: 30,
    hoursPerDay: 6,
    kwhPerDay: 0.18,
    note: '6hrs/day',
    category: 'Entertainment',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'sound',
    label: 'Sound System / Home Theatre',
    icon: '🔊',
    watts: 80,
    hoursPerDay: 4,
    kwhPerDay: 0.32,
    note: '4hrs/day',
    category: 'Entertainment',
    maxQuantity: 10,
    quantity: 0,
  },

  // ── COMPUTING & CONNECTIVITY ──────────────────────────────────────────
  {
    id: 'laptop',
    label: 'Laptop (per laptop)',
    icon: '💻',
    watts: 45,
    hoursPerDay: 8,
    kwhPerDay: 0.36,
    note: '8hrs/day',
    category: 'Computing',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'desktop',
    label: 'Desktop Computer + Monitor',
    icon: '🖥️',
    watts: 200,
    hoursPerDay: 8,
    kwhPerDay: 1.6,
    note: '8hrs/day',
    category: 'Computing',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'phone_chrg',
    label: 'Phone / Tablet Chargers (×4)',
    icon: '📱',
    watts: 25,
    hoursPerDay: 8,
    kwhPerDay: 0.2,
    note: 'Daily charging',
    category: 'Computing',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'router',
    label: 'WiFi Router / Modem',
    icon: '📶',
    watts: 10,
    hoursPerDay: 24,
    kwhPerDay: 0.24,
    note: 'Always on',
    category: 'Computing',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'printer',
    label: 'Printer (laser/inkjet)',
    icon: '🖨️',
    watts: 50,
    hoursPerDay: 2,
    kwhPerDay: 0.1,
    note: 'Light use',
    category: 'Computing',
    maxQuantity: 10,
    quantity: 0,
  },

  // ── WATER ─────────────────────────────────────────────────────────────
  {
    id: 'pump_0_5hp',
    label: 'Water Pump (0.5HP)',
    icon: '💧',
    watts: 373,
    hoursPerDay: 2,
    kwhPerDay: 0.75,
    note: '2hrs/day',
    category: 'Water',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'pump_1hp',
    label: 'Borehole Pump (1HP)',
    icon: '💧',
    watts: 746,
    hoursPerDay: 3,
    kwhPerDay: 2.2,
    note: '3hrs/day',
    category: 'Water',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'pump_1_5hp',
    label: 'Borehole Pump (1.5HP)',
    icon: '💧',
    watts: 1100,
    hoursPerDay: 3,
    kwhPerDay: 3.3,
    note: '3hrs/day',
    category: 'Water',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'water_heater',
    label: 'Instant Water Heater (shower)',
    icon: '🚿',
    watts: 3000,
    hoursPerDay: 0.5,
    kwhPerDay: 1.5,
    note: '30min/day',
    category: 'Water',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'water_dispenser',
    label: 'Water Dispenser (hot & cold)',
    icon: '🚰',
    watts: 500,
    hoursPerDay: 24,
    kwhPerDay: 1.2,
    note: 'Always on',
    category: 'Water',
    maxQuantity: 10,
    quantity: 0,
  },

  // ── KITCHEN ───────────────────────────────────────────────────────────
  {
    id: 'microwave',
    label: 'Microwave Oven (1000W)',
    icon: '📟',
    watts: 1000,
    hoursPerDay: 1,
    kwhPerDay: 1.0,
    note: '1hr/day',
    category: 'Kitchen',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'electric_cooker',
    label: 'Electric Cooker / Hotplate',
    icon: '🍳',
    watts: 1500,
    hoursPerDay: 2,
    kwhPerDay: 3.0,
    note: '2hrs/day',
    category: 'Kitchen',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'induction',
    label: 'Induction Cooker',
    icon: '🍲',
    watts: 2000,
    hoursPerDay: 1.5,
    kwhPerDay: 3.0,
    note: '1.5hrs/day',
    category: 'Kitchen',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'kettle',
    label: 'Electric Kettle (1500W)',
    icon: '☕',
    watts: 1500,
    hoursPerDay: 0.5,
    kwhPerDay: 0.75,
    note: '30min/day',
    category: 'Kitchen',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'blender',
    label: 'Blender / Juicer',
    icon: '🥤',
    watts: 350,
    hoursPerDay: 0.3,
    kwhPerDay: 0.1,
    note: '20min/day',
    category: 'Kitchen',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'toaster',
    label: 'Toaster / Sandwich Maker',
    icon: '🍞',
    watts: 800,
    hoursPerDay: 0.25,
    kwhPerDay: 0.2,
    note: '15min/day',
    category: 'Kitchen',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'electric_oven',
    label: 'Electric Oven (full size)',
    icon: '🥧',
    watts: 2000,
    hoursPerDay: 1,
    kwhPerDay: 2.0,
    note: '1hr/day',
    category: 'Kitchen',
    maxQuantity: 10,
    quantity: 0,
  },

  // ── LAUNDRY ───────────────────────────────────────────────────────────
  {
    id: 'washing',
    label: 'Washing Machine (front-load)',
    icon: '👕',
    watts: 500,
    hoursPerDay: 0.43,
    kwhPerDay: 0.5,
    note: '3×/week avg',
    category: 'Laundry',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'iron',
    label: 'Electric Iron (1200W)',
    icon: '🧺',
    watts: 1200,
    hoursPerDay: 0.5,
    kwhPerDay: 0.6,
    note: '30min/day',
    category: 'Laundry',
    maxQuantity: 10,
    quantity: 0,
  },

  // ── SECURITY ──────────────────────────────────────────────────────────
  {
    id: 'cctv_4cam',
    label: 'CCTV System (4 cameras + DVR)',
    icon: '📷',
    watts: 40,
    hoursPerDay: 24,
    kwhPerDay: 0.96,
    note: 'Always on',
    category: 'Security',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'cctv_8cam',
    label: 'CCTV System (8 cameras + DVR)',
    icon: '📷',
    watts: 65,
    hoursPerDay: 24,
    kwhPerDay: 1.56,
    note: 'Always on',
    category: 'Security',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'electric_gate',
    label: 'Electric Gate + Intercom',
    icon: '🚪',
    watts: 200,
    hoursPerDay: 0.5,
    kwhPerDay: 0.1,
    note: 'Daily use',
    category: 'Security',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'alarm',
    label: 'Security Alarm System',
    icon: '🔔',
    watts: 15,
    hoursPerDay: 24,
    kwhPerDay: 0.36,
    note: 'Always on',
    category: 'Security',
    maxQuantity: 10,
    quantity: 0,
  },

  // ── BUSINESS / COMMERCIAL ─────────────────────────────────────────────
  {
    id: 'pos',
    label: 'POS Machine + Receipt Printer',
    icon: '🧾',
    watts: 30,
    hoursPerDay: 8,
    kwhPerDay: 0.24,
    note: 'Business hrs',
    category: 'Business',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'projector',
    label: 'Projector / Conference Screen',
    icon: '📽️',
    watts: 300,
    hoursPerDay: 4,
    kwhPerDay: 1.2,
    note: '4hrs/day',
    category: 'Business',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'barbing_clippers',
    label: 'Hair Clippers (barbershop ×3)',
    icon: '✂️',
    watts: 60,
    hoursPerDay: 8,
    kwhPerDay: 0.48,
    note: 'Business hrs',
    category: 'Business',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'sewing_machine',
    label: 'Industrial Sewing Machine',
    icon: '🪡',
    watts: 150,
    hoursPerDay: 8,
    kwhPerDay: 1.2,
    note: 'Business hrs',
    category: 'Business',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'cold_room',
    label: 'Cold Room / Walk-in Freezer',
    icon: '🏭',
    watts: 2000,
    hoursPerDay: 24,
    kwhPerDay: 24.0,
    note: 'Always on',
    category: 'Business',
    maxQuantity: 10,
    quantity: 0,
  },

  // ── MEDICAL / SPECIAL ─────────────────────────────────────────────────
  {
    id: 'oxygen_concentrator',
    label: 'Oxygen Concentrator',
    icon: '🏥',
    watts: 300,
    hoursPerDay: 8,
    kwhPerDay: 2.4,
    note: '8hrs/day',
    category: 'Medical',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'cpap',
    label: 'CPAP Machine (sleep apnea)',
    icon: '😴',
    watts: 30,
    hoursPerDay: 8,
    kwhPerDay: 0.24,
    note: '8hrs/night',
    category: 'Medical',
    maxQuantity: 10,
    quantity: 0,
  },
  {
    id: 'nebulizer',
    label: 'Nebulizer / Medical Equipment',
    icon: '💊',
    watts: 150,
    hoursPerDay: 0.5,
    kwhPerDay: 0.08,
    note: 'As needed',
    category: 'Medical',
    maxQuantity: 10,
    quantity: 0,
  },
];

// ── STEP 1: Peak sun hours by state ──────────────────────
const PEAK_SUN_HOURS: Record<string, number> = {
  'Lagos': 4.0,
  'Federal Capital Territory': 5.0,
  'Rivers': 3.8,
  'Kano': 5.5,
  'Oyo': 4.5,
  'Kaduna': 5.0,
  'Enugu': 4.2,
  'Edo': 4.0,
  'Delta': 4.0,
  'Anambra': 4.2,
  'Imo': 4.0,
  'Abia': 4.0,
  'Akwa Ibom': 3.8,
  'Cross River': 3.8,
  'Bayelsa': 3.8,
  'Ogun': 4.2,
  'Osun': 4.5,
  'Ekiti': 4.5,
  'Ondo': 4.2,
  'Kwara': 4.8,
  'Kogi': 4.8,
  'Benue': 4.8,
  'Plateau': 5.0,
  'Nasarawa': 5.0,
  'Niger': 5.2,
  'Sokoto': 6.0,
  'Kebbi': 5.8,
  'Zamfara': 5.5,
  'Katsina': 5.5,
  'Jigawa': 5.5,
  'Adamawa': 5.0,
  'Taraba': 4.8,
  'Gombe': 5.2,
  'Bauchi': 5.2,
  'Borno': 5.5,
  'Yobe': 5.5,
  'Ebonyi': 4.2,
};
const DEFAULT_PEAK_SUN = 4.5;

// ── STEP 2: DISCO tariff per kWh (₦) ─────────────────────
// Based on NERC Band A rates (updated 2025)
export const DISCO_BY_STATE: Record<string, string> = {
  'Lagos': 'IKEDC (Ikeja Electric) / EKEDC (Eko Electric)',
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
  'Kaduna': 'KEDC (Kaduna Electric)',
  'Katsina': 'KEDC (Kaduna Electric)',
  'Zamfara': 'KEDC (Kaduna Electric)',
  'Kebbi': 'KEDC (Kaduna Electric)',
  'Sokoto': 'KEDC (Kaduna Electric)',
  'Kano': 'JEDC (Kano Electric)',
  'Jigawa': 'JEDC (Kano Electric)',
  'Niger': 'AEDC (Abuja Electric)',
  'Nasarawa': 'AEDC (Abuja Electric)',
  'Kogi': 'AEDC (Abuja Electric)',
  'Plateau': 'AEDC (Abuja Electric)',
  'Benue': 'AEDC (Abuja Electric)',
  'Kwara': 'AEDC (Abuja Electric)',
  'Oyo': 'IBEDC (Ibadan Electric)',
  'Ogun': 'IBEDC (Ibadan Electric)',
  'Osun': 'IBEDC (Ibadan Electric)',
  'Adamawa': 'YEDC (Yola Electric)',
  'Taraba': 'YEDC (Yola Electric)',
  'Gombe': 'YEDC (Yola Electric)',
  'Bauchi': 'YEDC (Yola Electric)',
  'Borno': 'YEDC (Yola Electric)',
  'Yobe': 'YEDC (Yola Electric)',
};

const DEFAULT_TARIFF = 200;

// ── STEP 4: Equipment cost bands (₦) ─────────────────────
// Low / Median / High — Lagos market rates 2025/2026
const PANEL_COST_PER_KWP: CostBand = { low: 150000, mid: 200000, high: 260000 };
const INVERTER_COST: Record<string, CostBand> = {
  '1.5KVA': { low: 200000,  mid: 280000,  high: 400000  },
  '2KVA':   { low: 250000,  mid: 350000,  high: 500000  },
  '3KVA':   { low: 350000,  mid: 500000,  high: 700000  },
  '5KVA':   { low: 500000,  mid: 750000,  high: 1000000 },
  '10KVA':  { low: 1000000, mid: 1400000, high: 2000000 },
  '15KVA':  { low: 1500000, mid: 2000000, high: 3000000 },
};
const BATTERY_LEAD_ACID_PER_KWH: CostBand = { low: 80000,  mid: 110000, high: 140000 };
const BATTERY_LITHIUM_PER_KWH: CostBand   = { low: 280000, mid: 380000, high: 500000 };
const BOS_FACTOR    = 0.18;  // Balance of system = 18% of equipment
const INSTALL_COST: CostBand = { low: 60000, mid: 100000, high: 180000 };

// ── STEP 5: Maintenance & replacement ─────────────────────
const ANNUAL_OM_PERCENT            = 0.02;  // 2% of system cost per year
const LEAD_ACID_REPLACEMENT_YEARS  = 3;
const LITHIUM_REPLACEMENT_YEARS    = 8;
export const PETROL_PRICE_PER_LITRE = 1000;  // ₦/L — update monthly
const GEN_MONTHLY_MAINTENANCE       = 15000; // ₦/month avg


export const ROOF_TYPE_FACTORS: Record<RoofType, { mountingCost: number, efficiencyBonus: number }> = {
  'flat_concrete':  { mountingCost: 0,      efficiencyBonus: 0.05 },
  'corrugated_iron': { mountingCost: 15000,  efficiencyBonus: 0 },
  'aluminum_deck':   { mountingCost: 20000,  efficiencyBonus: 0 },
  'clay_tiles':      { mountingCost: 35000,  efficiencyBonus: 0 },
  'not_sure':        { mountingCost: 20000,  efficiencyBonus: 0 },
};

export function calculateSolarSystem(inputs: CalculatorInputs): CalculatorResults {
  const {
    state, monthlyBill, generatorSpend,
    appliances, coveragePct, autonomyDays, batteryType,
    roofType, shadeObstruction,
    fuelInflation, nepaInflation
  } = inputs;

  const peakSunHours = PEAK_SUN_HOURS[state] ?? DEFAULT_PEAK_SUN;

  // 1. Daily kWh from NEPA bill
  const tariff = DEFAULT_TARIFF;
  const dailyKwhFromBill = monthlyBill / (tariff * 30);

  // 2. Daily kWh from appliances (if selected)
  const dailyKwhFromAppliances = appliances.reduce((sum, appSelection) => {
    const appDef = APPLIANCES.find(a => a.id === appSelection.id);
    return sum + (appDef ? appDef.kwhPerDay * appSelection.qty : 0);
  }, 0);

  // Use appliance total if entered, fallback to bill-derived
  const baseDailyKwh = dailyKwhFromAppliances > 0
    ? dailyKwhFromAppliances
    : dailyKwhFromBill;

  // 3. Adjust for coverage percentage
  const targetDailyKwh = baseDailyKwh * (coveragePct / 100);

  // 4. PV array size (kWp)
  const roofFactor = ROOF_TYPE_FACTORS[roofType] ?? ROOF_TYPE_FACTORS['not_sure'];
  const shadeFactor = 1 - (shadeObstruction / 100);
  const systemEfficiency = 0.80 * (1 + roofFactor.efficiencyBonus) * shadeFactor;
  
  const pvKwp = targetDailyKwh / (peakSunHours * systemEfficiency);
  const pvKwpRounded = Math.ceil(pvKwp * 2) / 2;  // round to nearest 0.5
  const panelsNeeded = Math.ceil((pvKwpRounded * 1000) / 400);

  // 5. Battery capacity (kWh)
  const dod = batteryType === 'lithium' ? 0.80 : 0.50;
  const batteryKwh = autonomyDays > 0
    ? (targetDailyKwh * autonomyDays) / dod
    : 0;
  const batteryKwhRounded = Math.ceil(batteryKwh);

  // 6. Inverter size (kVA) — peak load estimate
  const peakLoadKw = baseDailyKwh * 0.5;  // rough peak = 50% of daily total
  const inverterKva = Math.ceil(peakLoadKw / 0.8);  // power factor
  const inverterSize = getInverterSize(inverterKva);

  // 7. Equipment costs
  const panelCost: CostBand = {
    low:  pvKwpRounded * PANEL_COST_PER_KWP.low,
    mid:  pvKwpRounded * PANEL_COST_PER_KWP.mid,
    high: pvKwpRounded * PANEL_COST_PER_KWP.high,
  };

  const invCost: CostBand = INVERTER_COST[inverterSize] ?? INVERTER_COST['5KVA'];

  const batCostPerKwh = batteryType === 'lithium'
    ? BATTERY_LITHIUM_PER_KWH
    : BATTERY_LEAD_ACID_PER_KWH;

  const batteryCost: CostBand = {
    low:  batteryKwhRounded * batCostPerKwh.low,
    mid:  batteryKwhRounded * batCostPerKwh.mid,
    high: batteryKwhRounded * batCostPerKwh.high,
  };

  // 8. Total system cost (panels + inverter + batteries + BOS + install + mounting)
  const equipmentLow  = panelCost.low  + invCost.low  + batteryCost.low;
  const equipmentMid  = panelCost.mid  + invCost.mid  + batteryCost.mid;
  const equipmentHigh = panelCost.high + invCost.high + batteryCost.high;

  const mountingCostAmt = roofFactor.mountingCost * panelsNeeded;
  const mountingCost: CostBand = { low: mountingCostAmt, mid: mountingCostAmt, high: mountingCostAmt };

  const totalCost: CostBand = {
    low:  Math.round((equipmentLow  * (1 + BOS_FACTOR) + INSTALL_COST.low + mountingCost.low)  / 1000) * 1000,
    mid:  Math.round((equipmentMid  * (1 + BOS_FACTOR) + INSTALL_COST.mid + mountingCost.mid)  / 1000) * 1000,
    high: Math.round((equipmentHigh * (1 + BOS_FACTOR) + INSTALL_COST.high + mountingCost.high) / 1000) * 1000,
  };

  // 9. Generator & NEPA savings calculation
  const totalMonthlyGenCost = generatorSpend + GEN_MONTHLY_MAINTENANCE;
  const monthlySolarOM      = (totalCost.mid * ANNUAL_OM_PERCENT) / 12;
  const monthlySavings      = Math.max(0, totalMonthlyGenCost + monthlyBill - monthlySolarOM); // Saving both gen & nepa depending on coverage

  // 10. Payback period (months)
  const paybackMonths = monthlySavings > 0
    ? Math.round(totalCost.mid / monthlySavings)
    : 0;

  // 11. 5-year and 10-year savings with inflation
  const batteryReplacement = batteryType === 'lithium'
    ? (5 >= LITHIUM_REPLACEMENT_YEARS ? batteryCost.mid : 0)
    : (5 >= LEAD_ACID_REPLACEMENT_YEARS ? batteryCost.mid : 0);

  const batteryReplacement10Yr = batteryType === 'lithium'
    ? (10 >= LITHIUM_REPLACEMENT_YEARS ? batteryCost.mid : 0)
    : (batteryCost.mid * 3); // 3 replacements for lead-acid in 10 yrs

  let fiveYearSavings = 0;
  let tenYearSavings = 0;
  
  for (let year = 1; year <= 10; year++) {
    // Apply inflation to savings
    const inflatedGenSavings = totalMonthlyGenCost * 12 * Math.pow(1 + fuelInflation / 100, year);
    const inflatedNepaSavings = (monthlyBill * (coveragePct/100)) * 12 * Math.pow(1 + nepaInflation / 100, year);
    
    const yearNet = inflatedGenSavings + inflatedNepaSavings - (monthlySolarOM * 12);
    
    if (year <= 5) fiveYearSavings += yearNet;
    tenYearSavings += yearNet;
  }
  
  fiveYearSavings = Math.max(0, fiveYearSavings - batteryReplacement);
  tenYearSavings = Math.max(0, tenYearSavings - batteryReplacement10Yr);

  // 12. CO2 saved (kg) — 0.43 kg CO2 per kWh generator equivalent
  const co2SavedKgPerYear = Math.round(targetDailyKwh * 365 * 0.43);

  // 13. Monthly Arrays
  const pshArray = MONTHLY_PSH[state] ?? DEFAULT_MONTHLY_PSH;
  const monthlyProductionArray = pshArray.map(h => pvKwpRounded * h * 30 * systemEfficiency);
  const monthlyUsageArray = Array(12).fill(baseDailyKwh * 30);
  const annualKwhProduced = monthlyProductionArray.reduce((a,b)=>a+b, 0);

  // 14. LCOE
  const genLcoe = Math.round((totalMonthlyGenCost) / (baseDailyKwh * 30));
  const solarLcoe = Math.round(totalCost.mid / (annualKwhProduced * 25)); // over 25 yrs

  return {
    systemSize: {
      pvKwp:       pvKwpRounded,
      inverterKva,
      inverterSize,
      batteryKwh:  batteryKwhRounded,
      batteryType,
      panelsNeeded
    },
    costs: totalCost,
    costBreakdown: {
      panels:    panelCost,
      inverter:  invCost,
      batteries: batteryCost,
      bos: {
        low:  equipmentLow  * BOS_FACTOR,
        mid:  equipmentMid  * BOS_FACTOR,
        high: equipmentHigh * BOS_FACTOR,
      },
      install: INSTALL_COST,
      mounting: mountingCost
    },
    savings: {
      monthlySavings,
      monthlyGenCostNow: totalMonthlyGenCost,
      monthlySolarCost:  monthlySolarOM,
      paybackMonths,
      paybackYears: (paybackMonths / 12).toFixed(1),
      fiveYearSavings: Math.round(fiveYearSavings),
      tenYearSavings: Math.round(tenYearSavings),
      nepaTariffAvoided: Math.round((monthlyBill * (coveragePct/100)))
    },
    usage: {
      dailyKwh:       baseDailyKwh.toFixed(1),
      targetDailyKwh: targetDailyKwh.toFixed(1),
      coveragePct,
      autonomyDays,
      peakSunHours,
      monthlyUsageArray,
      monthlyProductionArray
    },
    environmental: {
      co2SavedKgPerYear,
      co2SavedTonnesPerYear: (co2SavedKgPerYear / 1000).toFixed(2),
    },
    advanced: {
      annualKwhProduced: Math.round(annualKwhProduced),
      genEquivalentReplaced: Math.round(targetDailyKwh * 365),
      systemEfficiency: Math.round(systemEfficiency * 100),
      lcoeSolar: solarLcoe,
      lcoeGen: genLcoe
    }
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
