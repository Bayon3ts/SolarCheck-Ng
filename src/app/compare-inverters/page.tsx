'use client'

import { useState } from 'react'
import Link from 'next/link'
import { InverterModel, InverterBrand } from '@/data/compare-inverters'
import InverterCompareSelector from '@/components/compare/InverterCompareSelector'
import InverterCompareTable from '@/components/compare/InverterCompareTable'
import InverterCompareVerdict from '@/components/compare/InverterCompareVerdict'

const POPULAR_INVERTER_COMPARISONS = [
  {
    label: 'Growatt SPF 5000ES vs Deye SUN-5K',
    brand1: 'growatt',
    model1: 'growatt-spf-5000es',
    brand2: 'deye',
    model2: 'deye-sun-5k-sg04lp3',
  },
  {
    label: 'Victron MultiPlus-II vs Growatt SPH',
    brand1: 'victron-energy',
    model1: 'victron-multiplus-ii-5kva',
    brand2: 'growatt',
    model2: 'growatt-sph5000tl3-bh',
  },
  {
    label: 'Growatt SPF vs Luminous PCU',
    brand1: 'growatt',
    model1: 'growatt-spf-5000es',
    brand2: 'luminous',
    model2: 'luminous-solar-pcu-5kva',
  },
  {
    label: 'Deye 5kW vs GoodWe 5kW',
    brand1: 'deye',
    model1: 'deye-sun-5k-sg04lp3',
    brand2: 'goodwe',
    model2: 'goodwe-gw5048d-es',
  },
  {
    label: 'Huawei SUN2000 vs Victron MultiPlus',
    brand1: 'huawei',
    model1: 'huawei-sun2000-5ktl',
    brand2: 'victron-energy',
    model2: 'victron-multiplus-ii-5kva',
  },
  {
    label: 'Felicity Hybrid vs MUST Power',
    brand1: 'felicity-solar',
    model1: 'felicity-hybrid-5kva-48v',
    brand2: 'must-power',
    model2: 'must-ph18-5000u',
  },
]

export default function CompareInvertersPage() {
  const [selectedInv1, setSelectedInv1] = useState<InverterModel | null>(null)
  const [selectedBrand1, setSelectedBrand1] = useState<InverterBrand | null>(null)
  const [selectedInv2, setSelectedInv2] = useState<InverterModel | null>(null)
  const [selectedBrand2, setSelectedBrand2] = useState<InverterBrand | null>(null)

  const [initialB1, setInitialB1] = useState<string>('')
  const [initialM1, setInitialM1] = useState<string>('')
  const [initialB2, setInitialB2] = useState<string>('')
  const [initialM2, setInitialM2] = useState<string>('')

  const handleCompare = (inv1: InverterModel, b1: InverterBrand, inv2: InverterModel, b2: InverterBrand) => {
    setSelectedInv1(inv1)
    setSelectedBrand1(b1)
    setSelectedInv2(inv2)
    setSelectedBrand2(b2)
  }

  const runPopular = (comp: typeof POPULAR_INVERTER_COMPARISONS[0]) => {
    setInitialB1(comp.brand1)
    setInitialM1(comp.model1)
    setInitialB2(comp.brand2)
    setInitialM2(comp.model2)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-primary py-12 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-semibold text-white mb-4">
          🔋 All inverter brands sold in Nigeria
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Compare Solar Inverters in Nigeria
        </h1>
        <p className="text-white/70 max-w-xl mx-auto px-4">
          Growatt vs Deye? Hybrid vs Off-Grid? Victron vs everything else? 
          Compare any two inverters side by side with Nigerian market pricing.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-bold text-sm text-text-primary mb-1">
              Hybrid Inverter
            </h4>
            <p className="text-xs text-text-muted">
              Manages solar panels, grid, AND battery all in one unit. Best for Nigerian homes 
              — switches between all sources automatically.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <div className="text-2xl mb-2">🏠</div>
            <h4 className="font-bold text-sm text-text-primary mb-1">
              Off-Grid Inverter
            </h4>
            <p className="text-xs text-text-muted">
              Runs from solar + battery only. Good if you want independence from NEPA entirely. 
              Cannot export power back to grid.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="text-2xl mb-2">🏭</div>
            <h4 className="font-bold text-sm text-text-primary mb-1">
              PCU (Power Conditioning Unit)
            </h4>
            <p className="text-xs text-text-muted">
              Indian-style all-in-one. Works with existing lead-acid battery setups. 
              Good for upgrading old Luminous systems to solar.
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex gap-3">
          <span className="text-2xl">🇳🇬</span>
          <div>
            <p className="font-semibold text-red-900 mb-1">
              Critical Nigerian buyer tip: switchover time matters
            </p>
            <p className="text-red-800 text-sm">
              When NEPA cuts, your inverter must switch to battery power fast. 
              A slow switchover (40ms+) causes computers to restart, routers to reset, 
              and LED drivers to flicker. Deye&apos;s 10ms is the fastest available in Nigeria. 
              Growatt&apos;s 20ms is acceptable. Budget brands at 40ms will frustrate you.
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">
            Popular Comparisons
          </h2>
          <div className="flex flex-wrap gap-2">
            {POPULAR_INVERTER_COMPARISONS.map((comp, idx) => (
              <button
                key={idx}
                onClick={() => runPopular(comp)}
                className="bg-gray-50 border border-border rounded-full px-4 py-2 text-sm font-medium text-text-primary hover:bg-primary/5 hover:border-primary/30 transition-colors"
              >
                {comp.label}
              </button>
            ))}
          </div>
        </div>

        <InverterCompareSelector 
          onCompare={handleCompare}
          initialBrand1={initialB1}
          initialModel1={initialM1}
          initialBrand2={initialB2}
          initialModel2={initialM2}
        />

        {selectedInv1 && selectedBrand1 && selectedInv2 && selectedBrand2 && (
          <>
            <InverterCompareTable 
              inv1={selectedInv1} brand1={selectedBrand1}
              inv2={selectedInv2} brand2={selectedBrand2}
            />
            <InverterCompareVerdict
              inv1={selectedInv1} brand1={selectedBrand1}
              inv2={selectedInv2} brand2={selectedBrand2}
            />
          </>
        )}

        <div className="flex flex-wrap gap-4 mt-16 pt-8 border-t border-border">
          <Link href="/compare-panels" className="text-primary font-semibold hover:underline">
            Compare Solar Panels →
          </Link>
          <Link href="/compare-batteries" className="text-primary font-semibold hover:underline">
            Compare Batteries →
          </Link>
        </div>
      </div>
    </div>
  )
}
