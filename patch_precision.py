import re

types_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\lib\calculator\types.ts'
calc_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\lib\calculator\calculations.ts'
res_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\components\forms\calc-results-view.tsx'

# 1. TYPES.TS
with open(types_path, 'r', encoding='utf-8') as f:
    t = f.read()
t = t.replace("optimistic: number;", "stressCase: number;")
t = t.replace("export type SystemMode = 'grid-tied' | 'hybrid' | 'off-grid';", "export type SystemMode = 'grid-tied' | 'hybrid' | 'off-grid';\nexport type PvSizingClassification = 'UNDER SIZED' | 'OPTIMAL' | 'OVER SIZED';\nexport type SeasonalRisk = 'Rainy season stable' | 'Rainy season borderline' | 'Rainy season at risk';")
t = t.replace("  batterySufficiency: BatterySufficiency;", "  batterySufficiency: BatterySufficiency;\n  pvClassification: PvSizingClassification;\n  seasonalRisk: SeasonalRisk;")
with open(types_path, 'w', encoding='utf-8') as f:
    f.write(t)

# 2. CALCULATIONS.TS
with open(calc_path, 'r', encoding='utf-8') as f:
    c = f.read()

# A. pvKwp sizing and classification
old_pvkwp = "  const pvKwp = targetDailyGenerationKwh / (avgPSH * systemEfficiency);"
new_pvkwp = """  const annualReq = targetDailyGenerationKwh / (avgPSH * systemEfficiency);
  const rainyReq = targetDailyGenerationKwh / (avgPSH * 0.6 * systemEfficiency);
  const pvKwp = Math.max(annualReq, rainyReq);"""
c = c.replace(old_pvkwp, new_pvkwp)

old_pv_end = """  // FINALISE ARRAY
  const panelSizeWatts = 550;
  const panelsNeeded = Math.ceil((pvKwp * 1000) / panelSizeWatts);
  const actualPvKwp = (panelsNeeded * panelSizeWatts) / 1000;"""
new_pv_end = """  // FINALISE ARRAY
  const panelSizeWatts = 550;
  const panelsNeeded = Math.ceil((pvKwp * 1000) / panelSizeWatts);
  const actualPvKwp = (panelsNeeded * panelSizeWatts) / 1000;

  let pvClassification: 'UNDER SIZED' | 'OPTIMAL' | 'OVER SIZED' = 'OPTIMAL';
  if (actualPvKwp < rainyReq * 0.9) {
    pvClassification = 'UNDER SIZED';
  } else if (actualPvKwp <= rainyReq * 1.25) {
    pvClassification = 'OPTIMAL';
  } else {
    pvClassification = 'OVER SIZED';
  }

  let seasonalRisk: 'Rainy season stable' | 'Rainy season borderline' | 'Rainy season at risk';
  const rainyProduction = actualPvKwp * avgPSH * 0.6 * systemEfficiency;
  if (rainyProduction >= targetDailyGenerationKwh) {
    seasonalRisk = 'Rainy season stable';
  } else if (rainyProduction >= targetDailyGenerationKwh * 0.8) {
    seasonalRisk = 'Rainy season borderline';
  } else {
    seasonalRisk = 'Rainy season at risk';
  }"""
c = c.replace(old_pv_end, new_pv_end)

# B. Battery logic
old_bat = """  if (systemMode === 'grid-tied') {
    requiredBatteryUsableKwh = 0; // minimal backup
  } else if (systemMode === 'off-grid') {
    // Battery >= 1.2 * total daily load minimum
    requiredBatteryUsableKwh = dailyLoadKwh * 1.2;
  } else {
    // Hybrid mode (default)
    // Battery kWh >= night load ÷ usable depth-of-discharge (0.8 for LFP)
    // Applying autonomy requirement (0.5, 1, 2+)
    requiredBatteryUsableKwh = nightLoadKwh * (autonomyDays || 1);
  }

  // DoD for LFP is 0.8
  let batteryKwh = requiredBatteryUsableKwh > 0 ? requiredBatteryUsableKwh / 0.8 : 0;
  
  // Round up to nearest standard LFP block
  if (batteryKwh > 0) {
    batteryKwh = Math.max(2.4, Math.ceil(batteryKwh / 1.2) * 1.2);
    batteryKwh = Math.round(batteryKwh * 10) / 10;
  }

  let autonomyHours = 0;
  if (batteryKwh > 0 && nightLoadKwh > 0) {
    autonomyHours = (batteryKwh * 0.8) / (nightLoadKwh / 12);
  } else if (batteryKwh > 0 && dailyLoadKwh > 0) {
    autonomyHours = (batteryKwh * 0.8) / (dailyLoadKwh / 24);
  }
  
  const usableBattery = batteryKwh * 0.8;
  if (systemMode === 'grid-tied') {
    batterySufficiency = 'insufficient';
  } else {
    // Compare against NIGHT LOAD ONLY
    if (usableBattery < nightLoadKwh * 0.8) {
      batterySufficiency = 'insufficient';
    } else if (usableBattery <= nightLoadKwh * 1.2) {
      batterySufficiency = 'limited';
    } else if (usableBattery >= nightLoadKwh * 2) {
      batterySufficiency = 'strong';
    } else {
      batterySufficiency = 'adequate';
    }
    
    // NEVER output 'FULL' unless Battery supports >= 24h autonomy under real load
    if (autonomyHours >= 24) {
      batterySufficiency = 'full';
    }
  }"""
