import { BatteryModel, BatteryBrand, nigeriaLifespanYears, costPerCycle } from '@/data/compare-batteries'
import Link from 'next/link'

interface BatteryCompareVerdictProps {
  battery1: BatteryModel
  brand1: BatteryBrand
  battery2: BatteryModel
  brand2: BatteryBrand
}

const getBatteryScore = (b: BatteryModel): number => {
  let s = 0
  
  // Usable kWh per ₦1M spent (value)
  const midPrice = (b.priceMin + b.priceMax) / 2
  const valuePerMillion = (b.usableKwh / midPrice) * 1000000
  s += Math.min(valuePerMillion * 0.8, 2.5)
  
  // Cycle life (longevity) — up to 3 points
  s += (b.cycleLife / 6000) * 3.0
  
  // Heat tolerance (Nigerian climate) — 1pt
  const tempScore = Math.min((b.operatingTempMax - 40) / 15, 1)
  s += Math.max(tempScore, 0) * 1.0
  
  // Warranty — up to 1.5 points
  s += Math.min(b.warranty / 10, 1) * 1.5
  
  // DoD — up to 1 point
  s += (b.dod / 100) * 1.0
  
  // No maintenance = 0.5 bonus
  if (!b.maintenanceRequired) s += 0.5
  
  // BMS protection = 0.5 bonus
  if (b.builtInBms) s += 0.5
  
  return Math.min(Math.round(s * 10) / 10, 10)
}

function generateBatteryVerdict(
  b1: BatteryModel, br1: BatteryBrand,
  b2: BatteryModel, br2: BatteryBrand,
  s1: number, s2: number
): string {
  
  const winner = s1 >= s2 ? 
    { b: b1, br: br1, s: s1 } : 
    { b: b2, br: br2, s: s2 }
  const loser = s1 >= s2 ? 
    { b: b2, br: br2 } : 
    { b: b1, br: br1 }

  // Cost per cycle comparison
  const cpc1 = costPerCycle(b1)
  const cpc2 = costPerCycle(b2)
  const cheaperCycle = cpc1 < cpc2 ? br1.brandName : br2.brandName
  const cheaperCycleAmt = Math.min(cpc1, cpc2)

  // Nigeria lifespan
  const life1 = nigeriaLifespanYears(b1)
  const life2 = nigeriaLifespanYears(b2)

  let verdict = `When comparing ${br1.brandName} and ${br2.brandName} for Nigerian homes, the ${winner.br.brandName} ${winner.b.modelName} scores ${winner.s.toFixed(1)}/10 under our Nigerian conditions weighting. `

  // Chemistry difference
  if (b1.chemistry !== b2.chemistry) {
    verdict += `The most important factor here isn't brand — it's technology. ${b1.chemistry === 'LFP' ? br1.brandName : br2.brandName}'s LFP lithium chemistry delivers full usable capacity, while ${b1.chemistry !== 'LFP' ? br1.brandName : br2.brandName}'s ${b1.chemistry !== 'LFP' ? b1.chemistry : b2.chemistry} technology typically only delivers 50% of its stated capacity. `
  }

  // Usable kWh
  if (Math.abs(b1.usableKwh - b2.usableKwh) > 0.5) {
    verdict += `In practice, the winner gives you ${winner.b.usableKwh}kWh usable vs ${loser.b.usableKwh}kWh — that gap could be the difference between your fridge running through the night or not. `
  }

  // Cost per cycle
  verdict += `Calculated over the battery's lifetime, the ${cheaperCycle} costs just ₦${cheaperCycleAmt.toLocaleString()} per charge cycle — making it the better long-term value despite higher upfront cost. `

  // Nigeria lifespan
  verdict += `Under typical Nigerian cycling patterns (grid on and off multiple times daily), the winner lasts an estimated ${Math.max(life1, life2).toFixed(1)} years before significant capacity degradation. `

  // Heat note
  if (winner.b.operatingTempMax >= 55) {
    verdict += `Its ${winner.b.operatingTempMax}°C maximum operating temperature is excellent for Nigerian battery rooms that regularly hit 40–50°C in dry season. `
  }

  // Maintenance note
  if (b1.maintenanceRequired !== b2.maintenanceRequired) {
    const mainBrand = b1.maintenanceRequired ? br1.brandName : br2.brandName
    verdict += `Note: the ${mainBrand} requires periodic water topping — factor that into your decision if you prefer a fit-and-forget system. `
  }

  return verdict
}

export default function BatteryCompareVerdict({
  battery1,
  brand1,
  battery2,
  brand2,
}: BatteryCompareVerdictProps) {
  const score1 = getBatteryScore(battery1)
  const score2 = getBatteryScore(battery2)
  const winnerBattery = score1 >= score2 ? battery1 : battery2

  return (
    <div className="bg-background rounded-3xl border border-border p-8 mt-8">
      {/* Score row */}
      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        <div>
          <div className="text-4xl font-black text-primary">
            {score1.toFixed(1)}
            <span className="text-base font-normal text-text-muted">/10</span>
          </div>
          <div className="text-sm font-semibold text-text-primary mt-1">
            {brand1.brandName}
          </div>
          <div className="text-xs text-text-muted">
            {battery1.modelName}
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center">
          {score1 > score2 && (
            <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
              WINNER
            </div>
          )}
          {score1 === score2 && (
            <div className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full mb-2">
              TIE
            </div>
          )}
        </div>

        <div>
           <div className="text-4xl font-black text-primary">
            {score2.toFixed(1)}
            <span className="text-base font-normal text-text-muted">/10</span>
          </div>
          <div className="text-sm font-semibold text-text-primary mt-1">
            {brand2.brandName}
          </div>
          <div className="text-xs text-text-muted">
            {battery2.modelName}
          </div>
        </div>
      </div>

      {/* Written verdict */}
      <div className="prose prose-sm max-w-none">
        <h3 className="text-lg font-bold text-text-primary mb-3">
          Our Verdict for Nigerian Buyers
        </h3>
        
        <p className="text-text-muted">
          {generateBatteryVerdict(battery1, brand1, battery2, brand2, score1, score2)}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-6 bg-primary/5 rounded-2xl p-4 text-center">
        <p className="text-sm font-semibold text-text-primary mb-3">
          Want to buy {winnerBattery.modelName} in Nigeria?
        </p>
        <Link href="/get-quotes" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold transition-all inline-block shadow-lg shadow-primary/30">
          Get Quotes From Verified Installers →
        </Link>
      </div>
    </div>
  )
}
