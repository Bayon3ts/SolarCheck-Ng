export interface ChemistryProfile {
  id:                    string;
  label:                 string;
  realisticDodMin:       number; // %
  realisticDodMax:       number; // %
  realisticDodFraudFlag: number; // % — above this = fraud
  realisticRtEffMin:     number; // %
  realisticRtEffMax:     number; // %
  realisticWhPerKgMin:   number; // energy density
  realisticWhPerKgMax:   number;
  typicalCycleLifeMin:   number;
  typicalCycleLifeMax:   number;
}

// ── PHYSICS REFERENCE TABLE ─────────────────
// Sourced from manufacturer datasheets (CATL,
// BYD, Trojan, Narada) and IEC 62619 / IEC 61427
// battery testing standards.
export const CHEMISTRY_PROFILES: Record<string, ChemistryProfile> = {
  LFP: {
    id: 'LFP',
    label: 'Lithium Iron Phosphate',
    realisticDodMin:       80,
    realisticDodMax:       90,
    realisticDodFraudFlag: 95, // claims above this are fraud
    realisticRtEffMin:     90,
    realisticRtEffMax:     96,
    realisticWhPerKgMin:   90,
    realisticWhPerKgMax:   160,
    typicalCycleLifeMin:   3000,
    typicalCycleLifeMax:   8000,
  },

  NMC: {
    id: 'NMC',
    label: 'Lithium NMC',
    realisticDodMin:       80,
    realisticDodMax:       90,
    realisticDodFraudFlag: 95,
    realisticRtEffMin:     88,
    realisticRtEffMax:     95,
    realisticWhPerKgMin:   150,
    realisticWhPerKgMax:   220,
    typicalCycleLifeMin:   1000,
    typicalCycleLifeMax:   2500,
  },

  FLOODED_LEAD_ACID: {
    id: 'FLOODED_LEAD_ACID',
    label: 'Flooded Lead-Acid',
    realisticDodMin:       40,
    realisticDodMax:       50,
    realisticDodFraudFlag: 60,
    realisticRtEffMin:     70,
    realisticRtEffMax:     85,
    realisticWhPerKgMin:   25,
    realisticWhPerKgMax:   40,
    typicalCycleLifeMin:   300,
    typicalCycleLifeMax:   800,
  },

  AGM: {
    id: 'AGM',
    label: 'Sealed AGM Lead-Acid',
    realisticDodMin:       50,
    realisticDodMax:       60,
    realisticDodFraudFlag: 70,
    realisticRtEffMin:     75,
    realisticRtEffMax:     88,
    realisticWhPerKgMin:   30,
    realisticWhPerKgMax:   45,
    typicalCycleLifeMin:   400,
    typicalCycleLifeMax:   1200,
  },

  GEL: {
    id: 'GEL',
    label: 'Gel Lead-Acid',
    realisticDodMin:       50,
    realisticDodMax:       60,
    realisticDodFraudFlag: 70,
    realisticRtEffMin:     75,
    realisticRtEffMax:     88,
    realisticWhPerKgMin:   30,
    realisticWhPerKgMax:   40,
    typicalCycleLifeMin:   500,
    typicalCycleLifeMax:   1500,
  },
};

export function normalizeChemistry(raw: string): string {
  const s = raw.toUpperCase();
  if (s.includes('LFP') || s.includes('LITHIUM IRON')) return 'LFP';
  if (s.includes('NMC') || (s.includes('LITHIUM') && !s.includes('IRON'))) return 'NMC';
  if (s.includes('GEL')) return 'GEL';
  if (s.includes('AGM') || s.includes('SEALED')) return 'AGM';
  if (s.includes('FLOODED') || s.includes('LEAD')) return 'FLOODED_LEAD_ACID';
  return 'AGM'; // safer default — an unrecognized chemistry string should NOT inherit lithium's generous DoD/efficiency bounds; AGM's stricter bounds mean an ambiguous claim gets flagged rather than waved through
}
