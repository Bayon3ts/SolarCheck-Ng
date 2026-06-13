import re

types_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\lib\calculator\types.ts'
calc_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\lib\calculator\calculations.ts'
res_path = r'c:\Users\Bayonet\SolarCheck\solarcheck-ng\src\components\forms\calc-results-view.tsx'

# 1. Update TYPES.TS
with open(types_path, 'r', encoding='utf-8') as f:
    t = f.read()

qa_interface = """
export interface TruthQAReport {
  score: number;
  pvStatus: 'OPTIMAL' | 'CONSERVATIVE' | 'OVERBUILT' | 'UNDERPOWERED';
  batteryIntegrity: 'PASS' | 'BORDERLINE' | 'FAIL';
  savingsIntegrity: 'PASS' | 'INFLATED' | 'FAIL';
  flags: {
    pvBias: boolean;
    savingsBias: boolean;
    autonomyBias: boolean;
  };
  finalVerdict: 'Physics-Accurate' | 'Installer-Conservative' | 'Marketing-Biased';
  warnings: string[];
}
"""

if "TruthQAReport" not in t:
    t = t.replace("export interface LeadCaptureData", qa_interface + "\nexport interface LeadCaptureData")
    t = t.replace("  treesEquivalent: number;", "  treesEquivalent: number;\n  truthQAReport?: TruthQAReport;")
    
    with open(types_path, 'w', encoding='utf-8') as f:
        f.write(t)

# 2. Update CALCULATIONS.TS
with open(calc_path, 'r', encoding='utf-8') as f:
    c = f.read()

qa_logic = """
  // --- TRUTH QA LAYER ---
  let qaScore = 0;
  const qaWarnings: string[] = [];
  const flags = { pvBias: false, savingsBias: false, autonomyBias: false };
  
  // A. PV Accuracy
  const pvBase = targetDailyGenerationKwh / (avgPSH * systemEfficiency);
  const pvRatio = actualPvKwp / pvBase;
  let pvStatus: 'OPTIMAL' | 'CONSERVATIVE' | 'OVERBUILT' | 'UNDERPOWERED' = 'OPTIMAL';
  
  if (pvRatio >= 1.0 && pvRatio <= 1.2) {
    qaScore += 30;
    pvStatus = 'OPTIMAL';
  } else if (pvRatio > 1.2 && pvRatio <= 1.5) {
    qaScore += 15;
    pvStatus = 'CONSERVATIVE';
  } else if (pvRatio > 1.5) {
    qaScore += 0;
    pvStatus = 'OVERBUILT';
    flags.pvBias = true;
  } else {
    qaScore += 0;
    pvStatus = 'UNDERPOWERED';
  }

  // B. Battery Realism
  let batteryIntegrity: 'PASS' | 'BORDERLINE' | 'FAIL' = 'PASS';
  const claimedAutonomy = autonomyHours;
  const theoreticalAutonomy = nightLoadKwh > 0 ? (batteryKwh * 0.8 * 0.85) / (nightLoadKwh / 12) : 0;
  const autonomyDiff = Math.abs(claimedAutonomy - theoreticalAutonomy);
  
  if (autonomyDiff <= theoreticalAutonomy * 0.1 || theoreticalAutonomy === 0) {
    qaScore += 25;
  } else if (autonomyDiff <= theoreticalAutonomy * 0.2) {
    qaScore += 10;
    batteryIntegrity = 'BORDERLINE';
  } else {
    qaScore += 0;
    batteryIntegrity = 'FAIL';
    flags.autonomyBias = true;
  }

  // C. Savings Realism
  let savingsIntegrity: 'PASS' | 'INFLATED' | 'FAIL' = 'PASS';
  const totalClaimedSavings = monthlyGridSavingsExpected + monthlyGeneratorSavingsExpected;
  const theoreticalDisplacement = monthlyCurrentSpend * (coveragePct / 100);
  
  if (totalClaimedSavings <= theoreticalDisplacement * 1.05) {
    qaScore += 25;
  } else if (totalClaimedSavings <= theoreticalDisplacement * 1.30) {
    qaScore += 10;
    savingsIntegrity = 'INFLATED';
  } else {
    qaScore += 0;
    savingsIntegrity = 'FAIL';
    flags.savingsBias = true;
  }

  // D. System Label Integrity
  if (pvClassification === 'OPTIMAL' && pvRatio > 1.2) {
    qaScore += 0;
  } else if (pvClassification === 'OVER SIZED' && pvRatio <= 1.5) {
    qaScore += 0;
  } else {
    qaScore += 20;
  }

  // Auto-Fail Conditions
  let autoFail = false;
  if (pvClassification === 'OPTIMAL' && pvRatio > 1.2) autoFail = true;
  if (totalClaimedSavings > theoreticalDisplacement * 1.30) autoFail = true;
  if (systemMode !== 'off-grid' && autonomyHours > 24 && batteryKwh < 15) autoFail = true;
  if ((batterySufficiency === 'adequate' || batterySufficiency === 'full') && autonomyHours < 10) autoFail = true;

  if (autoFail) {
    qaScore = Math.min(qaScore, 49); // Force < 50
  }

  // Warnings & Final Verdict
  if (qaScore < 85) {
    if (pvRatio > 1.2) qaWarnings.push("System is overbuilt for reliability, not cost optimization.");
    if (autonomyHours < 10 && batterySufficiency !== 'insufficient') qaWarnings.push("Night autonomy is limited under real-world discharge conditions.");
    if (totalClaimedSavings > theoreticalDisplacement * 1.05) qaWarnings.push("Savings assume high displacement efficiency; real-world variance expected.");
  }

  let finalVerdict: 'Physics-Accurate' | 'Installer-Conservative' | 'Marketing-Biased' = 'Physics-Accurate';
  if (qaScore >= 85) finalVerdict = 'Physics-Accurate';
  else if (qaScore >= 50) finalVerdict = 'Installer-Conservative';
  else finalVerdict = 'Marketing-Biased';

  const truthQAReport = {
    score: qaScore,
    pvStatus,
    batteryIntegrity,
    savingsIntegrity,
    flags,
    finalVerdict,
    warnings: qaWarnings
  };

  return {
"""

