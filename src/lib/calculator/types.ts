/* ═══════════════════════════════════════════════════ */
/* SolarCheck Nigeria — Calculator Types               */
/* ═══════════════════════════════════════════════════ */


export type SystemMode = 'grid-tied' | 'hybrid' | 'off-grid';

export interface SavingsRange {
  conservative: number;
  expected: number;
  stressCase: number;
}

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
  fuelEfficiency: number; // kWh per liter
  
  systemMode: SystemMode;
  batteryType: BatteryType;
  autonomyDays: number; // 0.5, 1, 2+
  nightLoadPct?: number; // Optional user override, else derived

  // Lagos-specific band selection
  lagosElectricityBand?: string; // e.g. 'band_a', 'band_b', etc.
}

export interface CostBand {
  low: number;
  mid: number;
  high: number;
}


export interface ChargeControllerSpec {
  type: 'MPPT' | 'PWM' | 'None';
  amps: number;
  reason: string;
  estimatedCost: number;
}

export interface DaytimeHeavyAnalysis {
  isDaytimeHeavy: boolean;
  daytimeLoadKw: number;
  nighttimeLoadKw: number;
  daytimeRatio: number;
  recommendedPanelKw: number;
  recommendedNightBatteryKwh: number;
  requiresMultipleMppt: boolean;
  mpptInputsNeeded: number;
  recommendedInverterNote: string;
  panelStringSplit?: string;
}

export interface TruthQAReport {
  score: number;
  pvStatus: 'OPTIMAL' | 'CONSERVATIVE' | 'OVERBUILT' | 'UNDERPOWERED';
  batteryIntegrity: 'PASS' | 'BORDERLINE' | 'FAIL';
  savingsIntegrity: 'PASS' | 'INFLATED' | 'FAIL';
  flags: { pvBias: boolean; savingsBias: boolean; autonomyBias: boolean };
  finalVerdict: 'Physics-Accurate' | 'Installer-Conservative' | 'Marketing-Biased';
  warnings: string[];
}

export interface CalculatorResults {
  // Validity
  isValid: boolean;
  validationError?: string;
  systemStatus: 'PASS' | 'FAIL';

  // Load
  dailyLoadKwh: number;
  peakLoadKw: number;

  // PV Array
  pvKwp: number;
  panelsNeeded: number;
  panelSizeWatts: number;
  avgPSH: number;
  pvClassification: 'UNDER SIZED' | 'OPTIMAL' | 'OVER SIZED';
  seasonalRisk: 'Rainy season stable' | 'Rainy season borderline' | 'Rainy season at risk';
  energyOffsetPct: number;

  // Inverter & Battery
  inverterKva: number;
  batteryKwh: number;
  batteryType: string;
  autonomyHours: number;
  batterySufficiency: 'insufficient' | 'limited' | 'adequate' | 'strong' | 'full';

  // Cost
  systemCostMin: number;
  systemCostMax: number;

  // Savings
  monthlyCurrentSpend: number;
  afterSolarMonthlyCost: number;
  monthlyGridSavings: SavingsRange;
  monthlyGeneratorSavings: SavingsRange;
  paybackMonths: number;
  fiveYearSavings: SavingsRange;
  tenYearSavings: SavingsRange;

  // Monthly production
  monthlyProduction: number[];

  // Grid / DISCO
  discoName: string;
  discoTariff: number;
  selectedBand: 'A' | 'B' | 'C' | 'D' | 'E' | null;

  // Environmental
  co2SavedKgPerYear: number;
  treesEquivalent: number;

  // Sub-analyses
  chargeController: ChargeControllerSpec;
  daytimeAnalysis: DaytimeHeavyAnalysis;
  truthQAReport: TruthQAReport;
}

export interface LeadCaptureData {

  full_name: string;
  whatsapp: string;
  timeline: string;
  landlord_consent?: boolean;
}

