import re

calc_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\lib\calculator\calculations.ts'
results_view_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\components\forms\calc-results-view.tsx'

# 1. Update calculations.ts
with open(calc_path, 'r', encoding='utf-8') as f:
    calc_content = f.read()

# Fix Savings logic
old_savings = """  const monthlyCurrentSpend = monthlyBill + generatorSpend;
  const monthlyGridSavingsExpected = monthlyBill * (coveragePct / 100);
  const monthlyGeneratorSavingsExpected = generatorSpend * (coveragePct / 100);"""

new_savings = """  const monthlyCurrentSpend = monthlyBill + generatorSpend;
  
  let monthlyGridSavingsExpected = 0;
  let monthlyGeneratorSavingsExpected = 0;

  if (systemMode === 'off-grid') {
    monthlyGridSavingsExpected = monthlyBill;
    monthlyGeneratorSavingsExpected = generatorSpend;
  } else {
    const potentialSavings = monthlyCurrentSpend * (coveragePct / 100);
    monthlyGridSavingsExpected = Math.min(potentialSavings, monthlyBill);
    const remainingSavings = potentialSavings - monthlyGridSavingsExpected;
    
    if (generatorSpend > 0 && remainingSavings > 0) {
      monthlyGeneratorSavingsExpected = Math.min(remainingSavings, generatorSpend);
    } else {
      monthlyGeneratorSavingsExpected = 0;
    }

    if (monthlyGridSavingsExpected >= monthlyBill * 0.99 && monthlyGeneratorSavingsExpected >= generatorSpend * 0.99) {
      // Prevent 100% dual savings if not off-grid
      monthlyGeneratorSavingsExpected = generatorSpend * 0.8;
    }
  }"""

calc_content = calc_content.replace(old_savings, new_savings)

# Fix Validation Layer
old_validation = """  if (systemMode === 'hybrid' || systemMode === 'off-grid') {
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

new_validation = """  if (batterySufficiency === 'full' && batteryKwh * 0.8 < nightLoadKwh) {
    errors.push("Invalid labeling: Battery labeled 'FULL' but capacity is less than night load.");
  }
  if (autonomyHours < 24 && systemMode === 'off-grid') {
    errors.push("Invalid configuration: Off-grid mode requires at least 24h autonomy.");
  }
  if ((monthlyGridSavingsExpected + monthlyGeneratorSavingsExpected) > monthlyCurrentSpend * 0.9 && generatorSpend === 0 && systemMode !== 'off-grid') {
    errors.push("Savings validation: Claimed savings exceed 90% of total bill without generator dependency confirmation.");
  }
  if (coveragePct === 100 && autonomyHours < 24 && systemMode !== 'off-grid') {
    errors.push("Inconsistency: 100% energy offset requires strict autonomy validation (battery insufficient for 24h).");
  }"""

calc_content = calc_content.replace(old_validation, new_validation)

with open(calc_path, 'w', encoding='utf-8') as f:
    f.write(calc_content)

# 2. Update calc-results-view.tsx
with open(results_view_path, 'r', encoding='utf-8') as f:
    res_content = f.read()

old_offset = """                <p className="font-bold text-text-primary">{energyOffsetPct ?? inputs.coveragePct}%</p>"""
new_offset = """                <p className="font-bold text-text-primary">
                  {energyOffsetPct ?? inputs.coveragePct}%
                  {(energyOffsetPct === 100 || inputs.coveragePct === 100) && autonomyHours < 24 && (
                    <span className="block text-[10px] text-amber-600 font-normal mt-0.5 leading-tight">
                      (but grid backup required)
                    </span>
                  )}
                </p>"""

res_content = res_content.replace(old_offset, new_offset)

with open(results_view_path, 'w', encoding='utf-8') as f:
    f.write(res_content)

print("Final patch applied.")
