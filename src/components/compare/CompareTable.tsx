import { PanelModel, PanelBrand } from '@/data/compare-panels'
import { Check } from 'lucide-react'

interface CompareTableProps {
  panel1: PanelModel
  brand1: PanelBrand
  panel2: PanelModel
  brand2: PanelBrand
}

export default function CompareTable({
  panel1,
  brand1,
  panel2,
  brand2,
}: CompareTableProps) {
  // Helpers to determine "winner"
  const isBetter = (v1: number, v2: number, lowerIsBetter: boolean) => {
    if (v1 === v2) return null
    return lowerIsBetter ? v1 < v2 : v1 > v2
  }

  const renderCell = (
    value: string | number | boolean,
    isWinner: boolean | null,
    format?: 'currency' | 'percent' | 'temp' | 'years' | 'power'
  ) => {
    let displayValue = value.toString()
    if (format === 'percent') displayValue = `${value}%`
    if (format === 'temp') displayValue = `${value}%/°C`
    if (format === 'years') displayValue = `${value} years`
    if (format === 'power') displayValue = `${value}W`
    if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No'
    
    return (
      <td
        className={`px-4 py-3 border-b border-border text-sm md:text-base ${
          isWinner ? 'bg-primary/5 font-semibold text-text-primary' : 'text-text-muted'
        }`}
      >
        <div className="flex items-center gap-2">
          {displayValue}
          {isWinner && <Check className="w-4 h-4 text-primary shrink-0" />}
        </div>
      </td>
    )
  }

  const renderBooleanCell = (v1: boolean, v2: boolean, side: 1 | 2) => {
    const isWinner = v1 !== v2 ? (side === 1 ? v1 : v2) : null;
    return renderCell(side === 1 ? v1 : v2, isWinner);
  }

  const renderAvailCell = (val: string) => {
    const display = val === 'widely-available' ? '✅ Widely' : val === 'available' ? '☑️ Available' : '⚠️ Limited'
    return <td className="px-4 py-3 border-b border-border text-sm md:text-base text-text-muted">{display}</td>
  }

  return (
    <div className="overflow-x-auto w-full mt-10 rounded-2xl border border-border bg-white shadow-sm">
      <table className="w-full text-left min-w-[600px]">
        <thead>
          <tr className="bg-gray-50 border-b border-border">
            <th className="w-1/3 px-4 py-4 font-bold text-text-primary">
              Specification
            </th>
            <th className="w-1/3 px-4 py-4">
              <div className="font-bold text-lg text-text-primary mb-1">{brand1.brandName}</div>
              <div className="text-sm font-normal text-text-muted mb-2">{panel1.modelName}</div>
              <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-800">
                {brand1.tier.replace('tier', 'Tier ').toUpperCase()}
              </span>
            </th>
            <th className="w-1/3 px-4 py-4">
              <div className="font-bold text-lg text-text-primary mb-1">{brand2.brandName}</div>
              <div className="text-sm font-normal text-text-muted mb-2">{panel2.modelName}</div>
              <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-800">
                {brand2.tier.replace('tier', 'Tier ').toUpperCase()}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Cell Technology</td>
            <td className="px-4 py-3 border-b border-border text-text-muted">{panel1.cellType}</td>
            <td className="px-4 py-3 border-b border-border text-text-muted">{panel2.cellType}</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Panel Type</td>
            <td className="px-4 py-3 border-b border-border text-text-muted">{panel1.type}</td>
            <td className="px-4 py-3 border-b border-border text-text-muted">{panel2.type}</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Power Output</td>
            {renderCell(panel1.watts, isBetter(panel1.watts, panel2.watts, false), 'power')}
            {renderCell(panel2.watts, isBetter(panel2.watts, panel1.watts, false), 'power')}
          </tr>
          <tr>
            <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Efficiency</td>
            {renderCell(panel1.efficiency, isBetter(panel1.efficiency, panel2.efficiency, false), 'percent')}
            {renderCell(panel2.efficiency, isBetter(panel2.efficiency, panel1.efficiency, false), 'percent')}
          </tr>
          <tr>
            <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Bifacial?</td>
            {renderBooleanCell(panel1.bifacial, panel2.bifacial, 1)}
            {renderBooleanCell(panel1.bifacial, panel2.bifacial, 2)}
          </tr>
          <tr>
            <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Half-Cut Cells?</td>
            {renderBooleanCell(panel1.halfCut, panel2.halfCut, 1)}
            {renderBooleanCell(panel1.halfCut, panel2.halfCut, 2)}
          </tr>
          <tr>
            <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Product Warranty</td>
            {renderCell(panel1.warranty, isBetter(panel1.warranty, panel2.warranty, false), 'years')}
            {renderCell(panel2.warranty, isBetter(panel2.warranty, panel1.warranty, false), 'years')}
          </tr>
          <tr>
            <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Performance Warranty</td>
            {renderCell(panel1.performanceWarranty, isBetter(panel1.performanceWarranty, panel2.performanceWarranty, false), 'years')}
            {renderCell(panel2.performanceWarranty, isBetter(panel2.performanceWarranty, panel1.performanceWarranty, false), 'years')}
          </tr>
          <tr>
            <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Degradation/Year</td>
            {renderCell(panel1.degradationPerYear, isBetter(panel1.degradationPerYear, panel2.degradationPerYear, true), 'percent')}
            {renderCell(panel2.degradationPerYear, isBetter(panel2.degradationPerYear, panel1.degradationPerYear, true), 'percent')}
          </tr>
          <tr>
            <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Output After 25 Years</td>
            {renderCell(panel1.outputAfter25Years, isBetter(panel1.outputAfter25Years, panel2.outputAfter25Years, false), 'percent')}
            {renderCell(panel2.outputAfter25Years, isBetter(panel2.outputAfter25Years, panel1.outputAfter25Years, false), 'percent')}
          </tr>
          <tr>
            <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Temp. Coefficient</td>
            {renderCell(panel1.tempCoefficient, isBetter(panel1.tempCoefficient, panel2.tempCoefficient, false), 'temp')}
            {renderCell(panel2.tempCoefficient, isBetter(panel2.tempCoefficient, panel1.tempCoefficient, false), 'temp')}
          </tr>
          <tr>
            <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Origin</td>
            <td className="px-4 py-3 border-b border-border text-text-muted">{panel1.origin}</td>
            <td className="px-4 py-3 border-b border-border text-text-muted">{panel2.origin}</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Price Range (Nigeria)</td>
            {renderCell(`₦${panel1.priceMin.toLocaleString()}–₦${panel1.priceMax.toLocaleString()}`, isBetter(panel1.priceMin, panel2.priceMin, true))}
            {renderCell(`₦${panel2.priceMin.toLocaleString()}–₦${panel2.priceMax.toLocaleString()}`, isBetter(panel2.priceMin, panel1.priceMin, true))}
          </tr>
          <tr>
            <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Nigeria Availability</td>
            {renderAvailCell(panel1.nigeriaAvailability)}
            {renderAvailCell(panel2.nigeriaAvailability)}
          </tr>
          <tr>
            <td className="px-4 py-3 border-none font-medium text-text-primary">Best For</td>
            <td className="px-4 py-3 border-none text-sm text-text-muted italic">{panel1.bestFor}</td>
            <td className="px-4 py-3 border-none text-sm text-text-muted italic">{panel2.bestFor}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
