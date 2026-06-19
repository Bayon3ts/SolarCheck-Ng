import { 
  CHEMISTRY_PROFILES, 
  normalizeChemistry 
} from './chemistry-profiles';

export interface BatteryClaim {
  chemistry:        string;
  capacityKwh:       number;
  claimedUsableKwh?: number;
  claimedDod:        number;
  claimedRtEff?:     number;
  weightKg?:         number;
  claimedAutonomyHours?: number;
  claimedLoadKw?:    number;
  cycleLife?:        number;
}

export type FraudFlag = {
  code:     string;
  severity: 'critical' | 'warning' | 'info';
  message:  string;
};

export interface FraudReport {
  fraudScore:       number;
  verdict:          'CLEAN' | 'SUSPICIOUS' | 
                     'LIKELY FRAUDULENT';
  flags:            FraudFlag[];
  correctedUsableKwh: number;
  correctedAutonomyHours?: number;
  chemistryDetected: string;
}

// ── HARDENING CONSTANTS ─────────────────────
// These model real-world losses that a raw
// spec-sheet claim never accounts for. Every
// "corrected" figure in this module passes
// through these derates — they are not
// fraud signals themselves, just physics.

// Batteries lose effective capacity outside
// lab conditions: ambient heat, partial state-
// of-charge cycling, and BMS conservatism.
const TEMP_DERATE = 0.95;

// Additional one-way conversion loss going
// battery → inverter → AC load. This is
// separate from the battery's own round-trip
// efficiency (which models charge/discharge
// chemistry losses, not the inverter stage).
const INVERTER_LOSS = 0.92;

// Residential system capacity sanity bounds.
// Anything outside this range for a single
// claimed unit is either a data error or an
// attempt to make a tiny battery look huge
// (or hide a commercial-scale unit inside a
// residential listing to dodge installer
// licensing requirements).
const MIN_PLAUSIBLE_CAPACITY_KWH = 0;
const MAX_PLAUSIBLE_RESIDENTIAL_KWH = 50;

// Multiple independent red flags compounding
// on a single claim is itself a signal — a
// single questionable number might be a
// rounding choice; three or more together is
// a pattern.
const MULTI_FLAG_ESCALATION_THRESHOLD = 3;
const MULTI_FLAG_ESCALATION_BONUS = 10;

/** Clamp a value into [min, max] inclusive. */
function clamp(
  value: number, min: number, max: number
): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Runs a battery spec claim through physics-based
 * fraud detection. Does NOT determine intent —
 * only flags claims that are physically impossible
 * or statistically implausible for the stated
 * chemistry. A high fraud score means "this claim
 * cannot be true," not "this seller is lying,"
 * though in practice the two usually coincide.
 *
 * HARDENING NOTES (do not remove):
 *  - claimedRtEff is NEVER used raw in downstream
 *    math — it is clamped to the chemistry's
 *    realistic band first. The raw value is still
 *    used for flagging (so a 99% claim is still
 *    caught and reported), but corrected outputs
 *    always use the clamped, physically-possible
 *    figure.
 *  - correctedUsableKwh applies TEMP_DERATE to
 *    reflect real-world (non-lab) operating loss.
 *  - correctedAutonomyHours additionally applies
 *    INVERTER_LOSS, since autonomy is an AC-side
 *    measurement and must account for the
 *    battery → inverter conversion stage.
 */