if "TRUTH QA LAYER" not in c:
    c = c.replace("  return {\n    isValid,", qa_logic + "    isValid,")
    c = c.replace("    daytimeAnalysis,\n  };", "    daytimeAnalysis,\n    truthQAReport,\n  };")
    
    with open(calc_path, 'w', encoding='utf-8') as f:
        f.write(c)

# 3. Update RESULTS VIEW
with open(res_path, 'r', encoding='utf-8') as f:
    r = f.read()

qa_ui = """
      {/* TRUTH QA LAYER (DEBUG VISIBILITY FOR QA) */}
      {results.truthQAReport && (
        <div className={`border rounded-xl p-5 mb-6 ${results.truthQAReport.score >= 85 ? 'bg-emerald-50 border-emerald-200' : results.truthQAReport.score >= 50 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-800 flex items-center gap-2">
              <span>🧪</span> System Validation Report
            </h3>
            <span className={`font-bold text-lg ${results.truthQAReport.score >= 85 ? 'text-emerald-700' : results.truthQAReport.score >= 50 ? 'text-blue-700' : 'text-red-700'}`}>
              Truth Score: {results.truthQAReport.score}/100
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
            <div className="bg-white p-2 rounded border shadow-sm">
              <span className="block text-gray-500 mb-1">PV Status</span>
              <span className={`font-bold ${results.truthQAReport.pvStatus === 'OPTIMAL' ? 'text-emerald-600' : 'text-amber-600'}`}>{results.truthQAReport.pvStatus}</span>
            </div>
            <div className="bg-white p-2 rounded border shadow-sm">
              <span className="block text-gray-500 mb-1">Battery Integrity</span>
              <span className={`font-bold ${results.truthQAReport.batteryIntegrity === 'PASS' ? 'text-emerald-600' : 'text-red-600'}`}>{results.truthQAReport.batteryIntegrity}</span>
            </div>
            <div className="bg-white p-2 rounded border shadow-sm">
              <span className="block text-gray-500 mb-1">Savings Integrity</span>
              <span className={`font-bold ${results.truthQAReport.savingsIntegrity === 'PASS' ? 'text-emerald-600' : 'text-red-600'}`}>{results.truthQAReport.savingsIntegrity}</span>
            </div>
            <div className="bg-white p-2 rounded border shadow-sm">
              <span className="block text-gray-500 mb-1">Final Verdict</span>
              <span className="font-bold text-gray-900">{results.truthQAReport.finalVerdict}</span>
            </div>
          </div>
          
          {results.truthQAReport.warnings.length > 0 && (
            <div className="bg-white/60 p-3 rounded-lg border border-amber-200 text-xs text-amber-800 space-y-1">
              <p className="font-bold mb-2">⚠️ System Warnings:</p>
              <ul className="list-disc pl-4 space-y-1">
                {results.truthQAReport.warnings.map((warn: string, i: number) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
"""

if "TRUTH QA LAYER" not in r:
    r = r.replace("{/* SECTION: SYSTEM & SAVINGS METRICS */}", qa_ui + "\n      {/* SECTION: SYSTEM & SAVINGS METRICS */}")
    
    with open(res_path, 'w', encoding='utf-8') as f:
        f.write(r)

print("Truth QA layer patch applied")
