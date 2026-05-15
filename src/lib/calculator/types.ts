/* ═══════════════════════════════════════════════════ */
/* SolarCheck Nigeria — Calculator Types               */
/* ═══════════════════════════════════════════════════ */

export type BatteryType = 'lithium' | 'lead-acid';
export type PropertyType = 'home' | 'small-business' | 'large-business';

export interface CalculatorInputs {
  // Screen 1
  state: string;
  monthlyBill: number;
  generatorSpend: number;

  // Screen 2
  propertyType: PropertyType;
  appliances: string[];       // array of appliance IDs
  coveragePct: number;        // 50 | 75 | 100
  autonomyDays: number;       // 0 | 1 | 2 | 3
  batteryType: BatteryType;
}

export interface CostBand {
  low: number;
  mid: number;
  high: number;
}

export interface CalculatorResults {
  systemSize: {
    pvKwp: number;
    inverterKva: number;
    inverterSize: string;
    batteryKwh: number;
    batteryType: BatteryType;
  };
  costs: CostBand;
  costBreakdown: {
    panels:    CostBand;
    inverter:  CostBand;
    batteries: CostBand;
    bos:       CostBand;
    install:   CostBand;
  };
  savings: {
    monthlySavings: number;
    monthlyGenCostNow: number;
    monthlySolarCost: number;
    paybackMonths: number;
    paybackYears: string;
    fiveYearSavings: number;
  };
  usage: {
    dailyKwh: string;
    targetDailyKwh: string;
    coveragePct: number;
    autonomyDays: number;
    peakSunHours: number;
  };
  environmental: {
    co2SavedKgPerYear: number;
    co2SavedTonnesPerYear: string;
  };
}

export interface LeadCaptureData {
  full_name: string;
  whatsapp: string;
  timeline: string;
}

// Wizard step
export type WizardStep = 1 | 2 | 3;
