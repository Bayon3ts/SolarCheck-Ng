import re

path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\components\forms\calculator-dashboard.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove systemTier: "standard",
content = re.sub(r'\s*systemTier: "standard",\n', '\n', content)

# 2. Remove import
content = re.sub(r'import \{ SYSTEM_PACKAGES, SystemTier, formatTierPrice \} from "@/data/system-packages";\n', '', content)

# 3. Remove jumpToCalculator
content = re.sub(r'/\*\* Jump to calculator and pre-select a tier \*/\n\s*function jumpToCalculator\(tier: SystemTier\) \{.*?\n\s*\}\n', '', content, flags=re.DOTALL)

# 4. Remove section
# The section starts with <section className="mb-12"> and ends before {/* ── MAIN CALCULATOR
content = re.sub(r'\{/\* ── PACKAGE CARDS SECTION ─────────────────────────────── \*/\}.*?(?=\{/\* ── MAIN CALCULATOR)', '', content, flags=re.DOTALL)

# 5. Add appliance check to handleCalculate
new_calc = """function handleCalculate() {
    if (inputs.appliances.length === 0) {
      alert("INSUFFICIENT LOAD DATA — PLEASE ADD APPLIANCES");
      return;
    }
    if (!inputs.state) {"""
content = re.sub(r'function handleCalculate\(\) \{\n\s*if \(!inputs\.state\) \{', new_calc, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
