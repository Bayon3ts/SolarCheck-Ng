/* ═══════════════════════════════════════════════════ */
/* SolarCheck Nigeria — Cable Sizing Engine             */
/* Copper cable gauge selection by ampacity              */
/* Source: IEC 60364-5-52 ampacity tables, standard      */
/* Nigerian market copper cable sizes, June 2026          */
/* ═══════════════════════════════════════════════════ */

export interface CableSpec {
  label: string;           // e.g. "Battery to Inverter"
  gaugeMm2: number;        // e.g. 50 (mm²)
  ratedAmps: number;       // e.g. 91 (A) — ampacity of the chosen gauge
  requiredAmps: number;    // the actual current this cable must carry
  runLengthM: number;      // assumed/estimated run length in metres
  voltageDropPct: number;  // estimated voltage drop over that run
  material: 'Copper';      // always copper — never recommend aluminium for solar
  costPerMeterNaira: { min: number; max: number };
  totalCostNaira: { min: number; max: number };
  warning?: string;        // e.g. voltage drop exceeds 3% recommended max
}

// ── Standard copper cable ampacity table (IEC 60364-5-52, free air, ≤30°C) ──
// gauge (mm²) → rated ampacity (A) for single-core PVC insulated copper cable
const COPPER_AMPACITY_TABLE: { gaugeMm2: number; ratedAmps: number }[] = [
  { gaugeMm2: 1.5, ratedAmps: 17.5 },
  { gaugeMm2: 2.5, ratedAmps: 24 },
  { gaugeMm2: 4, ratedAmps: 32 },
  { gaugeMm2: 6, ratedAmps: 41 },
  { gaugeMm2: 10, ratedAmps: 57 },
  { gaugeMm2: 16, ratedAmps: 76 },
  { gaugeMm2: 25, ratedAmps: 101 },
  { gaugeMm2: 35, ratedAmps: 125 },
  { gaugeMm2: 50, ratedAmps: 151 },
  { gaugeMm2: 70, ratedAmps: 192 },
  { gaugeMm2: 95, ratedAmps: 232 },
  { gaugeMm2: 120, ratedAmps: 269 },
];

// Nigerian retail copper cable price per metre, June 2026 (min = budget brand, max = premium)
const COPPER_COST_PER_METER: Record<number, { min: number; max: number }> = {
  1.5: { min: 350, max: 550 },
  2.5: { min: 550, max: 850 },
  4: { min: 850, max: 1300 },
  6: { min: 1250, max: 1900 },
  10: { min: 2000, max: 3000 },
  16: { min: 3200, max: 4800 },
  25: { min: 5000, max: 7500 },
  35: { min: 7000, max: 10500 },
  50: { min: 9500, max: 14500 },
  70: { min: 13500, max: 20000 },
  95: { min: 18000, max: 27000 },
  120: { min: 23000, max: 34000 },
};

/**
 * Picks the smallest standard copper gauge whose rated ampacity meets or
 * exceeds the required current, applying a safety margin.
 */
function selectGauge(requiredAmps: number, safetyMarginPct: number = 25): { gaugeMm2: number; ratedAmps: number } {
  const targetAmps = requiredAmps * (1 + safetyMarginPct / 100);
  for (const entry of COPPER_AMPACITY_TABLE) {
    if (entry.ratedAmps >= targetAmps) return entry;
  }
  // Beyond table range — return largest and let voltage-drop warning flag it
  return COPPER_AMPACITY_TABLE[COPPER_AMPACITY_TABLE.length - 1];
}

/**
 * Estimates % voltage drop for a DC run given current, length, gauge, and voltage.
 * Uses standard copper resistivity (ρ = 0.0175 Ω·mm²/m) for a round-trip run.
 */
function estimateVoltageDropPct(
  amps: number,
  lengthM: number,
  gaugeMm2: number,
  systemVoltage: number
): number {
  const RESISTIVITY = 0.0175; // Ω·mm²/m for copper at ~20°C
  const roundTripLength = lengthM * 2; // out and back
  const resistanceOhms = (RESISTIVITY * roundTripLength) / gaugeMm2;
  const voltageDropV = amps * resistanceOhms;
  return (voltageDropV / systemVoltage) * 100;
}

