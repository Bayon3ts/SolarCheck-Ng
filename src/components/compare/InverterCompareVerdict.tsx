import { InverterModel, InverterBrand } from '@/data/compare-inverters'

interface InverterCompareVerdictProps {
  inv1: InverterModel
  brand1: InverterBrand
  inv2: InverterModel
  brand2: InverterBrand
}

const inverterScore = (inv: InverterModel): number => {
  let s = 0

  // Efficiency — up to 3 points
  s += ((inv.efficiency - 85) / 15) * 3.0

  // Switchover time — up to 2 pts 
  // (critical for Nigerian grid reality)
  const switchScore = inv.switchoverTimeMs <= 10 
    ? 2.0 
    : inv.switchoverTimeMs <= 20 
      ? 1.5 
      : inv.switchoverTimeMs <= 30 
        ? 1.0 
        : 0.5
  s += switchScore

  // Solar harvest capability
  const harvestScore = inv.mpptControllers === 0 
    ? 0 
    : Math.min(
        (inv.maxPvInputW / (inv.ratedPowerKw * 1000)) * 1.5, 
        1.5
      )
  s += harvestScore

  // Warranty — up to 1pt
  s += Math.min(inv.warranty / 10, 1) * 1.0

  // Features bonuses
  if (inv.hasWifi) s += 0.3
  if (inv.parallelCapable) s += 0.3
  if (inv.gridFeedIn) s += 0.2
  if (inv.generatorCompatible) s += 0.2
  if (inv.ipRating === 'IP65') s += 0.2
  if (inv.operatingTempMax >= 55) s += 0.3

  return Math.min(Math.round(s * 10) / 10, 10)
}

function generateInverterVerdict(
  i1: InverterModel, b1: InverterBrand,
  i2: InverterModel, b2: InverterBrand,
  s1: number, s2: number
): string {
  const winner = s1 >= s2 ? { inv: i1, brand: b1, s: s1 } : { inv: i2, brand: b2, s: s2 }

  let verdict = `For Nigerian homes comparing ${b1.brandName} and ${b2.brandName}, our Nigerian-conditions scoring gives the ${winner.brand.brandName} ${winner.inv.modelName} a ${winner.s}/10 overall rating. `

  // Efficiency difference
  const effDiff = Math.abs(i1.efficiency - i2.efficiency)
  if (effDiff > 2) {
    const effWinner = i1.efficiency > i2.efficiency ? b1.brandName : b2.brandName
    verdict += `The efficiency gap is significant: ${Math.max(i1.efficiency, i2.efficiency)}% vs ${Math.min(i1.efficiency, i2.efficiency)}%. ${effWinner}'s higher efficiency means less energy wasted as heat — important in Nigeria's climate where thermal losses compound fast. `
  }

  // Switchover time
  if (i1.switchoverTimeMs !== i2.switchoverTimeMs) {
    const fasterBrand = i1.switchoverTimeMs < i2.switchoverTimeMs ? b1.brandName : b2.brandName
    const fasterMs = Math.min(i1.switchoverTimeMs, i2.switchoverTimeMs)
    verdict += `On Nigeria's unstable grid, switchover speed is critical. ${fasterBrand} switches to battery in just ${fasterMs}ms — fast enough that your laptop won't even notice when NEPA goes. `
  }

  // MPPT / solar harvest
  if (i1.mpptControllers !== i2.mpptControllers) {
    const moreMppt = i1.mpptControllers > i2.mpptControllers ? b1.brandName : b2.brandName
    verdict += `${moreMppt} has more MPPT inputs — meaning you can connect panels on different roof orientations for more total solar harvest, especially useful in Lagos where some roof faces get blocked. `
  }

  // Type difference note
  if (i1.type !== i2.type) {
    verdict += `The type difference matters: the ${winner.inv.type === 'hybrid' ? winner.brand.brandName + "'s hybrid" : 'hybrid'} design gives you more flexibility — it can use NEPA, solar, and battery interchangeably. `
  }

  // Warranty
  if (i1.warranty !== i2.warranty) {
    const betterWarranty = i1.warranty > i2.warranty ? b1.brandName : b2.brandName
    verdict += `${betterWarranty}'s longer warranty gives you more manufacturer-backed protection against defects. `
  }

  // Price context
  const cheaper = i1.priceMin < i2.priceMin ? b1.brandName : b2.brandName
  const moreExpensive = i1.priceMin < i2.priceMin ? b2.brandName : b1.brandName
  verdict += `Price-wise, ${cheaper} is more affordable upfront, while ${moreExpensive} justifies its premium through ${winner.inv.efficiency}% efficiency and ${winner.inv.warranty}-year warranty. `

  // Nigeria-specific strength
  verdict += `Bottom line: ${winner.inv.nigeriaStrength}.`

  return verdict
}

export default function InverterCompareVerdict({
  inv1,
  brand1,
  inv2,
  brand2,
}: InverterCompareVerdictProps) {
  const score1 = inverterScore(inv1)
  const score2 = inverterScore(inv2)

  const verdictText = generateInverterVerdict(inv1, brand1, inv2, brand2, score1, score2)

  return (
    <div className="mt-12 bg-white rounded-3xl shadow-xl border border-border p-8 md:p-12 text-center max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-text-primary mb-6">
        The SolarCheck Verdict
      </h2>
      
      <div className="flex justify-center items-center gap-8 mb-8">
        <div className="text-center">
          <div className="text-4xl font-black text-primary mb-2">{score1}<span className="text-xl text-text-muted">/10</span></div>
          <div className="text-sm font-semibold text-text-primary">{brand1.brandName}</div>
        </div>
        <div className="text-text-muted font-bold text-xl">VS</div>
        <div className="text-center">
          <div className="text-4xl font-black text-primary mb-2">{score2}<span className="text-xl text-text-muted">/10</span></div>
          <div className="text-sm font-semibold text-text-primary">{brand2.brandName}</div>
        </div>
      </div>

      <div className="bg-primary/5 rounded-2xl p-6 md:p-8 text-left border border-primary/10">
        <p className="text-lg text-text-primary leading-relaxed">
          {verdictText}
        </p>
      </div>
    </div>
  )
}
