'use client';
import { FitCheckResult } from '@/lib/rooftop/panel-footprint';
import { NasaSolarMetrics } from '@/lib/nasaSolar';

export function FitCheckDisplay({ result, nasaMetrics }: { result: FitCheckResult, nasaMetrics?: NasaSolarMetrics | null }) {
  return (
    <div className={`rounded-xl p-4 border ${result.fits ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{result.fits ? '✓' : '⚠️'}</span>
        <p className={`text-sm font-bold ${result.fits ? 'text-green-800' : 'text-amber-800'}`}>
          {result.fits ? 'Roof space verified' : 'Roof space restriction flagged'}
        </p>
      </div>

      <p className={`text-sm leading-relaxed mb-3 ${result.fits ? 'text-green-900' : 'text-amber-900'}`}>
        {result.message}
      </p>

      <div className="grid grid-cols-2 gap-3 text-xs border-t pt-3 border-gray-200/60 text-gray-700">
        <div>
          <span className="text-gray-500">Usable roof area:</span> <span className="font-bold">{result.usableRoofAreaM2}m²</span>
        </div>
        <div>
          <span className="text-gray-500">Estimated footprint:</span> <span className="font-bold">{result.totalAreaNeededM2}m²</span>
        </div>
        <div>
          <span className="text-gray-500">Target panels:</span> <span className="font-bold">{result.panelsRequired}</span>
        </div>
        <div>
          <span className="text-gray-500">Maximum fit capacity:</span> <span className="font-bold">{result.maxPanelsThatFit}</span>
        </div>
      </div>
      
      {nasaMetrics && (
        <div className="grid grid-cols-2 gap-3 text-xs border-t pt-3 mt-3 border-gray-200/60 text-gray-700">
          <div className="col-span-2 font-bold text-gray-800">
            NASA Climate Insights:
          </div>
          <div>
            <span className="text-gray-500">Peak Sun:</span> <span className="font-bold">{nasaMetrics.annualPeakSunHours.toFixed(2)} kWh/m²/day</span>
          </div>
          <div>
            <span className="text-gray-500">Avg Temp:</span> <span className="font-bold">{nasaMetrics.avgTemperature.toFixed(1)}°C</span>
          </div>
        </div>
      )}
    </div>
  );
}
