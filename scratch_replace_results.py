import re

path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\components\forms\calc-results-view.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = re.sub(r'import \{ ChargeControllerSpec, DaytimeHeavyAnalysis, recommendTierFromSpend \} from "@/lib/calculator/calculations";\n', 'import { ChargeControllerSpec, DaytimeHeavyAnalysis } from "@/lib/calculator/calculations";\n', content)
content = re.sub(r'import \{ SystemTier \} from "@/lib/calculator/types";\n', '', content)
content = re.sub(r'import \{ SYSTEM_PACKAGES \} from "@/data/system-packages";\n', '', content)

# 2. State/helpers
tier_helpers_regex = r'// ── Tier helpers \(FIX 2\) ────────────────────────────────────────.*?const showTierSuggestion =.*?isTierLower\(inputs\.systemTier, suggestedTier\);'
content = re.sub(tier_helpers_regex, '', content, flags=re.DOTALL)

battery_chemistry_regex = r'// ── Battery chemistry display \(FIX 4\) ───────────────────────────.*?const pkgBatteryVoltage = tierPkg\.batteryVoltage; // 12 \| 24 \| 48'
content = re.sub(battery_chemistry_regex, '', content, flags=re.DOTALL)

# 3. Battery label in JSX
battery_jsx_old = """{batteryType !== 'none' && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pkgBatteryLabel === 'LFP'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                    {pkgBatteryLabel}{' · '}{pkgBatteryVoltage}V
                  </span>
                )}"""
battery_jsx_new = """{batteryType !== 'none' && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${batteryType === 'lithium'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                    {batteryType === 'lithium' ? 'LFP' : 'Lead-Acid'}
                  </span>
                )}"""
content = content.replace(battery_jsx_old, battery_jsx_new)

# 4. FIX 1 - Daytime analysis condition
daytime_cond_old = """{daytimeAnalysis.isDaytimeHeavy &&
        (inputs.systemTier === 'standard' || inputs.systemTier === 'premium') &&
        daytimeAnalysis.daytimeLoadKw >= 1.5 && ("""
daytime_cond_new = """{daytimeAnalysis.isDaytimeHeavy &&
        daytimeAnalysis.daytimeLoadKw >= 1.5 && ("""
content = content.replace(daytime_cond_old, daytime_cond_new)

# 5. FIX 2 - TIER SUGGESTION BANNER
tier_banner_regex = r'\{/\* ── FIX 2 — TIER SUGGESTION BANNER ── \*/\}.*?\{\s*showTierSuggestion && \(.*?</div>\s*\)\}'
content = re.sub(tier_banner_regex, '', content, flags=re.DOTALL)

# 6. COMPONENT BREAKDOWN
comp_breakdown_regex = r'\{/\* ── COMPONENT BREAKDOWN \(micro / basic / starter\) ── \*/\}.*?\}\)\(\)\}'
content = re.sub(comp_breakdown_regex, '', content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
