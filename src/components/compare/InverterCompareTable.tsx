import { InverterModel, InverterBrand, inverterTypeLabel, switchoverRating } from '@/data/compare-inverters'

interface InverterCompareTableProps {
  inv1: InverterModel
  brand1: InverterBrand
  inv2: InverterModel
  brand2: InverterBrand
}

export default function InverterCompareTable({
  inv1,
  brand1,
  inv2,
  brand2,
}: InverterCompareTableProps) {

  const typeMismatch = inv1.type !== inv2.type
  
  const getTypeExplanation = (t1: string, t2: string) => {
    const pair = [t1, t2].sort().join(' vs ')
    if (pair === 'hybrid vs off-grid') {
      return 'Hybrid inverters can both use the grid AND export to it. Off-grid cannot export to grid but is simpler and often cheaper.'
    }
    if (pair === 'hybrid vs pcu') {
      return 'PCUs are designed for the Indian/Nigerian market with existing lead-acid battery banks. Hybrids are more capable and support modern LFP batteries.'
    }
    if (pair === 'off-grid vs pcu') {
      return 'Both avoid grid interaction. PCUs are typically simpler and cheaper.'
    }
    return ''
  }

  const renderValue = <T,>(
    val1: T, 
    val2: T, 
    formatFn: (val: T) => React.ReactNode,
    compareFn: (v1: T, v2: T) => 1 | 2 | 0 | null, // Returns 1 if val1 is better, 2 if val2 is better, 0 for tie, null for no comparison
    classNameFn?: (val: T) => string
  ) => {
    const winner = compareFn(val1, val2)
    return (
      <>
        <td className={`p-4 border-b border-border font-medium ${winner === 1 ? 'bg-green-50/50' : ''} ${classNameFn ? classNameFn(val1) : ''}`}>
          <div className="flex items-center gap-2">
            {formatFn(val1)}
            {winner === 1 && <span className="text-green-600 text-sm">✓</span>}
            {winner === 0 && <span className="text-green-600/50 text-sm">✓</span>}
          </div>
        </td>
        <td className={`p-4 border-b border-border font-medium ${winner === 2 ? 'bg-green-50/50' : ''} ${classNameFn ? classNameFn(val2) : ''}`}>
          <div className="flex items-center gap-2">
            {formatFn(val2)}
            {winner === 2 && <span className="text-green-600 text-sm">✓</span>}
            {winner === 0 && <span className="text-green-600/50 text-sm">✓</span>}
          </div>
        </td>
      </>
    )
  }

  const getSwitchoverColor = (ms: number) => {
    if (ms <= 20) return 'text-green-700 font-bold bg-green-50 rounded px-2 py-1'
    if (ms <= 30) return 'text-amber-700 font-bold bg-amber-50 rounded px-2 py-1'
    return 'text-red-700 font-bold bg-red-50 rounded px-2 py-1'
  }

  return (
    <div className="mt-12">
      {typeMismatch && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <strong>ℹ️ Type mismatch:</strong> You&apos;re comparing a {inverterTypeLabel(inv1.type)} inverter vs a {inverterTypeLabel(inv2.type)} inverter. 
          Key difference: {getTypeExplanation(inv1.type, inv2.type)} Check the &quot;Inverter Type&quot; row carefully.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full text-left border-collapse min-w-[600px] bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-4 border-b border-border font-semibold text-text-muted w-1/3">Specification</th>
              <th className="p-4 border-b border-border font-bold text-lg text-primary w-1/3">
                {brand1.brandName}
              </th>
              <th className="p-4 border-b border-border font-bold text-lg text-primary w-1/3">
                {brand2.brandName}
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Model</td>
              <td className="p-4 border-b border-border font-medium">{inv1.modelName}</td>
              <td className="p-4 border-b border-border font-medium">{inv2.modelName}</td>
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Inverter Type</td>
              <td className="p-4 border-b border-border font-medium">{inverterTypeLabel(inv1.type)}</td>
              <td className="p-4 border-b border-border font-medium">{inverterTypeLabel(inv2.type)}</td>
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Phase</td>
              <td className="p-4 border-b border-border font-medium">{inv1.phase === 'single-phase' ? 'Single' : 'Three'}</td>
              <td className="p-4 border-b border-border font-medium">{inv2.phase === 'single-phase' ? 'Single' : 'Three'}</td>
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Rated Power</td>
              {renderValue(
                inv1.ratedPowerKva, inv2.ratedPowerKva,
                (v) => `${v}kVA`,
                (v1, v2) => v1 > v2 ? 1 : v2 > v1 ? 2 : 0
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Peak Surge Power</td>
              {renderValue(
                inv1.peakPowerKw, inv2.peakPowerKw,
                (v) => `${v}kW`,
                (v1, v2) => v1 > v2 ? 1 : v2 > v1 ? 2 : 0
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Peak Efficiency</td>
              {renderValue(
                inv1.efficiency, inv2.efficiency,
                (v) => `${v}%`,
                (v1, v2) => v1 > v2 ? 1 : v2 > v1 ? 2 : 0
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">MPPT Controllers</td>
              {renderValue(
                inv1.mpptControllers, inv2.mpptControllers,
                (v) => v,
                (v1, v2) => v1 > v2 ? 1 : v2 > v1 ? 2 : 0
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Max Solar Input</td>
              {renderValue(
                inv1.maxPvInputW, inv2.maxPvInputW,
                (v) => `${v.toLocaleString()}W`,
                (v1, v2) => v1 > v2 ? 1 : v2 > v1 ? 2 : 0
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Max PV Input Voltage</td>
              {renderValue(
                inv1.maxPvInputV, inv2.maxPvInputV,
                (v) => `${v}V`,
                (v1, v2) => v1 > v2 ? 1 : v2 > v1 ? 2 : 0
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Battery Voltage</td>
              <td className="p-4 border-b border-border font-medium">{inv1.batteryVoltage.join('V, ')}V</td>
              <td className="p-4 border-b border-border font-medium">{inv2.batteryVoltage.join('V, ')}V</td>
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Max Charge Current</td>
              {renderValue(
                inv1.chargeCurrentA, inv2.chargeCurrentA,
                (v) => `${v}A`,
                (v1, v2) => v1 > v2 ? 1 : v2 > v1 ? 2 : 0
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">⚡ NEPA Switchover Time</td>
              {renderValue(
                inv1.switchoverTimeMs, inv2.switchoverTimeMs,
                (v) => <span className={getSwitchoverColor(v)}>{v}ms - {switchoverRating(v)}</span>,
                (v1, v2) => v1 < v2 ? 1 : v2 < v1 ? 2 : 0 // LOWER is better
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Can Feed Grid?</td>
              {renderValue(
                inv1.gridFeedIn, inv2.gridFeedIn,
                (v) => v ? <span className="text-green-700 bg-green-50 px-2 py-1 rounded font-semibold">Yes</span> : 'No',
                (v1, v2) => v1 && !v2 ? 1 : v2 && !v1 ? 2 : v1 && v2 ? 0 : null
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Generator Compatible?</td>
              {renderValue(
                inv1.generatorCompatible, inv2.generatorCompatible,
                (v) => v ? 'Yes' : 'No',
                (v1, v2) => v1 && !v2 ? 1 : v2 && !v1 ? 2 : v1 && v2 ? 0 : null
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">WiFi Monitoring?</td>
              {renderValue(
                inv1.hasWifi, inv2.hasWifi,
                (v) => v ? 'Yes' : 'No',
                (v1, v2) => v1 && !v2 ? 1 : v2 && !v1 ? 2 : v1 && v2 ? 0 : null
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Monitoring App</td>
              <td className="p-4 border-b border-border font-medium">{inv1.monitoringApp}</td>
              <td className="p-4 border-b border-border font-medium">{inv2.monitoringApp}</td>
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Parallel Capable?</td>
              {renderValue(
                inv1.parallelCapable, inv2.parallelCapable,
                (v) => v ? 'Yes' : 'No',
                (v1, v2) => v1 && !v2 ? 1 : v2 && !v1 ? 2 : v1 && v2 ? 0 : null
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">IP Rating</td>
              {renderValue(
                inv1.ipRating, inv2.ipRating,
                (v) => v === 'IP65' ? <span className="text-blue-700 bg-blue-50 px-2 py-1 rounded font-semibold">{v} (Outdoor Safe)</span> : v,
                (v1, v2) => v1 === 'IP65' && v2 !== 'IP65' ? 1 : v2 === 'IP65' && v1 !== 'IP65' ? 2 : v1 === 'IP65' && v2 === 'IP65' ? 0 : null
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Max Operating Temp</td>
              {renderValue(
                inv1.operatingTempMax, inv2.operatingTempMax,
                (v) => `${v}°C`,
                (v1, v2) => v1 > v2 ? 1 : v2 > v1 ? 2 : 0
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Warranty</td>
              {renderValue(
                inv1.warranty, inv2.warranty,
                (v) => `${v} years`,
                (v1, v2) => v1 > v2 ? 1 : v2 > v1 ? 2 : 0
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Weight</td>
              <td className="p-4 border-b border-border font-medium">{inv1.weight}kg</td>
              <td className="p-4 border-b border-border font-medium">{inv2.weight}kg</td>
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Nigeria Availability</td>
              <td className="p-4 border-b border-border font-medium">
                {inv1.nigeriaAvailability === 'widely-available' ? '✅ Wide' : inv1.nigeriaAvailability === 'available' ? '✅ Avail' : '⚠️ Limited'}
              </td>
              <td className="p-4 border-b border-border font-medium">
                {inv2.nigeriaAvailability === 'widely-available' ? '✅ Wide' : inv2.nigeriaAvailability === 'available' ? '✅ Avail' : '⚠️ Limited'}
              </td>
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Battery Compatibility</td>
              <td className="p-4 border-b border-border font-medium">{inv1.batteryCompatibility.length > 5 ? 'Very Wide' : inv1.batteryCompatibility.length > 3 ? 'Wide' : 'Limited'}</td>
              <td className="p-4 border-b border-border font-medium">{inv2.batteryCompatibility.length > 5 ? 'Very Wide' : inv2.batteryCompatibility.length > 3 ? 'Wide' : 'Limited'}</td>
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Price Range (Nigeria)</td>
              {renderValue(
                inv1.priceMin, inv2.priceMin,
                (val) => {
                  const p = val === inv1.priceMin ? inv1 : inv2
                  return p.priceMax >= 1000000 
                    ? `₦${(p.priceMin / 1000).toLocaleString()}k–₦${(p.priceMax / 1000000).toFixed(1)}M`
                    : `₦${(p.priceMin / 1000).toLocaleString()}k–₦${(p.priceMax / 1000).toLocaleString()}k`
                },
                (v1, v2) => v1 < v2 ? 1 : v2 < v1 ? 2 : 0 // LOWER price is better
              )}
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Nigeria Strength</td>
              <td className="p-4 border-b border-border font-medium text-green-700 bg-green-50/30">{inv1.nigeriaStrength}</td>
              <td className="p-4 border-b border-border font-medium text-green-700 bg-green-50/30">{inv2.nigeriaStrength}</td>
            </tr>
            <tr>
              <td className="p-4 border-b border-border text-text-muted">Nigeria Weakness</td>
              <td className="p-4 border-b border-border font-medium text-red-700 bg-red-50/30">{inv1.nigeriaWeakness}</td>
              <td className="p-4 border-b border-border font-medium text-red-700 bg-red-50/30">{inv2.nigeriaWeakness}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
