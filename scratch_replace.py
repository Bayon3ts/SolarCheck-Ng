import re

path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\lib\calculator\calculations.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove recommendTierFromSpend
content = re.sub(
    r'/\*\*.*?recommendTierFromSpend.*?\n\}',
    '',
    content,
    flags=re.DOTALL
)

# 2. Remove BATTERY_MINIMUMS
content = re.sub(
    r'// Per-tier minimum battery kWh floors.*?\}',
    '',
    content,
    flags=re.DOTALL
)

# 3. Remove SystemTier arg from analyzeDaytimeLoad
content = re.sub(
    r'singleMpptMaxW: number = 5500,\s*systemTier\?: SystemTier',
    'singleMpptMaxW: number = 5500',
    content
)

# 4. Remove batteryFloor = systemTier ? ...
content = re.sub(
    r'const batteryFloor = systemTier \? BATTERY_MINIMUMS\[systemTier\] : 0',
    'const batteryFloor = 0',
    content
)

# 5. Remove SystemTier from imports
content = re.sub(
    r'import \{ CalculatorInputs, CalculatorResults, SystemTier \} from \'./types\';',
    'import { CalculatorInputs, CalculatorResults } from \'./types\';',
    content
)

# 6. Remove SYSTEM_PACKAGES from imports
content = re.sub(
    r'import \{ SYSTEM_PACKAGES \} from \'@/data/system-packages\';\n',
    '',
    content
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
