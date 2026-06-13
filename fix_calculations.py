import os

path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\lib\calculator\calculations.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { CalculatorInputs, CalculatorResults, SystemTier } from './types';",
    "import { CalculatorInputs, CalculatorResults } from './types';"
)
content = content.replace(
    "import { SYSTEM_PACKAGES } from '@/data/system-packages';\n",
    ""
)

# 2. recommendTierFromSpend
s2 = """// ── Tier recommendation from monthly spend ────────────────────
/**
 * Maps combined monthly electricity + generator spend (₦)
 * to the system tier that would realistically replace that cost level.
 */
export function recommendTierFromSpend(
  monthlySpendNaira: number
): SystemTier {
  if (monthlySpendNaira < 15000)  return 'micro'
  if (monthlySpendNaira < 40000)  return 'basic'
  if (monthlySpendNaira < 80000)  return 'starter'
  if (monthlySpendNaira < 200000) return 'standard'
  return 'premium'
}"""
content = content.replace(s2, "")

# 3. BATTERY_MINIMUMS
s3 = """// Per-tier minimum battery kWh floors (real-world component sizes)
const BATTERY_MINIMUMS: Record<SystemTier, number> = {
  micro:    1.2,   // 1× 100Ah 12V
  basic:    2.4,   // 2× 100Ah 12V
  starter:  4.8,   // 1× 48V 100Ah LFP
  standard: 9.6,   // 2× 48V 100Ah LFP
  premium:  19.2,  // 4× 48V 100Ah LFP
}"""
content = content.replace(s3, "")

# 4. analyzeDaytimeLoad signature
s4 = """  singleMpptMaxW: number = 5500,
  systemTier?: SystemTier
): DaytimeHeavyAnalysis {"""
content = content.replace(s4, """  singleMpptMaxW: number = 5500
): DaytimeHeavyAnalysis {""")

# 5. batteryFloor in analyzeDaytimeLoad
s5 = """  const batteryFloor = systemTier ? BATTERY_MINIMUMS[systemTier] : 0
  const recommendedNightBatteryKwh = Math.max(rawNightBatteryKwh, batteryFloor)"""
content = content.replace(s5, """  const batteryFloor = 0;
  const recommendedNightBatteryKwh = Math.max(rawNightBatteryKwh, batteryFloor)""")

# 6. isPackageMode block
s6 = """  // STEP 9 - MODE LOGIC & VALIDATION ENGINE
  const isPackageMode = !!inputs.systemTier;
  const tierPkg = isPackageMode ? SYSTEM_PACKAGES[inputs.systemTier] : null;

  let isValid = true;
  let validationError: string | undefined;

  if (isPackageMode && tierPkg) {
    // Package Mode: strictly reject if load exceeds package, do not silently resize
    const pkgDailyGen = tierPkg.dailyOutputKwh;
    const pkgUsableKwh = tierPkg.batteryKwh * 0.80;
    const errors: string[] = [];

    if (peakSurgeKw > tierPkg.inverterKva) {
      errors.push(
        `Peak surge (${peakSurgeKw.toFixed(1)}kW) exceeds ${tierPkg.label} inverter (${tierPkg.inverterKva}kVA). Inverter will trip.`
      );
    }
    if (targetDailyLoadKwh > pkgDailyGen * 1.1) {
      errors.push(
        `Daily load (${targetDailyLoadKwh.toFixed(1)}kWh) exceeds package generation (${pkgDailyGen}kWh/day). Battery will fully deplete.`
      );
    }
    if (requiredUsableBatteryKwh > pkgUsableKwh && batteryScenario !== 'none') {
      errors.push(
        `Needed backup (${requiredUsableBatteryKwh.toFixed(1)}kWh) exceeds package battery (${pkgUsableKwh.toFixed(1)}kWh usable).`
      );
    }

    if (errors.length > 0) {
      isValid = false;
      validationError = 'INVALID SYSTEM DESIGN \u2014 DOES NOT MEET ENERGY REQUIREMENTS\\n\\n' + errors.join('\\n');
    } else {
      // Valid package: use its specs for output
      pvKwp = tierPkg.panelWatts / 1000;
      batteryKwh = tierPkg.batteryKwh;
      inverterKva = tierPkg.inverterKva;
    }
  }

  // Finalise array
  const panelSizeWatts = (isPackageMode && tierPkg) ? tierPkg.recommendedPanelWatts : 550;
  const panelsNeeded = Math.ceil((pvKwp * 1000) / panelSizeWatts);
  const actualPvKwp = (panelsNeeded * panelSizeWatts) / 1000;"""

