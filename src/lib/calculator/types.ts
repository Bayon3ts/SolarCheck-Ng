/* ═══════════════════════════════════════════════════ */
/* SolarCheck Nigeria — Calculator Types               */
/* ═══════════════════════════════════════════════════ */

export type BatteryType = 'lithium' | 'lead-acid';
export type PropertyType = 'home' | 'small-business' | 'large-business';
export type OwnershipStatus = 'owner' | 'tenant';
export type RoofType = 'flat_concrete' | 'corrugated_iron' | 'aluminum_deck' | 'clay_tiles' | 'not_sure';
export type RoofDirection = 'North' | 'North-East' | 'East' | 'South-East' | 'South' | 'South-West' | 'West' | 'North-West';
export type RoofPitch = 'Flat (0°)' | 'Low (10-15°)' | 'Medium (20-30°)' | 'Steep (35-45°)';

export interface ApplianceSelection {
  id: string;
  qty: number;
}

export interface CalculatorInputs {
  // Screen 1 equivalents
  ownershipStatus: OwnershipStatus;
  state: string;
  monthlyBill: number;
  generatorSpend: number;

  // Screen 2 equivalents
  propertyType: PropertyType;
  roofType: RoofType;
  roofDirection: RoofDirection;
  roofPitch: RoofPitch;
  coveragePct: number;        // 50 to 100
  
  appliances: ApplianceSelection[]; // array of appliance selections with qty

  // Assumptions
  shadeObstruction: number;
  panelDegradation: number;
  fuelInflation: number;
  nepaInflation: number;
  discountRate: number;
  
  // Advanced Battery Scenarios
  batteryScenario: 'surplus' | 'overnight' | 'specific' | 'none';
  batteryType: BatteryType;
  autonomyDays: number; // For generic calculation
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
    panelsNeeded: number;
  };
  costs: CostBand;
  costBreakdown: {
    panels:    CostBand;
    inverter:  CostBand;
    batteries: CostBand;
    bos:       CostBand;
    install:   CostBand;
    mounting:  CostBand;
  };
  savings: {
    monthlySavings: number;
    monthlyGenCostNow: number;
    monthlySolarCost: number;
    paybackMonths: number;
    paybackYears: string;
    fiveYearSavings: number;
    tenYearSavings: number;
    nepaTariffAvoided: number;
  };
  usage: {
    dailyKwh: string;
    targetDailyKwh: string;
    coveragePct: number;
    autonomyDays: number;
    peakSunHours: number;
    monthlyUsageArray: number[];
    monthlyProductionArray: number[];
  };
  environmental: {
    co2SavedKgPerYear: number;
    co2SavedTonnesPerYear: string;
  };
  advanced: {
    annualKwhProduced: number;
    genEquivalentReplaced: number;
    systemEfficiency: number;
    lcoeSolar: number;
    lcoeGen: number;
  };
}

export interface LeadCaptureData {
  full_name: string;
  whatsapp: string;
  timeline: string;
  landlord_consent?: boolean;
}
