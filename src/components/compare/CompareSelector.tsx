'use client'

import { useState, useEffect } from 'react'
import { PanelModel, PanelBrand, getModelsForBrand, findModel, findBrand, PANEL_BRANDS } from '@/data/compare-panels'

interface CompareSelectorProps {
  onCompare: (panel1: PanelModel, brand1: PanelBrand, panel2: PanelModel, brand2: PanelBrand) => void
  initialBrand1?: string
  initialModel1?: string
  initialBrand2?: string
  initialModel2?: string
}

export default function CompareSelector({
  onCompare,
  initialBrand1 = '',
  initialModel1 = '',
  initialBrand2 = '',
  initialModel2 = '',
}: CompareSelectorProps) {
  const [brand1, setBrand1] = useState(initialBrand1)
  const [model1, setModel1] = useState(initialModel1)
  const [brand2, setBrand2] = useState(initialBrand2)
  const [model2, setModel2] = useState(initialModel2)

  useEffect(() => {
    if (initialBrand1 || initialModel1 || initialBrand2 || initialModel2) {
      setBrand1(initialBrand1 || '')
      setModel1(initialModel1 || '')
      setBrand2(initialBrand2 || '')
      setModel2(initialModel2 || '')
      // Auto run if all 4 are present
      if (initialBrand1 && initialModel1 && initialBrand2 && initialModel2) {
        runComparison(initialBrand1, initialModel1, initialBrand2, initialModel2)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBrand1, initialModel1, initialBrand2, initialModel2])

  const handleCompareClick = () => {
    runComparison(brand1, model1, brand2, model2)
  }

  const runComparison = (b1: string, m1: string, b2: string, m2: string) => {
    if (!b1 || !m1 || !b2 || !m2) return
    const p1 = findModel(b1, m1)
    const brandObj1 = findBrand(b1)
    const p2 = findModel(b2, m2)
    const brandObj2 = findBrand(b2)

    if (p1 && brandObj1 && p2 && brandObj2) {
      onCompare(p1, brandObj1, p2, brandObj2)
    }
  }

  const renderBrandOptions = () => (
    <>
      <optgroup label="🥇 Tier 1 — Best Quality">
        {PANEL_BRANDS.filter(b => b.tier === 'tier1').map(b => (
          <option key={b.brandSlug} value={b.brandSlug}>{b.brandName}</option>
        ))}
      </optgroup>
      <optgroup label="🥈 Tier 2 — Good Value">
        {PANEL_BRANDS.filter(b => b.tier === 'tier2').map(b => (
          <option key={b.brandSlug} value={b.brandSlug}>{b.brandName}</option>
        ))}
      </optgroup>
      <optgroup label="👑 Premium">
        {PANEL_BRANDS.filter(b => b.tier === 'premium').map(b => (
          <option key={b.brandSlug} value={b.brandSlug}>{b.brandName}</option>
        ))}
      </optgroup>
      <optgroup label="💰 Budget">
        {PANEL_BRANDS.filter(b => b.tier === 'budget').map(b => (
          <option key={b.brandSlug} value={b.brandSlug}>{b.brandName}</option>
        ))}
      </optgroup>
    </>
  )

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-border p-8">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-end">
        {/* Panel 1 */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-text-primary">
            Select first panel
          </h3>
          <select
            value={brand1}
            onChange={(e) => {
              setBrand1(e.target.value)
              setModel1('')
            }}
            className="w-full rounded-xl border border-border px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Select brand</option>
            {renderBrandOptions()}
          </select>

          <select
            value={model1}
            onChange={(e) => setModel1(e.target.value)}
            disabled={!brand1}
            className="w-full rounded-xl border border-border px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Select model</option>
            {getModelsForBrand(brand1).map(m => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* VS divider */}
        <div className="flex items-center justify-center pb-3 md:pb-0 h-full">
          <div className="w-12 h-12 rounded-full bg-primary text-white font-black text-lg flex items-center justify-center shrink-0">
            VS
          </div>
        </div>

        {/* Panel 2 */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-text-primary">
            Select second panel
          </h3>
          <select
            value={brand2}
            onChange={(e) => {
              setBrand2(e.target.value)
              setModel2('')
            }}
            className="w-full rounded-xl border border-border px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Select brand</option>
            {renderBrandOptions()}
          </select>

          <select
            value={model2}
            onChange={(e) => setModel2(e.target.value)}
            disabled={!brand2}
            className="w-full rounded-xl border border-border px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Select model</option>
            {getModelsForBrand(brand2).map(m => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleCompareClick}
          disabled={!brand1 || !model1 || !brand2 || !model2}
          className="bg-primary text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
        >
          Compare Panels
        </button>
      </div>
    </div>
  )
}
