import { BatteryModel, BatteryBrand, nigeriaLifespanYears, costPerCycle } from '@/data/compare-batteries'
import { Check } from 'lucide-react'

interface BatteryCompareTableProps {
  battery1: BatteryModel
  brand1: BatteryBrand
  battery2: BatteryModel
  brand2: BatteryBrand
}

export default function BatteryCompareTable({
  battery1,
  brand1,
  battery2,
  brand2,
}: BatteryCompareTableProps) {
  const isBetter = (v1: number, v2: number, lowerIsBetter: boolean) => {
    if (v1 === v2) return null
    return lowerIsBetter ? v1 < v2 : v1 > v2
  }

  const renderCell = (
    value: string | number | boolean,
    isWinner: boolean | null,
    format?: 'currency' | 'percent' | 'temp' | 'years' | 'power' | 'kwh' | 'cycles' | 'currencyPerCycle'
  ) => {
    let displayValue = value.toString()
    if (format === 'percent') displayValue = `${value}%`
    if (format === 'temp') displayValue = `${value}°C`
    if (format === 'years') displayValue = `${value} years`
    if (format === 'years' && typeof value === 'number') displayValue = `${value.toFixed(1)} yrs`
    if (format === 'power') displayValue = `${value}kW`
    if (format === 'kwh') displayValue = `${value}kWh`
    if (format === 'cycles') displayValue = typeof value === 'number' ? value.toLocaleString() : value.toString()
    if (format === 'currencyPerCycle') displayValue = `₦${value}/cyc`
    
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

  const renderBooleanCell = (v1: boolean, v2: boolean, side: 1 | 2, wantTrue: boolean = true) => {
    const isWinner = v1 !== v2 ? (side === 1 ? v1 === wantTrue : v2 === wantTrue) : null;
    return renderCell(side === 1 ? v1 : v2, isWinner);
  }

  const renderAvailCell = (val: string) => {
    const display = val === 'widely-available' ? '✅ Wide' : val === 'available' ? '✅ Avail' : '⚠️ Limited'
    return <td className="px-4 py-3 border-b border-border text-sm md:text-base text-text-muted">{display}</td>
  }

  const cpc1 = costPerCycle(battery1)
  const cpc2 = costPerCycle(battery2)
  const life1 = nigeriaLifespanYears(battery1)
  const life2 = nigeriaLifespanYears(battery2)

  return (
    <div className="mt-10">
      {battery1.chemistry !== battery2.chemistry && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <strong>⚠️ Chemistry mismatch:</strong> You&apos;re comparing {battery1.chemistry} vs {battery2.chemistry}. These have very different performance profiles. The table highlights key differences in cycle life and usable capacity.
        </div>
      )}

      <div className="overflow-x-auto w-full rounded-2xl border border-border bg-white shadow-sm">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="w-1/3 px-4 py-4 font-bold text-text-primary">
                Specification
              </th>
              <th className="w-1/3 px-4 py-4">
                <div className="font-bold text-lg text-text-primary mb-1">{brand1.brandName}</div>
                <div className="text-sm font-normal text-text-muted mb-2">{battery1.modelName}</div>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-800">
                  {brand1.tier.replace('tier', 'Tier ').toUpperCase()}
                </span>
              </th>
              <th className="w-1/3 px-4 py-4">
                <div className="font-bold text-lg text-text-primary mb-1">{brand2.brandName}</div>
                <div className="text-sm font-normal text-text-muted mb-2">{battery2.modelName}</div>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-800">
                  {brand2.tier.replace('tier', 'Tier ').toUpperCase()}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Brand</td>
              <td className="px-4 py-3 border-b border-border text-text-muted">{brand1.brandName}</td>
              <td className="px-4 py-3 border-b border-border text-text-muted">{brand2.brandName}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Model</td>
              <td className="px-4 py-3 border-b border-border text-text-muted">{battery1.modelName}</td>
              <td className="px-4 py-3 border-b border-border text-text-muted">{battery2.modelName}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Chemistry</td>
              {renderCell(battery1.chemistry, battery1.chemistry === 'LFP' && battery2.chemistry !== 'LFP')}
              {renderCell(battery2.chemistry, battery2.chemistry === 'LFP' && battery1.chemistry !== 'LFP')}
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Voltage</td>
              <td className="px-4 py-3 border-b border-border text-text-muted">{battery1.voltage}V</td>
              <td className="px-4 py-3 border-b border-border text-text-muted">{battery2.voltage}V</td>
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Total Capacity</td>
              <td className="px-4 py-3 border-b border-border text-text-muted">{battery1.capacityKwh}kWh</td>
              <td className="px-4 py-3 border-b border-border text-text-muted">{battery2.capacityKwh}kWh</td>
            </tr>
            <tr className="bg-primary/5">
              <td className="px-4 py-3 border-b border-border font-bold text-primary">⚡ USABLE Capacity</td>
              {renderCell(battery1.usableKwh, isBetter(battery1.usableKwh, battery2.usableKwh, false), 'kwh')}
              {renderCell(battery2.usableKwh, isBetter(battery2.usableKwh, battery1.usableKwh, false), 'kwh')}
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Depth of Discharge</td>
              {renderCell(battery1.dod, isBetter(battery1.dod, battery2.dod, false), 'percent')}
              {renderCell(battery2.dod, isBetter(battery2.dod, battery1.dod, false), 'percent')}
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Cycle Life</td>
              {renderCell(battery1.cycleLife, isBetter(battery1.cycleLife, battery2.cycleLife, false), 'cycles')}
              {renderCell(battery2.cycleLife, isBetter(battery2.cycleLife, battery1.cycleLife, false), 'cycles')}
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Est. Nigeria Lifespan</td>
              {renderCell(life1, isBetter(life1, life2, false), 'years')}
              {renderCell(life2, isBetter(life2, life1, false), 'years')}
            </tr>
            <tr className="bg-amber-50">
              <td className="px-4 py-3 border-b border-border font-bold text-amber-900 group relative">
                <span className="border-b border-dashed border-amber-900/50 pb-0.5 cursor-help">
                  ₦ Cost Per Cycle
                </span>
                <div className="absolute left-0 bottom-full mb-2 hidden w-64 p-3 bg-gray-900 text-white text-xs rounded shadow-lg group-hover:block z-10">
                  How much each charge/discharge cycle costs based on battery price ÷ cycle life
                </div>
              </td>
              {renderCell(cpc1.toLocaleString(), isBetter(cpc1, cpc2, true), 'currencyPerCycle')}
              {renderCell(cpc2.toLocaleString(), isBetter(cpc2, cpc1, true), 'currencyPerCycle')}
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Continuous Power</td>
              {renderCell(battery1.continuousPowerKw, isBetter(battery1.continuousPowerKw, battery2.continuousPowerKw, false), 'power')}
              {renderCell(battery2.continuousPowerKw, isBetter(battery2.continuousPowerKw, battery1.continuousPowerKw, false), 'power')}
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Warranty</td>
              {renderCell(battery1.warranty, isBetter(battery1.warranty, battery2.warranty, false), 'years')}
              {renderCell(battery2.warranty, isBetter(battery2.warranty, battery1.warranty, false), 'years')}
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Max Operating Temp</td>
              {renderCell(battery1.operatingTempMax, isBetter(battery1.operatingTempMax, battery2.operatingTempMax, false), 'temp')}
              {renderCell(battery2.operatingTempMax, isBetter(battery2.operatingTempMax, battery1.operatingTempMax, false), 'temp')}
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Self-Discharge/Month</td>
              {renderCell(battery1.selfDischargePerMonth, isBetter(battery1.selfDischargePerMonth, battery2.selfDischargePerMonth, true), 'percent')}
              {renderCell(battery2.selfDischargePerMonth, isBetter(battery2.selfDischargePerMonth, battery1.selfDischargePerMonth, true), 'percent')}
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Maintenance Required?</td>
              {renderBooleanCell(battery1.maintenanceRequired, battery2.maintenanceRequired, 1, false)}
              {renderBooleanCell(battery1.maintenanceRequired, battery2.maintenanceRequired, 2, false)}
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Built-in BMS?</td>
              {renderBooleanCell(battery1.builtInBms, battery2.builtInBms, 1)}
              {renderBooleanCell(battery1.builtInBms, battery2.builtInBms, 2)}
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Stackable?</td>
              {renderBooleanCell(battery1.stackable, battery2.stackable, 1)}
              {renderBooleanCell(battery1.stackable, battery2.stackable, 2)}
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Inverter Compatibility</td>
              <td className="px-4 py-3 border-b border-border text-text-muted">{battery1.inverterCompatibility.join(', ')}</td>
              <td className="px-4 py-3 border-b border-border text-text-muted">{battery2.inverterCompatibility.join(', ')}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Price Range (Nigeria)</td>
              {renderCell(`₦${(battery1.priceMin/1000).toLocaleString()}k–₦${battery1.priceMax >= 1000000 ? (battery1.priceMax/1000000).toFixed(1) + 'M' : (battery1.priceMax/1000).toLocaleString()+'k'}`, isBetter(battery1.priceMin, battery2.priceMin, true))}
              {renderCell(`₦${(battery2.priceMin/1000).toLocaleString()}k–₦${battery2.priceMax >= 1000000 ? (battery2.priceMax/1000000).toFixed(1) + 'M' : (battery2.priceMax/1000).toLocaleString()+'k'}`, isBetter(battery2.priceMin, battery1.priceMin, true))}
            </tr>
            <tr>
              <td className="px-4 py-3 border-b border-border font-medium text-text-primary">Nigeria Availability</td>
              {renderAvailCell(battery1.nigeriaAvailability)}
              {renderAvailCell(battery2.nigeriaAvailability)}
            </tr>
            <tr>
              <td className="px-4 py-3 border-none font-medium text-text-primary">Best For</td>
              <td className="px-4 py-3 border-none text-sm text-text-muted italic">{battery1.bestFor}</td>
              <td className="px-4 py-3 border-none text-sm text-text-muted italic">{battery2.bestFor}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
