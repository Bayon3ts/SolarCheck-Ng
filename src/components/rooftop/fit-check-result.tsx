'use client';
import { FitCheckResult } from '@/lib/rooftop/panel-footprint';

export function FitCheckDisplay({ result }: { result: FitCheckResult }) {
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
    </div>
  );
}
