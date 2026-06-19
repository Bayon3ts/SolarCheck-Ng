/* ═══════════════════════════════════════════════════════════════ */
/* SOLAR SYSTEM TRUTH ENFORCEMENT ENGINE                          */
/* SolarCheck Nigeria — Hard physics validation & clamp layer     */
/*                                                                */
/* ROLE: This module does NOT calculate. It VERIFIES, CLAMPS,    */
/* and CORRECTS outputs from the sizing engine. Every value that  */
/* leaves this function is guaranteed to obey energy conservation */
/* and real-world system constraints. Marketing numbers in —      */
/* physics-accurate numbers out.                                  */
/* ═══════════════════════════════════════════════════════════════ */

import { SavingsRange } from './types';

// ── Days in each calendar month (non-leap) heuristic
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/* ── TUNABLE THRESHOLDS ─────────────────────────────────────────
 * These are the engineering judgment values referenced throughout
 * the rules. Centralise here so they can be updated in one place.
 */
const THRESHOLDS = {
  // Rule 2 — coverage cap when seasonal deficit exists
  COVERAGE_CAP_MILD_DEFICIT: 0.92,   // < 10% deficit months
  COVERAGE_CAP_MODERATE_DEFICIT: 0.85, // 10–25% deficit months
  COVERAGE_CAP_SEVERE_DEFICIT: 0.75,  // > 25% deficit months

  // Rule 6 — inverter safety bands
  INVERTER_NEAR_CAPACITY_RATIO: 0.80,  // warn when peak ≥ 80% of kVA
  INVERTER_SURGE_MULTIPLIER: 1.35,     // typical worst-case inrush factor

  // Rule 7 — panel sizing tolerance
  PANEL_UNDERSIZED_RATIO: 1.00,        // pvKwp < required → undersized
  PANEL_OVERSIZED_RATIO: 1.35,         // pvKwp > 1.35× required → oversized

  // Rule 5 — autonomy realism cap
  MAX_CREDIBLE_AUTONOMY_HOURS: 36,     // beyond this → show nights, not hours

  // Confidence thresholds
  CONFIDENCE_HIGH_FLAGS: 0,            // 0 critical flags → HIGH
  CONFIDENCE_LOW_FLAGS: 3,             // ≥ 3 critical flags → LOW
} as const;

/* ═══════════════════════════════════════════════════════════════
 * PUBLIC INTERFACES
 * ═══════════════════════════════════════════════════════════════
 */

export type TruthFlag = {
  code: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  rule: number; // which spec rule triggered this
};

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface TruthEnforcementResult {
  /** Corrected network energy coverage (0–1). Never exceeds 1.0. */
  realCoverage: number;

  /** Monthly cost after solar — clamped to physics minimum. */
  correctedMonthlyCost: number;

  /** Monthly savings — can never exceed prior total spend × coverage. */
  correctedMonthlySavings: number;

  /** Corrected grid savings range with deficit adjustments applied. */
  correctedGridSavings: SavingsRange;

  /** Corrected generator savings range — proportional to real coverage. */
  correctedGeneratorSavings: SavingsRange;

  /** Human-readable autonomy string. Uses "nights" framing when > 24h. */
  batteryReality: string;

  /** All flags raised by the 10 enforcement rules. */
  systemTruthFlags: TruthFlag[];

  /** Overall confidence in the system design. */
  confidence: ConfidenceLevel;

  /** Whether any month has insufficient solar production. */
  hasSeasonalDeficit: boolean;

  /** kWh/day deficit in the worst month (0 if none). */
  worstMonthDeficitKwh: number;

  /** Corrected energy offset percentage string (e.g. "87%"). */
  correctedOffsetLabel: string;
}

/* ═══════════════════════════════════════════════════════════════
 * INPUT BUNDLE
 * All fields come from calculateSolarSystem internals — no
 * circular dependency on CalculatorResults.
 * ═══════════════════════════════════════════════════════════════
 */
