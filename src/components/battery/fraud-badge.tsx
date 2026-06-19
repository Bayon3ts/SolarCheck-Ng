'use client';

import { FraudReport } from '@/lib/battery-fraud/detector';

export function BatteryFraudBadge({ report }: { report: FraudReport }) {
  if (report.verdict === 'CLEAN') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
        ✓ Specs Verified
      </span>
    );
  }

  const isCritical = report.verdict === 'LIKELY FRAUDULENT';

  return (
    <div className="space-y-2">
      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${isCritical ? 'text-red-700 bg-red-50 border border-red-200' : 'text-amber-700 bg-amber-50 border border-amber-200'}`}>
        {isCritical ? '⚠️ Specs Flagged' : '⚡ Specs Need Review'}
      </span>

      <div className={`text-xs rounded-xl p-3 border space-y-2 ${isCritical ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
        {report.flags.map((flag, i) => (
          <div key={i} className="flex gap-2">
            <span className="flex-shrink-0">
              {flag.severity === 'critical' ? '🔴' : flag.severity === 'warning' ? '🟡' : 'ℹ️'}
            </span>
            <p className="text-muted-foreground leading-relaxed">
              {flag.message}
            </p>
          </div>
        ))}

        <div className="pt-2 border-t border-current/10 flex justify-between text-xs font-semibold">
          <span>Realistic usable energy:</span>
          <span>{report.correctedUsableKwh} kWh</span>
        </div>
        {report.correctedAutonomyHours && (
          <div className="flex justify-between text-xs font-semibold">
            <span>Realistic autonomy:</span>
            <span>{report.correctedAutonomyHours}h</span>
          </div>
        )}
      </div>
    </div>
  );
}
