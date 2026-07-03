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

  /**
   * System optimisation priority.
   * 'maximum_protection' (default): strict hardware floors — 5 kVA mandatory when AC present.
   * 'budget_conscious': allows step-down to 3 kVA / 24V class when total connected
   *   load is below 2 200 W; UI must display a load-management warning banner.
   */
  optimizationMode?: 'maximum_protection' | 'budget_conscious';
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
  /** Three-tier load profile label driven by nightLoadRatio thresholds */
  loadProfileLabel?: string;
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
  nightLoadKwh: number;
  peakLoadKw: number;
  /** Sum of all rated appliance watts — for wiring and breaker sizing */
  totalConnectedLoadW: number;

  // PV Array
  pvKwp: number;
  panelsNeeded: number;
  panelSizeWatts: number;
  panelTierLabel?: string;  // e.g. "Standard Residential (3–6 kWp range)"
  avgPSH: number;
  pvClassification: 'UNDER SIZED' | 'WELL SIZED' | 'OVER SIZED' | 'OVER SIZED (DAYTIME)';
  seasonalRisk: 'Rainy season stable' | 'Rainy season borderline' | 'Rainy season at risk';
  energyOffsetPct: number;
  /** Physics-honest coverage label — claims 100% only when usable generation > load × 1.15 */
  coverageLabel: string;
  /** Actual solar coverage percentage computed from real daily generation vs load (0-100) */
  actualSolarCoveragePct: number;
  /** Battery-PV balance check: HEALTHY ≥50% daily charge, MARGINAL 30-50%, MISMATCH <30% */
  batteryPvBalance: 'HEALTHY' | 'MARGINAL' | 'MISMATCH';
  /** Custom warning label for rainy season coverage */
  rainySeasonCoverageLabel?: string;
  /** Tiered load profile classification: Day-Dominant / Mixed / Night-Heavy */
  loadProfileLabel: string;

  // Inverter & Battery
  inverterKva: number;
  batteryKwh: number;
  batteryType: string;
  realUsableBattery: number;
  batteryCoverageRatio: number;
  batteryRiskLevel: 'safe' | 'moderate' | 'fragile' | 'critical';
  autonomyHours: number;
  autonomyNote?: string;  // Set when autonomy > 24h: explains it's due to low night load
  isFragileBatteryWarning: boolean;
  surgeFailureWarning?: string;
  dynamicApplianceInsights: string[];
  batterySufficiency: 'INSUFFICIENT ⚠️' | 'TIGHT ⚠️' | 'ADEQUATE ✅' | 'MINIMAL STORAGE (day-use focused)';
  systemConsistencyWarnings: string[];
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

  // ── Upgrade Block B: Roof Footprint Spatial Guardrail ────────
  /**
   * Total physical roof area (m²) required for the PV array, including a mandatory
   * 25% buffer for racking spacing, wind-load clearance, and installer access paths.
   * Formula: ⌈panelsNeeded × panelSurfaceAreaSqM × 1.25⌉
   */
  totalRequiredAreaSqM: number;

  // ── Upgrade Block C: Appliance Remediation Engine ─────────────
  /**
   * Actionable upgrade tips generated when pvClassification === 'UNDER SIZED'.
   * Empty array when the system is OPTIMAL or OVER SIZED.
   * Each string is a ready-to-render UI banner message.
   */
  efficiencyRecommendations: string[];

  // ── Upgrade Block A: Budget Mode Signal ──────────────────────
  /**
   * True when optimizationMode === 'budget_conscious' AND the AC-present hardware
   * floor has been relaxed from 5 kVA to 3 kVA due to a sub-2 200 W connected load.
   * The UI must render a Load Management Alert Banner when this flag is true.
   */
  budgetModeActive: boolean;
}

export interface LeadCaptureData {

  full_name: string;
  whatsapp: string;
  timeline: string;
  landlord_consent?: boolean;
}

