import re

# Fix sidebar
sidebar_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\components\forms\calc-input-sidebar.tsx'
with open(sidebar_path, 'r', encoding='utf-8') as f:
    sidebar = f.read()

sidebar = re.sub(r'import \{ motion, AnimatePresence \} from "framer-motion";\n', '', sidebar)
with open(sidebar_path, 'w', encoding='utf-8') as f:
    f.write(sidebar)


# Fix results view
results_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\components\forms\calc-results-view.tsx'
with open(results_path, 'r', encoding='utf-8') as f:
    results_view = f.read()

results_view = re.sub(r'\s*const chargeController = results\.chargeController \|\| \{ type: \'none\', amps: 0, reason: \'\', estimatedCost: 0 \} as ChargeControllerSpec;', '', results_view)
with open(results_path, 'w', encoding='utf-8') as f:
    f.write(results_view)