export interface TruthEngineInputs {
  // ── From sizing engine internals ──────────────────────────────
  dailyLoadKwh: number;
  peakLoadKw: number;
  pvKwp: number;
  batteryKwh: number;
  inverterKva: number;
  avgPSH: number;
  systemEfficiency: number;
  /** 12-element array — kWh produced per month */
  monthlyGenerationKwh: number[];
  monthlyGridCost: number;      // user's current NEPA spend
  monthlyGeneratorCost: number; // user's current generator spend
  tariffPerKwh: number;
  nightLoadKwh: number;
  coveragePct: number;          // 0–100 user intent
  systemMode: 'grid-tied' | 'hybrid' | 'off-grid';

  // ── Pre-computed values the engine needs from the calculator ──
  afterSolarMonthlyCost: number;
  monthlyGridSavings: SavingsRange;
  monthlyGeneratorSavings: SavingsRange;
  autonomyHours: number;
  autonomyNote: string | undefined;
}

/* ═══════════════════════════════════════════════════════════════
 * HELPER UTILITIES
 * ═══════════════════════════════════════════════════════════════
 */

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function scaleRange(base: SavingsRange, factor: number): SavingsRange {
  return {
    conservative: Math.round(base.conservative * factor),
    expected: Math.round(base.expected * factor),
    stressCase: Math.round(base.stressCase * factor),
  };
}

function annualKwh(monthly: number[]): number {
  return monthly.reduce((s, v) => s + v, 0);
}

/* ═══════════════════════════════════════════════════════════════
 * CORE ENFORCEMENT FUNCTION
 * Takes the flat inputs bundle and returns corrected values with
 * all flags attached. No CalculatorResults dependency.
 * ═══════════════════════════════════════════════════════════════
 */
