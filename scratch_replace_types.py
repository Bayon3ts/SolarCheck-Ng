import re

path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\lib\calculator\types.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove SystemTier type
content = re.sub(
    r'// System tier.*?export type SystemTier.*?;',
    '',
    content,
    flags=re.DOTALL
)

# Remove systemTier from CalculatorInputs
content = re.sub(
    r'// System tier \(drives appliance filtering & pre-fill\)\s*systemTier: SystemTier;\s*',
    '',
    content
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
