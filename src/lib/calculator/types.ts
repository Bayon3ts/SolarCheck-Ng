/* ═══════════════════════════════════════════════════ */
/* SolarCheck Nigeria — Calculator Types               */
/* ═══════════════════════════════════════════════════ */

export type BatteryType = 'lithium' | 'lead-acid';
export type PropertyType = 'home' | 'small-business' | 'large-business';
export type OwnershipStatus = 'owner' | 'tenant';
export type RoofType = 'flat_concrete' | 'corrugated_iron' | 'aluminum_deck' | 'clay_tiles' | 'not_sure';
export type RoofDirection = 'North' | 'North-East' | 'East' | 'South-East' | 'South' | 'South-West' | 'West' | 'North-West';
export type RoofPitch = 'Flat (0°)' | 'Low (10-15°)' | 'Medium (20-30°)' | 'Steep (35-45°)';

// System tier — mirrors SystemTier in @/data/system-packages to avoid circular dep
export type SystemTier = 'micro' | 'basic' | 'starter' | 'standard' | 'premium';

export interface ApplianceSelection {
  id: string;
  qty: number;
}

export interface CalculatorInputs {
  // System tier (drives appliance filtering & pre-fill)
  systemTier: SystemTier;

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
  
  // Advanced Battery Scenarios
  batteryScenario: 'surplus' | 'overnight' | 'specific' | 'none';
  batteryType: BatteryType;
  autonomyDays: number; // For generic calculation

  // Lagos-specific band selection
  lagosElectricityBand?: string; // e.g. 'band_a', 'band_b', etc.
}

export interface CostBand {
  low: number;
  mid: number;
  high: number;
}

export interface CalculatorResults {
  pvKwp: number;
  panelsNeeded: number;
  panelSizeWatts: number;
  inverterKva: number;
  batteryKwh: number;
  batteryType: BatteryType | 'none';
  systemCostMin: number;
  systemCostMax: number;
  paybackMonths: number;
  fiveYearSavings: number;
  tenYearSavings: number;
  monthlyCurrentSpend: number;
  afterSolarMonthlyCost: number;
  monthlyProduction: number[];
  discoName: string;
  discoTariff: number;
  selectedBand: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  avgPSH: number;
  co2SavedKgPerYear: number;
  treesEquivalent: number;
}

export interface LeadCaptureData {
  full_name: string;
  whatsapp: string;
  timeline: string;
  landlord_consent?: boolean;
}
