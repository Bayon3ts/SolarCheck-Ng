export interface ControllerTypeProfile {
  id:                      string;
  label:                   string;
  harvestEffMin:           number; // % of panel STC wattage actually delivered to battery
  harvestEffMax:           number;
  typicalPricePerAmpMin:   number; // ₦ per rated amp, genuine market floor
  typicalPricePerAmpMax:   number;
}

// ── CONTROLLER TYPE PHYSICS ─────────────────
// MPPT controllers actively track the panel's maximum power point and convert excess voltage
// into current — genuine units recover 93-98% of rated panel wattage. PWM controllers simply
// clamp panel voltage down to battery voltage, wasting the difference — even a perfect PWM
// unit only recovers 65-75% of rated panel wattage in real Nigerian conditions (panel Vmp is 
// typically 30-37V vs a 12-24V battery).
export const CONTROLLER_TYPE_PROFILES: Record<string, ControllerTypeProfile> = {
  MPPT: {
    id: 'MPPT',
    label: 'MPPT (Maximum Power Point Tracking)',
    harvestEffMin:         0.93,
    harvestEffMax:         0.98,
    typicalPricePerAmpMin: 1800, // ₦/A — genuine EPever/Renogy floor
    typicalPricePerAmpMax: 4500, // ₦/A — Victron/premium ceiling
  },
  PWM: {
    id: 'PWM',
    label: 'PWM (Pulse Width Modulation)',
    harvestEffMin:         0.65,
    harvestEffMax:         0.75,
    typicalPricePerAmpMin: 350,  // ₦/A
    typicalPricePerAmpMax: 900,  // ₦/A
  },
};

export interface BrandProfile {
  tier: 'premium' | 'reliable' | 'decent' | 'unknown' | 'red_flag';
  trustScoreModifier: number; // subtracted from fraud score for good brands, added for bad signal
}

// ── BRAND REPUTATION TABLE ──────────────────
// Based on documented Nigerian installer market consensus. This is reputation, not a guarantee —
// even premium brands can be counterfeited, which is why brand alone never overrides the physics
// checks below.
export const BRAND_REPUTATION: Record<string, BrandProfile> = {
  'victron':  { tier: 'premium',  trustScoreModifier: -15 },
  'epever':   { tier: 'reliable', trustScoreModifier: -10 },
  'epsolar':  { tier: 'reliable', trustScoreModifier: -10 },
  'renogy':   { tier: 'reliable', trustScoreModifier: -10 },
  'srne':     { tier: 'decent',   trustScoreModifier: -5  },
  'phocos':   { tier: 'reliable', trustScoreModifier: -10 },
  'generic':  { tier: 'unknown',  trustScoreModifier: 10  },
  'unbranded':{ tier: 'red_flag', trustScoreModifier: 20  },
};

export function normalizeBrand(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes('victron'))           return 'victron';
  if (s.includes('epever') || 
      s.includes('epsolar'))           return 'epever';
  if (s.includes('renogy'))            return 'renogy';
  if (s.includes('srne'))              return 'srne';
  if (s.includes('phocos'))            return 'phocos';
  if (s.includes('cheap') || 
      s.includes('no brand') ||
      s.includes('unbranded'))         return 'unbranded';
  return 'generic'; // unrecognized brand name claimed but not in our table — treated as unknown, not automatically red-flagged
}