new_bat = """  if (systemMode === 'grid-tied') {
    requiredBatteryUsableKwh = 0; // minimal backup
  } else if (systemMode === 'off-grid') {
    requiredBatteryUsableKwh = dailyLoadKwh * 1.2;
  } else {
    // Hybrid mode (default)
    // We want ADEQUATE to hit >= 1.4, so ensure sizing hits it if they selected >=1
    requiredBatteryUsableKwh = nightLoadKwh * Math.max(autonomyDays || 1, 1.4);
  }

  // DoD for LFP is 0.8, System Loss is 0.85
  let batteryKwh = requiredBatteryUsableKwh > 0 ? requiredBatteryUsableKwh / (0.8 * 0.85) : 0;
  
  if (batteryKwh > 0) {
    batteryKwh = Math.max(2.4, Math.ceil(batteryKwh / 1.2) * 1.2);
    batteryKwh = Math.round(batteryKwh * 10) / 10;
  }

  let autonomyHours = 0;
  if (batteryKwh > 0 && nightLoadKwh > 0) {
    autonomyHours = (batteryKwh * 0.8 * 0.85) / (nightLoadKwh / 12);
  } else if (batteryKwh > 0 && dailyLoadKwh > 0) {
    autonomyHours = (batteryKwh * 0.8 * 0.85) / (dailyLoadKwh / 24);
  }
  
  const usableBattery = batteryKwh * 0.8 * 0.85;
  if (systemMode === 'grid-tied') {
    batterySufficiency = 'insufficient';
  } else {
    if (usableBattery < nightLoadKwh * 1.1) {
      batterySufficiency = 'insufficient';
    } else if (usableBattery < nightLoadKwh * 1.4) {
      batterySufficiency = 'limited';
    } else if (usableBattery < nightLoadKwh * 1.8) {
      batterySufficiency = 'adequate';
    } else {
      batterySufficiency = 'strong';
    }
    
    if (autonomyHours >= 24) {
      batterySufficiency = 'full';
    }
  }"""
c = c.replace(old_bat, new_bat)

# C. Savings Logic
old_sav = """    if (monthlyGridSavingsExpected >= monthlyBill * 0.99 && monthlyGeneratorSavingsExpected >= generatorSpend * 0.99) {
      // Prevent 100% dual savings if not off-grid
      monthlyGeneratorSavingsExpected = generatorSpend * 0.8;
    }
  }

  const calculateRange = (base: number) => ({
    conservative: Math.round(base * 0.8),
    expected: Math.round(base),
    optimistic: Math.round(base * 1.2)
  });"""
new_sav = """    if (monthlyGridSavingsExpected >= monthlyBill * 0.99 && monthlyGeneratorSavingsExpected >= generatorSpend * 0.99) {
      // Prevent 100% dual savings if not off-grid
      monthlyGeneratorSavingsExpected = generatorSpend * 0.8;
    }
    if (systemMode === 'hybrid') {
      monthlyGeneratorSavingsExpected *= 0.5; // 50% probability factor
    }
  }

  const calculateRange = (base: number) => ({
    conservative: Math.round(base * 0.8),
    expected: Math.round(base),
    stressCase: Math.round(base * 0.5)
  });"""
c = c.replace(old_sav, new_sav)

old_ret = """    co2SavedKgPerYear,
    treesEquivalent
  };"""
new_ret = """    co2SavedKgPerYear,
    treesEquivalent,
    pvClassification,
    seasonalRisk
  };"""
c = c.replace(old_ret, new_ret)

with open(calc_path, 'w', encoding='utf-8') as f:
    f.write(c)

# 3. RESULTS VIEW
with open(res_path, 'r', encoding='utf-8') as f:
    r = f.read()

r = r.replace("results.fiveYearSavings.optimistic", "results.fiveYearSavings.stressCase")
r = r.replace("results.tenYearSavings.optimistic", "results.tenYearSavings.stressCase")
r = r.replace("results.monthlyGridSavings.optimistic", "results.monthlyGridSavings.stressCase")
r = r.replace("results.monthlyGeneratorSavings.optimistic", "results.monthlyGeneratorSavings.stressCase")
r = r.replace(">Optimistic<", ">Stress-case<")
r = r.replace("> Optimistic", "> Stress-case")

old_panels_ui = """                <span className="font-bold text-primary text-lg">{panelsNeeded} panels</span>
                <p className="text-xs text-gray-400">({panelSizeWatts}W panels)</p>"""

new_panels_ui = """                <div className="flex flex-col items-end">
                  <span className="font-bold text-primary text-lg">{panelsNeeded} panels</span>
                  <div className="flex items-center gap-1">
                    <p className={`text-[10px] uppercase font-bold px-1 rounded ${results.pvClassification === 'OPTIMAL' ? 'text-emerald-600 bg-emerald-50' : results.pvClassification === 'OVER SIZED' ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'}`}>
                      {results.pvClassification}
                    </p>
                    <p className="text-xs text-gray-400">({panelSizeWatts}W)</p>
                  </div>
                </div>"""

r = r.replace(old_panels_ui, new_panels_ui)

old_sys_size = """            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-text-muted text-sm font-medium">System Size</span>
              <span className="font-bold text-text-primary">{pvKwp.toFixed(1)} kWp / {inverterKva}kVA</span>
            </div>"""

new_sys_size = """            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-text-muted text-sm font-medium">System Size</span>
              <div className="text-right flex flex-col items-end">
                <span className="font-bold text-text-primary">{pvKwp.toFixed(1)} kWp / {inverterKva}kVA</span>
                <span className={`text-[10px] px-1 py-0.5 rounded font-medium mt-0.5 ${results.seasonalRisk === 'Rainy season stable' ? 'bg-blue-50 text-blue-700' : results.seasonalRisk === 'Rainy season borderline' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                  {results.seasonalRisk}
                </span>
              </div>
            </div>"""

r = r.replace(old_sys_size, new_sys_size)

with open(res_path, 'w', encoding='utf-8') as f:
    f.write(r)

print("Precision patch applied")
