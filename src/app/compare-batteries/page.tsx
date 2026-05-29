'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import BatteryCompareSelector from '@/components/compare/BatteryCompareSelector'
import BatteryCompareTable from '@/components/compare/BatteryCompareTable'
import BatteryCompareVerdict from '@/components/compare/BatteryCompareVerdict'
import { BatteryModel, BatteryBrand } from '@/data/compare-batteries'

const POPULAR_BATTERY_COMPARISONS = [
  {
    label: 'Felicity LFP 48V vs Pylontech US5000',
    brand1: 'felicity-solar',
    model1: 'felicity-lfp-48v-100ah',
    brand2: 'pylontech',
    model2: 'pylontech-us5000-4-8kwh',
  },
  {
    label: 'Blue Carbon vs Felicity LFP',
    brand1: 'blue-carbon',
    model1: 'blue-carbon-lfp-51v-100ah',
    brand2: 'felicity-solar',
    model2: 'felicity-lfp-48v-100ah',
  },
  {
    label: 'LFP Lithium vs Tubular Lead-Acid',
    brand1: 'felicity-solar',
    model1: 'felicity-lfp-48v-100ah',
    brand2: 'luminous',
    model2: 'luminous-tubular-200ah-12v',
  },
  {
    label: 'Pylontech vs Huawei LUNA2000',
    brand1: 'pylontech',
    model1: 'pylontech-us5000-4-8kwh',
    brand2: 'huawei',
    model2: 'huawei-luna2000-5kwh',
  },
  {
    label: 'Dyness vs BSL Battery',
    brand1: 'dyness',
    model1: 'dyness-b4850-5-12kwh',
    brand2: 'bsl-battery',
    model2: 'bsl-lfp-48v-100ah',
  },
  {
    label: 'PowMr vs Shoto — budget LFP',
    brand1: 'powmr',
    model1: 'powmr-lfp-48v-100ah',
    brand2: 'shoto',
    model2: 'shoto-sda10-48v-100ah',
  },
]

export default function CompareBatteriesPage() {
  const [comparison, setComparison] = useState<{
    battery1: BatteryModel
    brand1: BatteryBrand
    battery2: BatteryModel
    brand2: BatteryBrand
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

  const handleCompare = (b1: BatteryModel, br1: BatteryBrand, b2: BatteryModel, br2: BatteryBrand) => {
    setComparison({ battery1: b1, brand1: br1, battery2: b2, brand2: br2 })
  }

  const loadPopular = (comp: typeof POPULAR_BATTERY_COMPARISONS[0]) => {
    setInitialKeys({
      brand1: comp.brand1,
      model1: comp.model1,
      brand2: comp.brand2,
      model2: comp.model2
    })
    setComparison(null)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="bg-primary pt-32 pb-16 text-center">
          <div className="container-custom">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-semibold text-white mb-4">
              ⚡ All batteries sold in Nigeria
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Compare Solar Batteries in Nigeria
            </h1>
            <p className="text-white/70 max-w-xl mx-auto">
              LFP lithium vs gel vs tubular — see which battery actually makes sense for your home, budget, and Nigerian conditions.
            </p>
          </div>
        </div>

        <section className="section-padding -mt-8 relative z-10">
          <div className="container-custom max-w-5xl">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 my-6 flex gap-3 shadow-sm transform -translate-y-8">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-amber-900 mb-1">
                  Nigerian buyer tip: most lead-acid batteries only deliver 50% of their listed capacity
                </p>
                <p className="text-amber-800 text-sm">
                  A 200Ah/12V lead-acid battery (2.4kWh) only gives you 1.2kWh usable. A 100Ah/48V LFP (4.8kWh) gives you 4.8kWh usable. This comparison shows <strong>usable kWh</strong>, not nameplate capacity.
                </p>
              </div>
            </div>

            <BatteryCompareSelector 
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
                   {POPULAR_BATTERY_COMPARISONS.map((comp) => (
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
                <BatteryCompareTable 
                  battery1={comparison.battery1} brand1={comparison.brand1} 
                  battery2={comparison.battery2} brand2={comparison.brand2} 
                />
                <BatteryCompareVerdict
                  battery1={comparison.battery1} brand1={comparison.brand1} 
                  battery2={comparison.battery2} brand2={comparison.brand2} 
                />
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-16 pt-8 border-t border-border">
              <Link href="/compare-panels" className="text-primary font-semibold hover:underline">
                Compare Solar Panels →
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
