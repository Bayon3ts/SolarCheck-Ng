/* ═══════════════════════════════════════════════════ */
/* SolarCheck Nigeria — Cable Sizing Engine             */
/* Copper cable gauge selection by ampacity              */
/* Source: IEC 60364-5-52 ampacity tables, standard      */
/* Nigerian market copper cable sizes, June 2026          */
/* ═══════════════════════════════════════════════════ */

export interface CableSpec {
  label: string;
  totalPowerW: number;
  voltageV: number;
  calculatedAmps: number;
  gaugeMm2: number;
  systemType: 'DC' | 'AC Single Phase' | 'AC Three Phase';
  material: 'Copper';
  pricePerMeterNaira: { min: number; max: number };
  runLengthM?: number;
  totalCostNaira?: { min: number; max: number };
}

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

function selectGauge(amps: number): number {
  if (amps < 10) return 2.5;
  if (amps < 20) return 4;
  if (amps < 30) return 6;
  if (amps < 40) return 10;
  if (amps < 60) return 16;
  if (amps < 80) return 25;
  if (amps < 120) return 35;
  if (amps < 150) return 50;
  return 70; // Max allowed by spec up to 200A
}

function buildCableSpec(
  label: string,
  totalPowerW: number,
  voltageV: number,
  systemType: 'DC' | 'AC Single Phase' | 'AC Three Phase',
  runLengthM?: number
): CableSpec {
  if (totalPowerW == null || voltageV == null || !systemType) {
    throw new Error('Missing required inputs for cable sizing validation.');
  }

  const calculatedAmps = totalPowerW / voltageV;
  const gaugeMm2 = selectGauge(calculatedAmps);
  const pricePerMeter = COPPER_COST_PER_METER[gaugeMm2] ?? { min: 0, max: 0 };
  
  let totalCostNaira: { min: number; max: number } | undefined;
  if (runLengthM != null) {
    totalCostNaira = {
      min: Math.round(pricePerMeter.min * runLengthM),
      max: Math.round(pricePerMeter.max * runLengthM),
    };
  }

  return {
    label,
    totalPowerW,
    voltageV,
    calculatedAmps: Math.round(calculatedAmps * 10) / 10,
    gaugeMm2,
    systemType,
    material: 'Copper',
    pricePerMeterNaira: pricePerMeter,
    runLengthM,
    totalCostNaira,
  };
}

export interface CableSizingInput {
  batteryVoltage: 12 | 24 | 48;
  inverterKva: number;
  totalPanelWatts: number;
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
    material: 'Copper';
    note: string;
    pricePerMeterNaira: { min: number; max: number };
  };
  installerWarning: string;
  copperOnlyWarning: string;
  costWarning?: string;
  totalEstimatedCostNaira?: { min: number; max: number };
}

export function buildCableSpecReport(input: CableSizingInput): FullCableSpecReport {
  const { batteryVoltage, inverterKva, totalPanelWatts, batteryToInverterM, panelsToMpptM, inverterToDbM } = input;

  if (batteryVoltage == null || inverterKva == null || totalPanelWatts == null) {
    throw new Error('Missing required inputs for cable sizing calculation. System voltage and power must be verified.');
  }

  // Battery to Inverter
  const batteryToInverter = buildCableSpec(
    'Battery to Inverter',
    inverterKva * 1000,
    batteryVoltage,
    'DC',
    batteryToInverterM
  );

  // Panels to MPPT
  const panelsToMppt = buildCableSpec(
    'Solar Panels to MPPT',
    totalPanelWatts,
    batteryVoltage,
    'DC',
    panelsToMpptM
  );

  // Inverter to DB Board
  const inverterToDb = buildCableSpec(
    'Inverter to DB Board',
    inverterKva * 1000,
    230, // Using 230V Single Phase
    'AC Single Phase',
    inverterToDbM
  );

  const earthPrice = COPPER_COST_PER_METER[6];
  
  let costWarning: string | undefined = undefined;
  let totalEstimatedCostNaira: { min: number; max: number } | undefined = undefined;

  if (batteryToInverter.totalCostNaira && panelsToMppt.totalCostNaira && inverterToDb.totalCostNaira) {
    totalEstimatedCostNaira = {
      min: batteryToInverter.totalCostNaira.min + panelsToMppt.totalCostNaira.min + inverterToDb.totalCostNaira.min,
      max: batteryToInverter.totalCostNaira.max + panelsToMppt.totalCostNaira.max + inverterToDb.totalCostNaira.max,
    };
  } else {
    costWarning = 'Total cable cost depends on installation length (to be confirmed by installer).';
  }

  return {
    batteryToInverter,
    panelsToMppt,
    inverterToDb,
    earthing: {
      label: 'Earth/Grounding',
      gaugeMm2: 6,
      color: 'Green/Yellow',
      material: 'Copper',
      pricePerMeterNaira: earthPrice,
      note: 'Earth/Grounding (6 mm² Green/Yellow) is mandatory on every installation — protects against electric shock and lightning-induced surges.',
    },
    installerWarning: 'Cable length and voltage drop must be verified by the installer.',
    copperOnlyWarning: 'Copper cables ONLY. Aluminium is strictly prohibited. Aluminium has ~60% conductivity of copper, is prone to oxidation at terminals, and poses a high fire risk, especially in DC battery systems.',
    costWarning,
    totalEstimatedCostNaira,
  };
}