/* ═══════════════════════════════════════════════════ */
/* SolarCheck Nigeria — Calculator Types               */
/* ═══════════════════════════════════════════════════ */

export type { TruthEnforcementResult, TruthFlag, ConfidenceLevel } from './truth-engine';


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
  dayHours?: number;       // explicit day hours (from engine, if set)
  nightHours?: number;     // explicit night hours (from engine, if set)
  daytimeHours?: number;   // hours set via the UI slider (maps to dayHours in calc engine)
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

/* ── #14: Component Efficiency Breakdown ─────────────────────── */
export interface EfficiencyBreakdown {
  panelLosses: number;       // temperature + dust: ~0.90
  inverterEfficiency: number; // ~0.96
  batteryRoundtrip: number;  // ~0.90 (if battery used, else 1.0)
  wiringLosses: number;      // ~0.97
  directionFactor: number;   // roof orientation
  pitchFactor: number;       // roof pitch
  shadeFactor: number;       // shading
  totalEfficiency: number;   // product of all above
}

/* ── #11: Time-of-Use Energy Flow Model ─────────────────────── */
export interface EnergyFlowModel {
  daytimeLoadKwh: number;       // 6am–6pm load
  nightLoadKwh: number;         // 6pm–6am load
  solarUsedDirectKwh: number;   // min(daytime_load, solar_production)
  excessSolarKwh: number;       // solar_production - solar_used_direct
  batteryChargedKwh: number;    // min(excess × battery_eff, battery_remaining)
  nightSupplyFromBatteryKwh: number; // min(battery_charged, night_load)
  unmetLoadKwh: number;         // remaining deficit
  directSolarPct: number;       // % of total load from direct solar
  batteryPct: number;           // % of total load from battery
  unmetPct: number;             // % unmet (grid/generator)
  batteryInsufficientFlag: boolean; // night_load > battery_capacity
  batteryInsufficientWarning?: string;
}

/* ── #12: Surge Load Analysis ────────────────────────────────── */
export interface SurgeLoadAnalysis {
  steadyPeakKw: number;         // sum of all continuous watts
  surgePeakKw: number;          // sum(watts × surge_multiplier)
  inverterRequired: number;     // max(steady × 1.25, surge)
  inverterProvided: number;     // actual inverterKva selected
  surgeMarginPct: number;       // (inverterProvided - inverterRequired) / inverterRequired × 100
  assessment: 'risky' | 'acceptable' | 'oversized'; // <10% | 10-25% | >25%
  assessmentLabel: string;
  undersizedWarning?: string;
}

/* ── #13: Panel Degradation Model ───────────────────────────── */
export interface DegradationModel {
  degradationRatePerYear: number; // 0.006 = 0.6%/yr
  year1ProductionKwh: number;
  year10ProductionKwh: number;
  percentDropYear10: number;
  averageOutputFactor: number;    // over system lifetime (for financial use)
  systemLifetimeYears: number;
}

/* ── #15: Battery DoD Dual Model ────────────────────────────── */
export interface BatteryDodModel {
  theoreticalUsableKwh: number;   // capacity × 0.90
  conservativeUsableKwh: number;  // capacity × 0.80
  autonomyTheoreticalNights: number;
  autonomyConservativeNights: number;
}

/* ── #16: Rainy Season Safety Margin ───────────────────────── */
export type RainySeasonStatus = 'safe' | 'borderline' | 'at-risk';
export interface RainySeasonAnalysis {
  worstMonthProductionKwh: number;
  requiredWithMarginKwh: number; // load × 1.15
  safetyRatio: number;           // worst_month / load
  status: RainySeasonStatus;
  statusLabel: string;
}

/* ── #18: Rule-Based Engineering Truth Check ────────────────── */
export interface EngineeringTruthCheck {
  systemSizingRatio: number;        // production / load
  systemSizingLabel: 'undersized' | 'balanced' | 'oversized';
  batteryNightsRatio: number;        // usable / night_load
  batteryAssessment: 'insufficient' | 'minimal' | 'comfortable';
  inverterSurgeMarginPct: number;
  inverterAssessment: 'risky' | 'acceptable' | 'oversized';
  warnings: string[];
  passed: boolean;
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
  panelTierLabel?: string;  // e.g. "Standard Residential (3–6 kWp range)"
  avgPSH: number;
  pvClassification: 'UNDER SIZED' | 'OPTIMAL' | 'OVER SIZED';
  seasonalRisk: 'Rainy season stable' | 'Rainy season borderline' | 'Rainy season at risk';
  energyOffsetPct: number;

  // Inverter & Battery
  inverterKva: number;
  batteryKwh: number;
  batteryType: string;
  autonomyHours: number;
  autonomyNote?: string;  // Set when autonomy > 24h: explains it's due to low night load
  batterySufficiency: 'insufficient' | 'limited' | 'adequate' | 'strong' | 'full' | 'daytime-optimized';
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

  // ── NEW: Installer-Grade Analyses ──────────────────────────
  efficiencyBreakdown: EfficiencyBreakdown;
  energyFlow: EnergyFlowModel;
  surgeAnalysis: SurgeLoadAnalysis;
  degradationModel: DegradationModel;
  batteryDodModel: BatteryDodModel;
  rainySeasonAnalysis: RainySeasonAnalysis;
  engineeringTruthCheck: EngineeringTruthCheck;

  // ── Truth Enforcement Engine output ────────────────────────
  truthEnforcement: import('./truth-engine').TruthEnforcementResult;
}

export interface LeadCaptureData {

  full_name: string;
  whatsapp: string;
  timeline: string;
  landlord_consent?: boolean;
}