export function detectBatteryFraud(
  claim: BatteryClaim
): FraudReport {

  const chemId  = normalizeChemistry(claim.chemistry);
  const profile = CHEMISTRY_PROFILES[chemId];
  const flags: FraudFlag[] = [];
  let score = 0;

  // ── CHECK 0: Capacity sanity (NEW) ─────────
  // Catches data corruption, unit-confusion
  // (Wh entered as kWh), and implausible
  // commercial-scale claims dressed up as
  // residential units.
  if (claim.capacityKwh <= MIN_PLAUSIBLE_CAPACITY_KWH) {
    flags.push({
      code: 'CAPACITY_INVALID',
      severity: 'critical',
      message:
        `Claimed capacity (${claim.capacityKwh}kWh) ` +
        `is zero or negative — not a valid battery ` +
        `spec. This is either a data entry error or ` +
        `a placeholder value that should never reach ` +
        `a live listing.`,
    });
    score += 20;
  } else if (claim.capacityKwh > MAX_PLAUSIBLE_RESIDENTIAL_KWH) {
    flags.push({
      code: 'CAPACITY_UNREALISTIC',
      severity: 'warning',
      message:
        `Claimed capacity (${claim.capacityKwh}kWh) ` +
        `exceeds typical residential battery bank size ` +
        `(>${MAX_PLAUSIBLE_RESIDENTIAL_KWH}kWh). Verify ` +
        `this is genuinely a single-unit spec and not ` +
        `a multi-unit bank or commercial system ` +
        `mislabelled as residential.`,
    });
    score += 20;
  }

  // ── CHECK 1: DoD plausibility ──────────────
  if (claim.claimedDod > profile.realisticDodFraudFlag) {
    flags.push({
      code: 'DOD_IMPOSSIBLE',
      severity: 'critical',
      message: 
        `Claimed ${claim.claimedDod}% DoD is ` +
        `physically unrealistic for ${profile.label}. ` +
        `Manufacturers rate sustainable DoD at ` +
        `${profile.realisticDodMin}-${profile.realisticDodMax}%. ` +
        `Operating above this range will cause ` +
        `premature capacity loss and void most ` +
        `warranties within 1-2 years.`,
    });
    // REBALANCED: 35 → 25 (per hardening spec)
    score += 25;
  } else if (claim.claimedDod > profile.realisticDodMax) {
    flags.push({
      code: 'DOD_OPTIMISTIC',
      severity: 'warning',
      message:
        `${claim.claimedDod}% DoD is at the very top ` +
        `edge of what ${profile.label} can sustain ` +
        `long-term. Expect faster degradation than ` +
        `the advertised cycle life.`,
    });
    score += 12; // unchanged — not in rebalance list
  }

  // ── CHECK 2: Round-trip efficiency ─────────
  // HARDENED: the raw claimedRtEff is used only
  // for triggering/flagging messages below. It is
  // NEVER carried into correctedUsableKwh or
  // correctedAutonomyHours — those use a clamped
  // value computed later in this function.
  if (claim.claimedRtEff) {
    if (claim.claimedRtEff > 98) {
      flags.push({
        code: 'RTEFF_IMPOSSIBLE',
        severity: 'critical',
        message:
          `${claim.claimedRtEff}% round-trip efficiency ` +
          `exceeds the theoretical maximum for any ` +
          `battery + inverter combination. Even the ` +
          `best lab-grade lithium systems top out ` +
          `around 96-97%.`,
      });
      // REBALANCED: 30 → 25 (per hardening spec)
      score += 25;
    } else if (claim.claimedRtEff > profile.realisticRtEffMax) {
      flags.push({
        code: 'RTEFF_OPTIMISTIC',
        severity: 'warning',
        message:
          `${claim.claimedRtEff}% efficiency is above ` +
          `the realistic range for ${profile.label} ` +
          `(${profile.realisticRtEffMin}-${profile.realisticRtEffMax}%). ` +
          `Real-world losses from wiring, temperature, ` +
          `and inverter conversion are likely understated.`,
      });
      score += 10; // unchanged
    } else if (claim.claimedRtEff < profile.realisticRtEffMin) {
      flags.push({
        code: 'RTEFF_TOO_LOW',
        severity: 'info',
        message:
          `${claim.claimedRtEff}% efficiency is unusually ` +
          `low for ${profile.label} — verify this isn't ` +
          `a data entry error.`,
      });
      score += 5; // unchanged
    }
  }

  // ── CHECK 3: Energy density (hardest to fake) ──
  // This is the single strongest fraud signal because
  // weight cannot be faked — a relabelled lead-acid
  // battery sold as "lithium" will always weigh far
  // more than its claimed capacity implies.
  let energyDensityWhKg: number | null = null;
  if (claim.weightKg && claim.weightKg > 0) {
    energyDensityWhKg = 
      (claim.capacityKwh * 1000) / claim.weightKg;

    if (energyDensityWhKg < profile.realisticWhPerKgMin * 0.7) {
      flags.push({
        code: 'ENERGY_DENSITY_TOO_LOW',
        severity: 'critical',
        message:
          `This battery weighs too much for its claimed ` +
          `${claim.capacityKwh}kWh capacity if it is truly ` +
          `${profile.label} (calculated: ` +
          `${energyDensityWhKg.toFixed(0)}Wh/kg vs expected ` +
          `${profile.realisticWhPerKgMin}-${profile.realisticWhPerKgMax}Wh/kg). ` +
          `This is the classic signature of a relabelled ` +
          `lead-acid battery sold as lithium.`,
      });
      // REBALANCED: 40 → 50 (per hardening spec —
      // this is the strongest, hardest-to-fake signal
      // we have, so it now carries the most weight)
      score += 50;
    } else if (energyDensityWhKg > profile.realisticWhPerKgMax * 1.3) {
      flags.push({
        code: 'ENERGY_DENSITY_TOO_HIGH',
        severity: 'critical',
        message:
          `Capacity-to-weight ratio (` +
          `${energyDensityWhKg.toFixed(0)}Wh/kg) exceeds ` +
          `what is physically possible for ${profile.label}. ` +
          `Claimed capacity is likely inflated.`,
      });
      score += 35; // unchanged — not in rebalance list
    }
  }

  // ── CHECK 4: Cycle life vs DoD consistency ──
  // High claimed DoD + high claimed cycle life
  // together is a red flag — these trade off
  // against each other in every real battery.
  if (claim.cycleLife && claim.claimedDod >= 95 &&
      claim.cycleLife >= profile.typicalCycleLifeMax) {
    flags.push({
      code: 'CYCLE_LIFE_DOD_MISMATCH',
      severity: 'warning',
      message:
        `Claiming both ${claim.claimedDod}% DoD AND ` +
        `${claim.cycleLife.toLocaleString()} cycles is ` +
        `inconsistent — these specs trade off against ` +
        `each other. A battery cycled at very high DoD ` +
        `will not reach the top of its rated cycle life.`,
    });
    score += 15; // unchanged
  }

  // ── HARDENED CORRECTED-VALUE COMPUTATION ───
  // Step 1: derive a realistic, CLAMPED DoD —
  // never trust the claim past the chemistry's
  // own ceiling, regardless of how it was flagged
  // above.
  const realisticDod = clamp(
    claim.claimedDod,
    profile.realisticDodMin,
    profile.realisticDodMax
  );

  // Step 2: derive a realistic, CLAMPED round-trip
  // efficiency. If no claim was given, fall back to
  // the chemistry's midpoint. If a claim WAS given,
  // it is clamped into [min, max] — a 99% claim
  // becomes profile.realisticRtEffMax, not 99%.
  const rtEffMidpoint = 
    (profile.realisticRtEffMin + profile.realisticRtEffMax) / 2;
  const realisticRtEff = claim.claimedRtEff
    ? clamp(
        claim.claimedRtEff,
        profile.realisticRtEffMin,
        profile.realisticRtEffMax
      )
    : rtEffMidpoint;

  // Step 3: apply DoD × RT efficiency × real-world
  // temperature/operating derate to get the usable
  // energy a buyer can actually expect day-to-day —
  // not the lab-conditions figure.
  const correctedUsableKwh = 
    claim.capacityKwh * 
    (realisticDod / 100) * 
    (realisticRtEff / 100) *
    TEMP_DERATE;

  // ── CHECK 5: Autonomy claim vs physics ─────
  // HARDENED: autonomy is an AC-side claim, so the
  // additional inverter conversion stage (battery
  // DC → inverter → AC load) must be modelled here,
  // on top of the battery's own round-trip loss
  // already baked into correctedUsableKwh.
  let correctedAutonomyHours: number | undefined;
  if (claim.claimedAutonomyHours && claim.claimedLoadKw) {
    correctedAutonomyHours = 
      (correctedUsableKwh * INVERTER_LOSS) / 
      claim.claimedLoadKw;

    const claimedVsCorrectedRatio = 
      claim.claimedAutonomyHours / correctedAutonomyHours;

    if (claimedVsCorrectedRatio > 1.3) {
      flags.push({
        code: 'AUTONOMY_OVERSTATED',
        severity: 'critical',
        message:
          `Claimed ${claim.claimedAutonomyHours}h backup ` +
          `does not match physics. Using realistic DoD, ` +
          `efficiency, temperature derate, and inverter ` +
          `losses for ${profile.label}, this battery ` +
          `actually provides approximately ` +
          `${correctedAutonomyHours.toFixed(1)}h at the ` +
          `stated load — a ` +
          `${Math.round((claimedVsCorrectedRatio - 1) * 100)}% ` +
          `overstatement.`,
      });
      // REBALANCED: 30 → 20 (per hardening spec)
      score += 20;
    } else if (claimedVsCorrectedRatio > 1.1) {
      flags.push({
        code: 'AUTONOMY_OPTIMISTIC',
        severity: 'warning',
        message:
          `Claimed autonomy is somewhat optimistic. ` +
          `Realistic estimate: ` +
          `${correctedAutonomyHours.toFixed(1)}h vs claimed ` +
          `${claim.claimedAutonomyHours}h.`,
      });
      score += 10; // unchanged
    }
  }

  // ── CHECK 6: Usable vs nominal capacity gap ─
  if (claim.claimedUsableKwh) {
    const impliedDod = 
      (claim.claimedUsableKwh / claim.capacityKwh) * 100;
    if (impliedDod > profile.realisticDodFraudFlag) {
      flags.push({
        code: 'USABLE_CAPACITY_IMPOSSIBLE',
        severity: 'critical',
        message:
          `Claimed usable capacity ` +
          `(${claim.claimedUsableKwh}kWh) implies ` +
          `${impliedDod.toFixed(0)}% DoD on a ` +
          `${claim.capacityKwh}kWh nominal battery — ` +
          `not achievable for ${profile.label} without ` +
          `severely shortening battery life.`,
      });
      score += 25; // unchanged
    }
  }

  // ── CHECK 7: Multi-flag escalation (NEW) ───
  // A single questionable number can be an honest
  // rounding choice. Three or more independent red
  // flags on the same claim is a pattern, not a
  // coincidence — escalate accordingly.
  if (flags.length >= MULTI_FLAG_ESCALATION_THRESHOLD) {
    score += MULTI_FLAG_ESCALATION_BONUS;
  }

  // ── FINAL VERDICT ───────────────────────────
  score = Math.min(score, 100);
  let verdict: FraudReport['verdict'] = 'CLEAN';
  if (score >= 50)      verdict = 'LIKELY FRAUDULENT';
  else if (score >= 20) verdict = 'SUSPICIOUS';

  return {
    fraudScore: score,
    verdict,
    flags,
    correctedUsableKwh: 
      Math.round(correctedUsableKwh * 100) / 100,
    correctedAutonomyHours: correctedAutonomyHours
      ? Math.round(correctedAutonomyHours * 10) / 10
      : undefined,
    chemistryDetected: profile.label,
  };
}

/**
 * Batch-checks every entry in the existing
 * SOLAR_BATTERIES catalog. Used by a one-off
 * audit script and by the admin dashboard.
 * Unchanged by hardening — still a thin wrapper
 * over detectBatteryFraud.
 */
export function auditBatteryCatalog(
  batteries: Array<{
    slug: string; chemistry: string;
    capacityKwh: number; usableKwh: number;
    dod: number;
  }>
) {
  return batteries.map(b => ({
    slug: b.slug,
    report: detectBatteryFraud({
      chemistry: b.chemistry,
      capacityKwh: b.capacityKwh,
      claimedUsableKwh: b.usableKwh,
      claimedDod: b.dod,
    }),
  }));
}
