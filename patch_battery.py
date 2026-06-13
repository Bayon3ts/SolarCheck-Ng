import re

calc_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\lib\calculator\calculations.ts'

with open(calc_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix batterySufficiency logic and assignments
old_logic = """  let batterySufficiency: 'low' | 'adequate' | 'strong' | 'full' = 'adequate';

  if (systemMode === 'grid-tied') {
    requiredBatteryUsableKwh = 0; // minimal backup
    batterySufficiency = 'low';
  } else if (systemMode === 'off-grid') {
    // Battery >= 1.2 * total daily load minimum
    requiredBatteryUsableKwh = dailyLoadKwh * 1.2;
    batterySufficiency = 'full';
  } else {
    // Hybrid mode (default)
    // Battery kWh >= night load ÷ usable depth-of-discharge (0.8 for LFP)
    // Applying autonomy requirement (0.5, 1, 2+)
    requiredBatteryUsableKwh = nightLoadKwh * (autonomyDays || 1);
    
    if ((autonomyDays || 1) < 1) batterySufficiency = 'low';
    else if ((autonomyDays || 1) >= 2) batterySufficiency = 'full';
    else batterySufficiency = 'adequate';
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
  
  if (systemMode !== 'grid-tied') {
    if (autonomyHours < 4) batterySufficiency = 'low';
    else if (autonomyHours <= 8) batterySufficiency = 'adequate';
    else if (autonomyHours <= 12) batterySufficiency = 'strong';
    else batterySufficiency = 'full';
  }"""

new_logic = """  let batterySufficiency: 'insufficient' | 'limited' | 'adequate' | 'strong' | 'full' = 'adequate';

  if (systemMode === 'grid-tied') {
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

content = content.replace(old_logic, new_logic)

with open(calc_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Battery logic patch applied.")
