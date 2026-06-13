import re

types_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\lib\calculator\types.ts'
calc_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\lib\calculator\calculations.ts'
results_view_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\components\forms\calc-results-view.tsx'

# 1. Update types.ts
with open(types_path, 'r', encoding='utf-8') as f:
    types_content = f.read()

types_content = re.sub(
    r"export type BatterySufficiency = 'partial' \| 'adequate' \| 'full autonomy';",
    r"export type BatterySufficiency = 'low' | 'adequate' | 'strong' | 'full';",
    types_content
)

with open(types_path, 'w', encoding='utf-8') as f:
    f.write(types_content)

# 2. Update calculations.ts
with open(calc_path, 'r', encoding='utf-8') as f:
    calc_content = f.read()

# Fix batterySufficiency declaration
calc_content = calc_content.replace(
    "let batterySufficiency: 'partial' | 'adequate' | 'full autonomy' = 'adequate';",
    "let batterySufficiency: 'low' | 'adequate' | 'strong' | 'full' = 'adequate';"
)

# Replace the step 4 assignments of batterySufficiency
calc_content = calc_content.replace(
    "batterySufficiency = 'partial';",
    "batterySufficiency = 'low';"
)
calc_content = calc_content.replace(
    "batterySufficiency = 'full autonomy';",
    "batterySufficiency = 'full';"
)

# Fix autonomy calculation
old_autonomy_calc = """  let autonomyHours = 0;
  if (batteryKwh > 0 && dailyLoadKwh > 0) {
    autonomyHours = (batteryKwh * 0.8) / (dailyLoadKwh / 24);
  }"""
new_autonomy_calc = """  let autonomyHours = 0;
  if (batteryKwh > 0 && nightLoadKwh > 0) {
    autonomyHours = (batteryKwh * 0.8) / (nightLoadKwh / 12);
  } else if (batteryKwh > 0 && dailyLoadKwh > 0) {
    autonomyHours = (batteryKwh * 0.8) / (dailyLoadKwh / 24);
  }
  
  if (systemMode !== 'grid-tied') {
    if (autonomyHours < 4) batterySufficiency = 'low';
    else if (autonomyHours <= 8) batterySufficiency = 'adequate';
    else if (autonomyHours <= 12) batterySufficiency = 'strong';
    else batterySufficiency = 'full';
  }"""
calc_content = calc_content.replace(old_autonomy_calc, new_autonomy_calc)

# Fix validation layer
old_validation = """  if (systemMode === 'hybrid' || systemMode === 'off-grid') {
    if (batteryKwh > 0 && batteryKwh * 0.8 < nightLoadKwh * 0.9) { // 10% tolerance
      errors.push("Grid dependence at night: Battery capacity is lower than estimated night load.");
    }
  }
  if (coveragePct === 100 && systemMode !== 'off-grid' && batteryKwh * 0.8 < dailyLoadKwh * 0.9) {
    errors.push("Inconsistency: 100% coverage requested, but battery capacity does not support full 24hr autonomy.");
  }
  if (monthlyGridSavingsExpected + monthlyGeneratorSavingsExpected > monthlyCurrentSpend * 0.9) {
    errors.push("Savings validation: Claimed savings exceed 90% of total bill. Ensure load realism.");
  }"""

new_validation = """  if (systemMode === 'hybrid' || systemMode === 'off-grid') {
    if (batteryKwh * 0.8 < nightLoadKwh * 0.9) { // 10% tolerance
      errors.push("Grid dependence at night: Battery capacity is lower than estimated night load.");
    }
  }
  if (coveragePct === 100 && systemMode !== 'off-grid' && batteryKwh * 0.8 < dailyLoadKwh * 0.9) {
    errors.push("Inconsistency: 100% coverage requested, but battery capacity does not support full 24hr autonomy.");
  }
  if (monthlyGridSavingsExpected + monthlyGeneratorSavingsExpected > monthlyCurrentSpend * 0.9) {
    errors.push("Savings validation: Claimed savings exceed 90% of total bill. Ensure load realism.");
  }
  if (systemMode === 'off-grid' && autonomyHours < 24) {
    errors.push("Invalid configuration: Off-grid mode requires at least 24h autonomy.");
  }"""
calc_content = calc_content.replace(old_validation, new_validation)

with open(calc_path, 'w', encoding='utf-8') as f:
    f.write(calc_content)

# 3. Update calc-results-view.tsx
with open(results_view_path, 'r', encoding='utf-8') as f:
    res_content = f.read()

res_content = res_content.replace(
    "const sufficiencyColor = sufficiencyLabel === 'full autonomy' ? 'text-green-700 bg-green-50 border-green-200'",
    "const sufficiencyColor = sufficiencyLabel === 'full' ? 'text-green-700 bg-green-50 border-green-200'"
)
res_content = res_content.replace(
    ": sufficiencyLabel === 'partial' ? 'text-amber-700 bg-amber-50 border-amber-200'",
    ": sufficiencyLabel === 'low' ? 'text-amber-700 bg-amber-50 border-amber-200'"
)

with open(results_view_path, 'w', encoding='utf-8') as f:
    f.write(res_content)

print("Patch applied.")
