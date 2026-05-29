'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import CompareSelector from '@/components/compare/CompareSelector'
import CompareTable from '@/components/compare/CompareTable'
import CompareVerdict from '@/components/compare/CompareVerdict'
import { PanelModel, PanelBrand } from '@/data/compare-panels'

const POPULAR_COMPARISONS = [
  {
    label: 'Jinko Tiger Neo vs LONGi Hi-MO 6',
    brand1: 'jinko-solar',
    model1: 'jinko-tiger-neo-550w',
    brand2: 'longi-solar',
    model2: 'longi-hi-mo6-550w',
  },
  {
    label: 'Canadian Solar vs Trina Solar',
    brand1: 'canadian-solar',
    model1: 'canadian-hiku6-550w',
    brand2: 'trina-solar',
    model2: 'trina-vertex-s-420w',
  },
  {
    label: 'JA Solar vs Risen Energy',
    brand1: 'ja-solar',
    model1: 'ja-solar-jam72-450w',
    brand2: 'risen-energy',
    model2: 'risen-titan-s-550w',
  },
  {
    label: 'Felicity vs Canadian Solar',
    brand1: 'felicity-solar',
    model1: 'felicity-mono-400w',
    brand2: 'canadian-solar',
    model2: 'canadian-hiku6-400w',
  },
  {
    label: 'Jinko PERC vs TOPCon',
    brand1: 'jinko-solar',
    model1: 'jinko-tiger-pro-perc-530w',
    brand2: 'jinko-solar',
    model2: 'jinko-tiger-neo-550w',
  },
  {
    label: 'Auxano (Nigerian) vs Jinko',
    brand1: 'auxano-solar',
    model1: 'auxano-mono-400w',
    brand2: 'jinko-solar',
    model2: 'jinko-tiger-pro-perc-530w',
  },
]

export default function ComparePanelsPage() {
  const [comparison, setComparison] = useState<{
    panel1: PanelModel
    brand1: PanelBrand
    panel2: PanelModel
    brand2: PanelBrand
  } | null>(null)

  const [initialKeys, setInitialKeys] = useState<{
    brand1: string
    model1: string
    brand2: string
    model2: string
  }>({
    brand1: '',
    model1: '',
    brand2: '',
    model2: '',
  })

  const handleCompare = (p1: PanelModel, b1: PanelBrand, p2: PanelModel, b2: PanelBrand) => {
    setComparison({ panel1: p1, brand1: b1, panel2: p2, brand2: b2 })
  }

  const loadPopular = (comp: typeof POPULAR_COMPARISONS[0]) => {
    setInitialKeys({
      brand1: comp.brand1,
      model1: comp.model1,
      brand2: comp.brand2,
      model2: comp.model2
    })
    setComparison(null) // clear old while loading new
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="bg-primary pt-32 pb-16 text-center">
          <div className="container-custom">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Compare Solar Panels in Nigeria
            </h1>
            <p className="text-white/70 max-w-xl mx-auto">
              Pick any two panels and see how they stack up — efficiency, price in Naira, warranty, and which is better for Nigerian conditions.
            </p>
          </div>
        </div>

        <section className="section-padding -mt-8 relative z-10">
          <div className="container-custom max-w-5xl">
            <CompareSelector 
              onCompare={handleCompare}
              initialBrand1={initialKeys.brand1}
              initialModel1={initialKeys.model1}
              initialBrand2={initialKeys.brand2}
              initialModel2={initialKeys.model2}
            />

            {!comparison && (
               <div className="mt-12">
                 <h3 className="text-xl font-bold text-text-primary text-center mb-6">Popular Comparisons</h3>
                 <div className="flex flex-wrap justify-center gap-3">
                   {POPULAR_COMPARISONS.map((comp) => (
                     <button
                        key={comp.label}
                        onClick={() => loadPopular(comp)}
                        className="bg-white border border-border px-4 py-2 rounded-xl text-sm font-medium text-text-primary hover:border-primary hover:text-primary transition-colors shadow-sm"
                     >
                       {comp.label}
                     </button>
                   ))}
                 </div>
               </div>
            )}

            {comparison && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CompareTable 
                  panel1={comparison.panel1} brand1={comparison.brand1} 
                  panel2={comparison.panel2} brand2={comparison.brand2} 
                />
                <CompareVerdict
                  panel1={comparison.panel1} brand1={comparison.brand1} 
                  panel2={comparison.panel2} brand2={comparison.brand2} 
                />
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-16 pt-8 border-t border-border">
              <Link href="/compare-batteries" className="text-primary font-semibold hover:underline">
                Compare Batteries →
              </Link>
              <Link href="/compare-inverters" className="text-primary font-semibold hover:underline">
                Compare Inverters →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
