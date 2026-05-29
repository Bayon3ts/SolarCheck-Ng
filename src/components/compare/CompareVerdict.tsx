import { PanelModel, PanelBrand } from '@/data/compare-panels'
import Link from 'next/link'

interface CompareVerdictProps {
  panel1: PanelModel
  brand1: PanelBrand
  panel2: PanelModel
  brand2: PanelBrand
}

const getScore = (p: PanelModel) => {
  let s = 0
  s += (p.efficiency / 23) * 3      // efficiency (3pts)
  s += (1 - p.degradationPerYear / 0.8) * 2 // longevity (2pts)
  s += (p.outputAfter25Years / 95) * 2 // 25yr output (2pts)
  s += (p.performanceWarranty / 40) * 2 // warranty (2pts)
  s += (1 + p.tempCoefficient / 0.4) * 1  // heat perf (1pt)
  return Math.round(s * 10) / 10
}

function generateVerdict(
  p1: PanelModel, b1: PanelBrand,
  p2: PanelModel, b2: PanelBrand,
  s1: number, s2: number
): string {
  
  const winner = s1 >= s2 ? 
    { panel: p1, brand: b1 } : 
    { panel: p2, brand: b2 }
  const loser = s1 >= s2 ? 
    { panel: p2, brand: b2 } : 
    { panel: p1, brand: b1 }
  
  const effWinner = p1.efficiency > p2.efficiency 
    ? b1.brandName : b2.brandName
  
  const cheaperBrand = p1.priceMin < p2.priceMin
    ? b1.brandName : b2.brandName

  let verdict = `For Nigerian homes comparing ${b1.brandName} and ${b2.brandName}, our data points to the ${winner.brand.brandName} ${winner.panel.modelName} (${s1 >= s2 ? s1.toFixed(1) : s2.toFixed(1)}/10) as the overall stronger choice. `

  if (Math.abs(p1.efficiency - p2.efficiency) > 0.3) {
    verdict += `The ${effWinner} panel has noticeably higher efficiency (${Math.max(p1.efficiency, p2.efficiency)}%), meaning you get more electricity from the same roof space — important in Nigerian homes with limited rooftops. `
  }

  if (Math.abs(p1.tempCoefficient - p2.tempCoefficient) > 0.03) {
    verdict += `In Nigeria's hot climate, temperature coefficient matters. The ${winner.brand.brandName} loses less output on hot afternoons (${winner.panel.tempCoefficient}%/°C), keeping your system producing well during peak heat. `
  }

  if (Math.abs(p1.outputAfter25Years - p2.outputAfter25Years) > 1) {
    verdict += `Over 25 years, the ${winner.brand.brandName} retains ${winner.panel.outputAfter25Years}% output vs ${loser.panel.outputAfter25Years}% — that difference adds up to real money saved on your electricity bills long-term. `
  }

  verdict += `Price-wise, the ${cheaperBrand} is more affordable. `

  if (p1.cellType !== p2.cellType) {
    verdict += `The technology gap is also worth noting: ${p1.cellType} vs ${p2.cellType} — generally, TOPCon N-type panels outperform PERC in Nigerian heat conditions. `
  }

  return verdict
}

export default function CompareVerdict({
  panel1,
  brand1,
  panel2,
  brand2,
}: CompareVerdictProps) {
  const score1 = getScore(panel1)
  const score2 = getScore(panel2)
  const winnerPanel = score1 >= score2 ? panel1 : panel2

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
            {panel1.modelName}
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
            {panel2.modelName}
          </div>
        </div>
      </div>

      {/* Written verdict */}
      <div className="prose prose-sm max-w-none">
        <h3 className="text-lg font-bold text-text-primary mb-3">
          Our Verdict for Nigerian Buyers
        </h3>
        
        <p className="text-text-muted">
          {generateVerdict(panel1, brand1, panel2, brand2, score1, score2)}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-6 bg-primary/5 rounded-2xl p-4 text-center">
        <p className="text-sm font-semibold text-text-primary mb-3">
          Want to buy {winnerPanel.modelName} in Nigeria?
        </p>
        <Link href="/get-quotes" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold transition-all inline-block shadow-lg shadow-primary/30">
          Get Quotes From Verified Installers →
        </Link>
      </div>
    </div>
  )
}
