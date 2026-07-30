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
  systemType: 'DC' | 'AC single-phase' | 'AC three-phase';
}

function selectGauge(amps: number): number {
  if (amps < 10) return 2.5;
  if (amps < 20) return 4;
  if (amps < 30) return 6;
  if (amps < 40) return 10;
  if (amps < 60) return 16;
  if (amps < 80) return 25;
  if (amps < 120) return 35;
  if (amps < 150) return 50;
  return 70;
}

function buildCableSpec(
  label: string,
  totalPowerW: number,
  voltageV: number,
  systemType: 'DC' | 'AC single-phase' | 'AC three-phase'
): CableSpec {
  if (totalPowerW == null || voltageV == null || !systemType) {
    throw new Error('Missing required inputs for cable sizing validation.');
  }

  const calculatedAmps = totalPowerW / voltageV;
  const gaugeMm2 = selectGauge(calculatedAmps);

  return {
    label,
    totalPowerW,
    voltageV,
    calculatedAmps: Math.round(calculatedAmps * 10) / 10,
    gaugeMm2,
    systemType,
  };
}

export interface CableSizingInput {
  batteryVoltage: 12 | 24 | 48;
  inverterKva: number;
  totalPanelWatts: number;
  mpptAmps?: number;
}

export interface FullCableSpecReport {
  batteryToInverter: CableSpec;
  panelsToMppt: CableSpec;
  inverterToDb: CableSpec;
  installerWarning: string;
}

export function buildCableSpecReport(input: CableSizingInput): FullCableSpecReport {
  const { batteryVoltage, inverterKva, totalPanelWatts } = input;

  if (batteryVoltage == null || inverterKva == null || totalPanelWatts == null) {
    throw new Error('Missing required inputs for cable sizing calculation.');
  }

  // Battery to Inverter
  const batteryToInverter = buildCableSpec(
    'Battery to Inverter',
    inverterKva * 1000,
    batteryVoltage,
    'DC'
  );

  // Panels to MPPT
  const panelsToMppt = buildCableSpec(
    'Solar Panels to MPPT',
    totalPanelWatts,
    batteryVoltage,
    'DC'
  );

  // Inverter to DB Board
  const inverterToDb = buildCableSpec(
    'Inverter to DB Board',
    inverterKva * 1000,
    230,
    'AC single-phase'
  );

  return {
    batteryToInverter,
    panelsToMppt,
    inverterToDb,
    installerWarning: 'Cable length and voltage drop must be verified by the installer.',
  };
}