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


export interface CalculatorResults {
  isValid: boolean;
  dailyLoadKwh: number;
  pvKwp: number;
  panelsNeeded: number;
  batteryKwh: number;
  autonomyHours: number;
  systemStatus: 'PASS' | 'FAIL';
  [key: string]: any;
}

export interface LeadCaptureData {

  full_name: string;
  whatsapp: string;
  timeline: string;
  landlord_consent?: boolean;
}
