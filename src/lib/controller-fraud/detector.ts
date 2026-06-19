import {
  CONTROLLER_TYPE_PROFILES,
  BRAND_REPUTATION,
  normalizeBrand,
} from './controller-profiles';

export interface ControllerClaim {
  brand:                 string;  // raw label, e.g. "EPever"
  claimedType:           'MPPT' | 'PWM' | 'not_sure';
  claimedAmperage:       number;  // A, e.g. 60
  pricePaidNaira:        number;
  totalPanelWattsSTC:    number;  // sum of all connected panel wattage at STC
  batteryVoltage:        12 | 24 | 48;
  displayedChargingAmps?: number; // what the unit shows in strong midday sun
  runsHot?: 'cool' | 'slightly_warm' | 'hot' | 'very_hot';
}

export type FraudFlag = {
  code:     string;
  severity: 'critical' | 'warning' | 'info';
  message:  string;
};

export interface FraudReport {
  fraudScore:         number; // 0-100
  verdict:            'CLEAN' | 'SUSPICIOUS' | 'LIKELY FRAUDULENT';
  flags:              FraudFlag[];
  correctedMaxAmps:   number; // realistic max charging current this array can actually deliver
  theoreticalDeliveredWatts: number;
  typeDetected:       string;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Validates a charge controller claim against
 * panel-array physics and Nigerian market pricing.
 * Cannot prove fraud with certainty (we can't open
 * the unit) — flags claims that are physically
 * implausible or priced inconsistently with the
 * claimed specification.
 */
export function detectControllerFraud(
  claim: ControllerClaim
): FraudReport {
  const flags: FraudFlag[] = [];
  let score = 0;

  // Treat "not_sure" as the worse-case assumption
  // (PWM) for safety-relevant calculations — never
  // assume the better-performing type when the user
  // doesn't actually know.
  const assumedType = claim.claimedType === 'not_sure' ? 'PWM' : claim.claimedType;
  const typeProfile = CONTROLLER_TYPE_PROFILES[assumedType];

  // ── CHECK 1: Brand reputation baseline ──────
  const brandId = normalizeBrand(claim.brand);
  const brandProfile = BRAND_REPUTATION[brandId];
  score += brandProfile.trustScoreModifier;

  if (brandProfile.tier === 'red_flag') {
    flags.push({
      code: 'BRAND_RED_FLAG',
      severity: 'warning',
      message: `No identifiable brand on the controller. Unbranded units have no accountability if the rated amperage or type claim turns out to be false — there is no manufacturer to hold responsible.`,
    });
  }

  // ── CHECK 2: Theoretical delivered power ────
  const harvestEffMid = (typeProfile.harvestEffMin + typeProfile.harvestEffMax) / 2;
  const theoreticalDeliveredWatts = claim.totalPanelWattsSTC * harvestEffMid;
  const correctedMaxAmps = theoreticalDeliveredWatts / claim.batteryVoltage;

  // ── CHECK 3: Amperage vs array size ─────────
  const arrayMaxAmpsAtFullEff = (claim.totalPanelWattsSTC * typeProfile.harvestEffMax) / claim.batteryVoltage;

  if (claim.claimedAmperage < arrayMaxAmpsAtFullEff * 0.9) {
    flags.push({
      code: 'CONTROLLER_UNDERSIZED',
      severity: 'critical',
      message: `Your ${claim.totalPanelWattsSTC}W array can produce up to ~${arrayMaxAmpsAtFullEff.toFixed(0)}A at ${claim.batteryVoltage}V, but the controller is only rated for ${claim.claimedAmperage}A. This is a genuine safety risk — the controller will be overdriven, leading to overheating, premature failure, or fire risk. Upgrade to a higher-rated unit before continued use.`,
    });
    score += 30;
  } else if (claim.claimedAmperage > arrayMaxAmpsAtFullEff * 3) {
    flags.push({
      code: 'CONTROLLER_OVERSIZED',
      severity: 'info',
      message: `Your array could never use more than ~${arrayMaxAmpsAtFullEff.toFixed(0)}A from this controller's ${claim.claimedAmperage}A rating. Not dangerous, but you likely overpaid for capacity you don't need — useful only if you plan to add more panels later.`,
    });
    score += 0;
  }

  // ── CHECK 4: Price vs claimed amp class ─────
  const pricePerAmp = claim.pricePaidNaira / claim.claimedAmperage;

  if (assumedType === 'MPPT') {
    if (pricePerAmp < CONTROLLER_TYPE_PROFILES.PWM.typicalPricePerAmpMax) {
      flags.push({
        code: 'MPPT_PRICE_TOO_LOW',
        severity: 'critical',
        message: `You paid ₦${pricePerAmp.toFixed(0)}/A for a claimed MPPT controller — this is within PWM pricing range (₦${CONTROLLER_TYPE_PROFILES.PWM.typicalPricePerAmpMin}-₦${CONTROLLER_TYPE_PROFILES.PWM.typicalPricePerAmpMax}/A), not genuine MPPT range (₦${CONTROLLER_TYPE_PROFILES.MPPT.typicalPricePerAmpMin}-₦${CONTROLLER_TYPE_PROFILES.MPPT.typicalPricePerAmpMax}/A). This is the classic signature of a PWM controller relabelled and sold as MPPT.`,
      });
      score += 35;
    } else if (pricePerAmp < CONTROLLER_TYPE_PROFILES.MPPT.typicalPricePerAmpMin) {
      flags.push({
        code: 'MPPT_PRICE_BELOW_MARKET',
        severity: 'warning',
        message: `₦${pricePerAmp.toFixed(0)}/A is below the typical genuine MPPT market floor. Not conclusive on its own, but worth combining with the other checks here — ask the seller for a test report.`,
      });
      score += 15;
    }
  } else {
    if (pricePerAmp > CONTROLLER_TYPE_PROFILES.PWM.typicalPricePerAmpMax * 1.5) {
      flags.push({
        code: 'PWM_OVERPRICED',
        severity: 'warning',
        message: `₦${pricePerAmp.toFixed(0)}/A is well above genuine PWM market pricing. You may have been charged MPPT-level prices for a PWM-only unit, or the unit is actually MPPT and was mislabelled PWM by mistake — worth double-checking the physical label.`,
      });
      score += 20;
    }
  }

  // ── CHECK 5: Displayed current vs physics ───
  if (claim.displayedChargingAmps !== undefined) {
    const expectedMinAmps = (claim.totalPanelWattsSTC * typeProfile.harvestEffMin) / claim.batteryVoltage;

    if (claim.displayedChargingAmps < expectedMinAmps * 0.5) {
      flags.push({
        code: 'DISPLAY_UNDERPERFORMANCE',
        severity: 'critical',
        message: `In strong sun, this controller should show at least ~${expectedMinAmps.toFixed(1)}A for a genuine ${typeProfile.label} unit on your array, but it's showing ${claim.displayedChargingAmps}A — less than half. This points to either fake/underrated internals, severe wiring loss, or the controller is not actually the type claimed on its label.`,
      });
      score += 25;
    } else if (claim.displayedChargingAmps < expectedMinAmps * 0.75) {
      flags.push({
        code: 'DISPLAY_BELOW_EXPECTED',
        severity: 'warning',
        message: `Charging current (${claim.displayedChargingAmps}A) is somewhat below the ${expectedMinAmps.toFixed(1)}A expected minimum. Could be partial shading, dirty panels, undersized cables, or a borderline unit — worth investigating.`,
      });
      score += 10;
    }
  }

  // ── CHECK 6: Thermal behavior ────────────────
  if (claim.runsHot === 'very_hot') {
    const isGenericOrUnbranded = brandProfile.tier === 'unknown' || brandProfile.tier === 'red_flag';

    flags.push({
      code: 'THERMAL_DANGEROUS',
      severity: 'critical',
      message: `"Very hot" operating temperature is a genuine fire/failure risk regardless of brand.` +
        (isGenericOrUnbranded
          ? ` Combined with an unbranded/generic unit, this strongly suggests undersized internal components relative to the claimed ${claim.claimedAmperage}A rating.`
          : ` Even from a reputable brand, this needs immediate attention — check airflow around the unit and verify it isn't overdriven beyond its rating.`),
    });
    score += isGenericOrUnbranded ? 30 : 15;
  } else if (claim.runsHot === 'hot') {
    flags.push({
      code: 'THERMAL_ELEVATED',
      severity: 'warning',
      message: `Running hot (not dangerously so) under load. Worth monitoring, especially in direct Nigerian sun — ensure adequate ventilation around the unit.`,
    });
    score += 8;
  }

  // ── CHECK 7: Multi-flag escalation ──────────
  if (flags.filter(f => f.severity !== 'info').length >= 3) {
    score += 10;
  }

  // ── FINAL VERDICT ───────────────────────────
  score = clamp(score, 0, 100);
  let verdict: FraudReport['verdict'] = 'CLEAN';
  if (score >= 50)      verdict = 'LIKELY FRAUDULENT';
  else if (score >= 20) verdict = 'SUSPICIOUS';

  return {
    fraudScore: score,
    verdict,
    flags,
    correctedMaxAmps: Math.round(correctedMaxAmps * 10) / 10,
    theoreticalDeliveredWatts: Math.round(theoreticalDeliveredWatts),
    typeDetected: typeProfile.label,
  };
}