export function enforceTruth(
  inputs: TruthEngineInputs
): TruthEnforcementResult {
  const flags: TruthFlag[] = [];
  let criticalFlagCount = 0;

  /* ─────────────────────────────────────────────────────────────
   * RULE 1 — ENERGY CONSERVATION (HARD LIMIT)
   * Check every month for deficit (production < load).
   * ─────────────────────────────────────────────────────────────
   */
  const dailyRequiredKwh = inputs.dailyLoadKwh * (inputs.coveragePct / 100);
  const deficitMonths: number[] = []; // month indices with deficit
  let worstMonthDeficitKwh = 0;

  inputs.monthlyGenerationKwh.forEach((monthKwh, i) => {
    const daysInMonth = DAYS_IN_MONTH[i];
    const dailyProduction = monthKwh / daysInMonth;
    if (dailyProduction < dailyRequiredKwh) {
      const deficit = dailyRequiredKwh - dailyProduction;
      deficitMonths.push(i);
      if (deficit > worstMonthDeficitKwh) worstMonthDeficitKwh = deficit;
    }
  });

  const hasSeasonalDeficit = deficitMonths.length > 0;

  if (hasSeasonalDeficit) {
    flags.push({
      code: 'PARTIAL_COVERAGE_SEASONAL',
      severity: 'WARNING',
      rule: 1,
      message:
        `${deficitMonths.length} month(s) have solar production below daily load target. ` +
        `Coverage cannot be 100% — system will require grid/generator in deficit months. ` +
        `Worst daily deficit: ${worstMonthDeficitKwh.toFixed(2)} kWh.`,
    });
  }

  /* ─────────────────────────────────────────────────────────────
   * RULE 2 — REALISTIC COVERAGE %
   * Compute annual coverage first; then cap if deficit exists.
   * ─────────────────────────────────────────────────────────────
   */
  const annualSolar = annualKwh(inputs.monthlyGenerationKwh);
  const annualLoad = inputs.dailyLoadKwh * 365 * (inputs.coveragePct / 100);
  const rawCoverage = annualLoad > 0
    ? clamp(annualSolar / (inputs.dailyLoadKwh * 365), 0, 1)
    : 0;

  // Determine deficit severity to choose the right cap
  let coverageCap = 1.0;
  if (hasSeasonalDeficit) {
    const deficitFraction = deficitMonths.length / 12;
    if (deficitFraction > 0.25) {
      coverageCap = THRESHOLDS.COVERAGE_CAP_SEVERE_DEFICIT;
    } else if (deficitFraction > 0.10) {
      coverageCap = THRESHOLDS.COVERAGE_CAP_MODERATE_DEFICIT;
    } else {
      coverageCap = THRESHOLDS.COVERAGE_CAP_MILD_DEFICIT;
    }
  }
  const realCoverage = clamp(rawCoverage, 0, coverageCap);

  if (rawCoverage > coverageCap) {
    flags.push({
      code: 'COVERAGE_CAPPED',
      severity: 'INFO',
      rule: 2,
      message:
        `Annual solar production suggests ${(rawCoverage * 100).toFixed(0)}% coverage, ` +
        `but seasonal deficits cap effective coverage at ${(coverageCap * 100).toFixed(0)}%. ` +
        `Annual average does not guarantee monthly adequacy.`,
    });
  }

  /* ─────────────────────────────────────────────────────────────
   * RULE 3 — COST FLOOR (CRITICAL)
   * afterSolarCost must always be ≥ cost of grid power for
   * the remaining unmet load. Can never go below zero.
   * ─────────────────────────────────────────────────────────────
   */
  const unmetFraction = 1 - realCoverage;
  // Minimum unavoidable monthly cost = unmet energy × tariff
  const monthlyUnmetKwh = inputs.dailyLoadKwh * 30 * unmetFraction;
  const minimumPossibleCost = monthlyUnmetKwh * inputs.tariffPerKwh;
  const correctedMonthlyCost = Math.max(
    inputs.afterSolarMonthlyCost,
    minimumPossibleCost
  );

  if (correctedMonthlyCost > inputs.afterSolarMonthlyCost) {
    flags.push({
      code: 'COST_FLOOR_APPLIED',
      severity: 'WARNING',
      rule: 3,
      message:
        `Calculated afterSolarCost (₦${Math.round(inputs.afterSolarMonthlyCost).toLocaleString()}) ` +
        `is below physics minimum (₦${Math.round(minimumPossibleCost).toLocaleString()}). ` +
        `Clamped to physics floor — you still pay for unmet grid energy.`,
    });
    criticalFlagCount++;
  }

  /* ─────────────────────────────────────────────────────────────
   * RULE 4 — GENERATOR SAVINGS VALIDATION
   * Generator savings must be proportional to real coverage.
   * Cannot claim 100% generator savings if deficit exists.
   * ─────────────────────────────────────────────────────────────
   */
  const correctedGeneratorSavings = hasSeasonalDeficit
    ? scaleRange(inputs.monthlyGeneratorSavings, realCoverage)
    : inputs.monthlyGeneratorSavings;

  if (hasSeasonalDeficit && inputs.monthlyGeneratorSavings.expected > 0) {
    const reductionPct = Math.round((1 - realCoverage) * 100);
    if (reductionPct > 5) {
      flags.push({
        code: 'GENERATOR_SAVINGS_REDUCED',
        severity: 'WARNING',
        rule: 4,
        message:
          `Generator savings reduced by ${reductionPct}% to reflect real coverage ` +
          `(${(realCoverage * 100).toFixed(0)}%). Seasonal deficits mean the generator ` +
          `will still run in low-sun months.`,
      });
    }
  }

  /* ─────────────────────────────────────────────────────────────
   * RULE 5 — BATTERY AUTONOMY (ANTI-MISLEADING RULE)
   * High autonomy hours should be expressed as nights, not hours,
   * because no one thinks "I have 36 hours of backup" — they
   * think "the lights will stay on for 3 nights."
   * ─────────────────────────────────────────────────────────────
   */
  const autonomyHours = inputs.autonomyHours;
  let batteryReality: string;

  if (inputs.batteryKwh === 0 || inputs.systemMode === 'grid-tied') {
    batteryReality = 'No battery storage — grid-tied only.';
  } else if (autonomyHours <= 0) {
    batteryReality = 'Battery too small for meaningful nighttime backup.';
    flags.push({
      code: 'BATTERY_NEGLIGIBLE_AUTONOMY',
      severity: 'CRITICAL',
      rule: 5,
      message: `Battery provides < 1hr of backup. Consider upsizing or running grid-tied.`,
    });
    criticalFlagCount++;
  } else if (autonomyHours > THRESHOLDS.MAX_CREDIBLE_AUTONOMY_HOURS) {
    const nights = (autonomyHours / 12).toFixed(1);
    batteryReality =
      `~${nights} nights of backup for essential loads ` +
      `(low night-load calculation — battery sized for ${inputs.batteryKwh.toFixed(1)} kWh)`;
    if (!inputs.autonomyNote) {
      flags.push({
        code: 'AUTONOMY_MISLEADING_HOURS',
        severity: 'INFO',
        rule: 5,
        message:
          `Autonomy of ${autonomyHours.toFixed(1)}h exceeds 36h — displayed as nights to ` +
          `avoid misleading full-day backup implication. This reflects a low night load ` +
          `(${inputs.nightLoadKwh.toFixed(2)} kWh/night), not a large battery.`,
      });
    }
  } else {
    batteryReality =
      `~${autonomyHours.toFixed(1)} hours of backup at night load ` +
      `(${inputs.nightLoadKwh.toFixed(2)} kWh/night)`;
  }

  /* ─────────────────────────────────────────────────────────────
   * RULE 6 — INVERTER SAFETY CHECK
   * ─────────────────────────────────────────────────────────────
   */
  const inverterKva = inputs.inverterKva;
  const peakKw = inputs.peakLoadKw;
  const surgeEstimate = peakKw * THRESHOLDS.INVERTER_SURGE_MULTIPLIER;

  if (peakKw >= THRESHOLDS.INVERTER_NEAR_CAPACITY_RATIO * inverterKva) {
    flags.push({
      code: 'INVERTER_NEAR_CAPACITY',
      severity: 'WARNING',
      rule: 6,
      message:
        `⚠️ Peak load (${peakKw.toFixed(1)} kW) is ${(peakKw / inverterKva * 100).toFixed(0)}% ` +
        `of inverter capacity (${inverterKva} kVA). Operating near rated limit under peak conditions.`,
    });
  }

  if (surgeEstimate > inverterKva) {
    flags.push({
      code: 'INVERTER_SURGE_OVERLOAD_RISK',
      severity: 'CRITICAL',
      rule: 6,
      message:
        `❌ Estimated surge load (${surgeEstimate.toFixed(1)} kW) exceeds inverter capacity ` +
        `(${inverterKva} kVA). Risk of inverter trip during motor/AC startup. ` +
        `Upsize inverter or stagger appliance starts.`,
    });
    criticalFlagCount++;
  }

  /* ─────────────────────────────────────────────────────────────
   * RULE 7 — PANEL SIZING VALIDATION
   * required_kWp = dailyLoad / (avgPSH × systemEff)
   * ─────────────────────────────────────────────────────────────
   */
  const requiredKwp =
    inputs.dailyLoadKwh / (inputs.avgPSH * inputs.systemEfficiency);

  if (inputs.pvKwp < requiredKwp * THRESHOLDS.PANEL_UNDERSIZED_RATIO) {
    flags.push({
      code: 'PANEL_UNDERSIZED',
      severity: 'CRITICAL',
      rule: 7,
      message:
        `❌ PV array (${inputs.pvKwp.toFixed(2)} kWp) is undersized. ` +
        `Required: ${requiredKwp.toFixed(2)} kWp to meet daily load at ` +
        `${inputs.avgPSH.toFixed(1)} PSH with ${(inputs.systemEfficiency * 100).toFixed(0)}% efficiency.`,
    });
    criticalFlagCount++;
  } else if (inputs.pvKwp > requiredKwp * THRESHOLDS.PANEL_OVERSIZED_RATIO) {
    flags.push({
      code: 'PANEL_OVERSIZED',
      severity: 'WARNING',
      rule: 7,
      message:
        `⚠️ PV array (${inputs.pvKwp.toFixed(2)} kWp) is ${((inputs.pvKwp / requiredKwp - 1) * 100).toFixed(0)}% ` +
        `over minimum requirement. Cost could be reduced without performance loss.`,
    });
  }

  /* ─────────────────────────────────────────────────────────────
   * RULE 8 — SAVINGS SANITY CHECK
   * Total claimed savings ≤ prior total spend × real coverage.
   * 100% savings only allowed if NO seasonal deficit AND
   * annual production ≥ annual load.
   * ─────────────────────────────────────────────────────────────
   */
  const totalPriorSpend = inputs.monthlyGridCost + inputs.monthlyGeneratorCost;
  const maxAllowableSavings = totalPriorSpend * realCoverage;

  const rawGridSavings = inputs.monthlyGridSavings;
  const rawGenSavings = inputs.monthlyGeneratorSavings;
  const totalRawSavings = rawGridSavings.expected + rawGenSavings.expected;

  // Grid savings — scale down proportionally if total exceeds allowable
  let correctedGridSavings: SavingsRange = rawGridSavings;
  let correctedMonthlySavings: number;

  if (totalRawSavings > maxAllowableSavings && maxAllowableSavings >= 0) {
    const scale = maxAllowableSavings / totalRawSavings;
    correctedGridSavings = scaleRange(rawGridSavings, scale);

    flags.push({
      code: 'SAVINGS_CAPPED',
      severity: 'WARNING',
      rule: 8,
      message:
        `Claimed savings (₦${Math.round(totalRawSavings).toLocaleString()}/mo) exceed ` +
        `physics ceiling (₦${Math.round(maxAllowableSavings).toLocaleString()}/mo = ` +
        `prior spend × ${(realCoverage * 100).toFixed(0)}% coverage). ` +
        `Scaled down to prevent marketing overstatement.`,
    });
  }

  // Check for 100% savings claim with deficit
  if (hasSeasonalDeficit && totalRawSavings >= totalPriorSpend * 0.98) {
    flags.push({
      code: 'SAVINGS_100PCT_IMPOSSIBLE',
      severity: 'CRITICAL',
      rule: 8,
      message:
        `100% savings claimed but seasonal deficit exists — grid/generator costs ` +
        `remain unavoidable in deficit months. Savings cannot be 100%.`,
    });
    criticalFlagCount++;
  }

  const effectiveGridSavings = correctedGridSavings.expected;
  const effectiveGenSavings = correctedGeneratorSavings.expected;
  correctedMonthlySavings = Math.max(
    0,
    Math.min(effectiveGridSavings + effectiveGenSavings, maxAllowableSavings)
  );

  /* ─────────────────────────────────────────────────────────────
   * RULE 9 — RAINY SEASON ENFORCEMENT
   * Already computed via seasonal deficit logic above.
   * Emit a specific rainy-season flag here for UX visibility.
   * ─────────────────────────────────────────────────────────────
   */
  const rainyDeficitMonths = deficitMonths.filter(i => i >= 5 && i <= 8); // Jun–Sep
  if (rainyDeficitMonths.length > 0) {
    flags.push({
      code: 'RAINY_SEASON_RELIANCE',
      severity: 'WARNING',
      rule: 9,
      message:
        `⚠️ Rainy season grid/generator reliance required. ` +
        `${rainyDeficitMonths.length} rainy season month(s) have insufficient solar production. ` +
        `Reduce savings confidence and flag grid dependency for Jun–Sep.`,
    });
  }

  /* ─────────────────────────────────────────────────────────────
   * CONFIDENCE RATING
   * ─────────────────────────────────────────────────────────────
   */
  let confidence: ConfidenceLevel;
  if (criticalFlagCount === THRESHOLDS.CONFIDENCE_HIGH_FLAGS) {
    confidence = 'HIGH';
  } else if (criticalFlagCount < THRESHOLDS.CONFIDENCE_LOW_FLAGS) {
    confidence = 'MEDIUM';
  } else {
    confidence = 'LOW';
  }

  /* ─────────────────────────────────────────────────────────────
   * CORRECTED OFFSET LABEL
   * ─────────────────────────────────────────────────────────────
   */
  const correctedOffsetLabel =
    realCoverage >= 0.99
      ? '≈100% (no seasonal deficit)'
      : `${(realCoverage * 100).toFixed(0)}%${hasSeasonalDeficit ? ' (seasonal deficit)' : ''}`;

  return {
    realCoverage,
    correctedMonthlyCost,
    correctedMonthlySavings,
    correctedGridSavings,
    correctedGeneratorSavings,
    batteryReality,
    systemTruthFlags: flags,
    confidence,
    hasSeasonalDeficit,
    worstMonthDeficitKwh: Math.round(worstMonthDeficitKwh * 100) / 100,
    correctedOffsetLabel,
  };
}