function buildCableSpec(
  label: string,
  requiredAmps: number,
  runLengthM: number,
  systemVoltage: number,
  safetyMarginPct: number = 25
): CableSpec {
  const { gaugeMm2, ratedAmps } = selectGauge(requiredAmps, safetyMarginPct);
  const voltageDropPct = estimateVoltageDropPct(requiredAmps, runLengthM, gaugeMm2, systemVoltage);
  const costPerMeter = COPPER_COST_PER_METER[gaugeMm2] ?? { min: 0, max: 0 };

  let warning: string | undefined;
  if (voltageDropPct > 3) {
    warning = `Voltage drop ~${voltageDropPct.toFixed(1)}% exceeds the recommended 3% max at ${runLengthM}m — consider a shorter run or the next gauge up.`;
  }

  return {
    label,
    gaugeMm2,
    ratedAmps,
    requiredAmps: Math.round(requiredAmps * 10) / 10,
    runLengthM,
    voltageDropPct: Math.round(voltageDropPct * 10) / 10,
    material: 'Copper',
    costPerMeterNaira: costPerMeter,
    totalCostNaira: {
      min: Math.round(costPerMeter.min * runLengthM),
      max: Math.round(costPerMeter.max * runLengthM),
    },
    warning,
  };
}

export interface CableSizingInput {
  batteryVoltage: 12 | 24 | 48;
  inverterKva: number;
  totalPanelWatts: number;
  mpptAmps: number; // from existing charge controller sizing
  /** Estimated run lengths in metres — defaults are typical for a residential install */
  batteryToInverterM?: number;
  panelsToMpptM?: number;
  inverterToDbM?: number;
}

export interface FullCableSpecReport {
  batteryToInverter: CableSpec;
  panelsToMppt: CableSpec;
  inverterToDb: CableSpec;
  earthing: {
    label: string;
    gaugeMm2: number;
    color: string;
    note: string;
  };
  totalCableCostNaira: { min: number; max: number };
  copperOnlyWarning: string;
}

/**
 * Builds the full 4-cable Market Spec Report: Battery↔Inverter, Panels↔MPPT,
 * Inverter↔DB Board, and Earth/Grounding — matching the format installers use.
 */
export function buildCableSpecReport(input: CableSizingInput): FullCableSpecReport {
  const {
    batteryVoltage,
    inverterKva,
    totalPanelWatts,
    mpptAmps,
    batteryToInverterM = 1.5, // battery bank is normally right next to the inverter
    panelsToMpptM = 15,       // typical roof-to-inverter-room run
    inverterToDbM = 5,        // typical inverter-to-distribution-board run
  } = input;

  // Battery to Inverter: DC current = inverter VA / battery voltage
  const batteryInverterAmps = (inverterKva * 1000) / batteryVoltage;
  const batteryToInverter = buildCableSpec(
    'Battery to Inverter',
    batteryInverterAmps,
    batteryToInverterM,
    batteryVoltage,
    25 // 25% safety margin — high-current short run, standard practice
  );

  // Panels to MPPT: use the MPPT's rated amperage directly (already includes its own margin)
  const panelsToMppt = buildCableSpec(
    'Solar Panels to MPPT',
    mpptAmps,
    panelsToMpptM,
    batteryVoltage,
    10 // MPPT input current is already a rated spec, smaller extra margin needed
  );

  // Inverter to DB Board: AC output current = inverter VA / 230V (single-phase Nigerian mains)
  const inverterAcAmps = (inverterKva * 1000) / 230;
  const inverterToDb = buildCableSpec(
    'Inverter to DB Board',
    inverterAcAmps,
    inverterToDbM,
    230,
    25
  );

  const totalMin = batteryToInverter.totalCostNaira.min + panelsToMppt.totalCostNaira.min + inverterToDb.totalCostNaira.min;
  const totalMax = batteryToInverter.totalCostNaira.max + panelsToMppt.totalCostNaira.max + inverterToDb.totalCostNaira.max;

  return {
    batteryToInverter,
    panelsToMppt,
    inverterToDb,
    earthing: {
      label: 'Earth/Grounding',
      gaugeMm2: 6,
      color: 'Green/Yellow',
      note: 'Mandatory on every installation — protects against electric shock and lightning-induced surges.',
    },
    totalCableCostNaira: { min: totalMin, max: totalMax },
    copperOnlyWarning: 'Copper cables only. Never use aluminium for solar systems — aluminium has ~60% the conductivity of copper, oxidizes at connection points, and is a documented fire risk in DC battery circuits.',
  };
}