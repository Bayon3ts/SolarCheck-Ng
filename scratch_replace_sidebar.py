import re

path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\components\forms\calc-input-sidebar.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove import
content = re.sub(r'import \{ SYSTEM_PACKAGES, SystemTier, formatTierPrice, getNextTier \} from "@/data/system-packages";\n', '', content)

# 2. Remove states and helpers
content = re.sub(r'const \[showAllCanPower, setShowAllCanPower\] = useState\(false\);\n', '', content)

helpers_regex = r'// ── Tier support helpers ──────────────────────────────────.*?return "a higher tier";\s*\}'
content = re.sub(helpers_regex, '', content, flags=re.DOTALL)

# 3. Remove SYSTEM TIER SELECTOR block
tier_regex = r'\{/\* ══════════════════════════════════════════════════ \*/\}\s*\{/\* SYSTEM TIER SELECTOR — appears first\s*\*/\}\s*\{/\* ══════════════════════════════════════════════════ \*/\}.*?(?=\{/\* ══════════════════════════════════════════════════ \*/\}\s*\{/\* HOME DETAILS)'
content = re.sub(tier_regex, '', content, flags=re.DOTALL)

# 4. We need to move the Appliances Section to the top, before HOME DETAILS.
# Let's extract Appliances Section
appliances_regex = r'(\{/\* Appliances Section \*/\}.*?(?=\{/\* Advanced Settings Accordion \*/\}))'
match = re.search(appliances_regex, content, flags=re.DOTALL)
if match:
    appliances_block = match.group(1)
    # remove it from original place
    content = content.replace(appliances_block, '')
    
    # insert it before HOME DETAILS
    home_details_marker = '{/* ══════════════════════════════════════════════════ */}\n      {/* HOME DETAILS'
    content = content.replace(home_details_marker, appliances_block + '\n      ' + home_details_marker)

# 5. Inside Appliances Section, clean up tier hint and supported checks
# Remove Tier hint
tier_hint_regex = r'\{/\* Tier hint \*/\}.*?</div>\s*<input'
content = re.sub(tier_hint_regex, '<input', content, flags=re.DOTALL)

# Replace supported and upgradeTo logic
content = re.sub(r'const supported = isApplianceSupported\(app\.id\);', 'const supported = true;', content)
content = re.sub(r'const upgradeTo = supported \? null : getUpgradeTierLabel\(app\.id\);', 'const upgradeTo = null;', content)
content = re.sub(r'title=\{supported \? undefined : `Upgrade to \$\{upgradeTo\} to include this appliance`\}', '', content)
content = re.sub(r'\$\{supported \? "border-gray-100 opacity-100" : "border-gray-100 opacity-40"\s*\}', 'border-gray-100 opacity-100', content)
content = re.sub(r'\$\{supported \? `\$\{app\.kwhPerDay\} kWh/day • \$\{app\.watts\}W` : `⬆ Needs \$\{upgradeTo\}`\}', '${app.kwhPerDay} kWh/day • ${app.watts}W', content)
content = re.sub(r'\$\{qty > 0 && supported && \(', '${qty > 0 && (', content)
content = re.sub(r'\$\{!supported \? "pointer-events-none" : ""\}', '', content)

# 6. Change CTA button text
content = content.replace('Calculate My Solar Savings →', 'Analyze my energy usage')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