s6_new = """  // STEP 9 - MODE LOGIC & VALIDATION ENGINE
  let isValid = true;
  let validationError: string | undefined;

  // Finalise array
  const panelSizeWatts = 550;
  const panelsNeeded = Math.ceil((pvKwp * 1000) / panelSizeWatts);
  const actualPvKwp = (panelsNeeded * panelSizeWatts) / 1000;"""
content = content.replace(s6, s6_new)

# 7. systemCost override
s7 = """  if (isPackageMode && tierPkg && isValid) {
    systemCostMin = tierPkg.priceMin + roofMountingCost;
    systemCostMax = tierPkg.priceMax + roofMountingCost;
  }"""
content = content.replace(s7, "")

# 8. batteryVoltage & selectedInverterType
s8 = """  const batteryVoltage: 12 | 24 | 48 = (isPackageMode && tierPkg)
    ? tierPkg.batteryVoltage
    : (actualPvKwp < 1 ? 12 : actualPvKwp < 3 ? 24 : 48);
  const selectedInverterType: 'hybrid' | 'off-grid' | 'pcu' | 'on-grid' = (isPackageMode && tierPkg)
    ? ((tierPkg.tier === 'micro' || tierPkg.tier === 'basic') ? 'off-grid' : 'hybrid')
    : (inverterKva >= 3 ? 'hybrid' : 'off-grid');"""
s8_new = """  const batteryVoltage: 12 | 24 | 48 = (actualPvKwp < 1 ? 12 : actualPvKwp < 3 ? 24 : 48);
  const selectedInverterType: 'hybrid' | 'off-grid' | 'pcu' | 'on-grid' = (inverterKva >= 3 ? 'hybrid' : 'off-grid');"""
content = content.replace(s8, s8_new)

# 9. finalPayback
s9 = """  const finalPayback = (isPackageMode && tierPkg && isValid)
    ? Math.round(tierPkg.paybackYears * 12)
    : genericPaybackMonths;"""
content = content.replace(s9, "  const finalPayback = genericPaybackMonths;")

# 10. finalBatteryType
s10 = """  let finalBatteryType: CalculatorResults['batteryType'] = batteryKwh > 0 ? 'lithium' : 'none';
  if (isPackageMode && tierPkg && isValid && batteryKwh > 0) {
    finalBatteryType = tierPkg.batteryType === 'LFP' ? 'lithium' : 'lead-acid';
  }"""
content = content.replace(s10, "  let finalBatteryType: CalculatorResults['batteryType'] = batteryKwh > 0 ? 'lithium' : 'none';")

# 11. analyzeDaytimeLoad call
s11 = """  const daytimeAnalysis = analyzeDaytimeLoad(appliancesWithDaytimeHours, totalPanelWatts, 5500, inputs.systemTier);"""
content = content.replace(s11, "  const daytimeAnalysis = analyzeDaytimeLoad(appliancesWithDaytimeHours, totalPanelWatts, 5500);")

# 12. return values
s12 = """    panelsNeeded: (isPackageMode && tierPkg && isValid)
      ? Math.ceil(tierPkg.panelWatts / tierPkg.recommendedPanelWatts)
      : panelsNeeded,
    panelSizeWatts: (isPackageMode && tierPkg && isValid) ? tierPkg.recommendedPanelWatts : panelSizeWatts,
    inverterKva: (isPackageMode && tierPkg && isValid) ? tierPkg.inverterKva : inverterKva,"""
s12_new = """    panelsNeeded,
    panelSizeWatts,
    inverterKva,"""
content = content.replace(s12, s12_new)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
