"use client";

import { NIGERIAN_STATES } from "@/lib/validations";
import { DISCO_BY_STATE } from "@/lib/calculator/calculations";
import { CalculatorInputs } from "@/lib/calculator/types";

interface Props {
  data: Pick<CalculatorInputs, "state" | "monthlyBill" | "generatorSpend">;
  onChange: (updates: Partial<CalculatorInputs>) => void;
  onNext: () => void;
  error: string | null;
}

export default function CalcScreen1({ data, onChange, onNext, error }: Props) {
  const disco = data.state ? DISCO_BY_STATE[data.state] : null;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-text-primary">
          Let&apos;s size your solar system
        </h2>
        <p className="text-text-muted">Takes 2 minutes. Get real numbers for Nigeria.</p>
      </div>

      {/* State */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-text-primary">
          Your State *
        </label>
        <select
          value={data.state}
          onChange={e => onChange({ state: e.target.value })}
          className="select-field w-full"
        >
          <option value="">Select your state</option>
          {NIGERIAN_STATES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {disco && (
          <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-primary" />
            Your distribution company: {disco}
          </p>
        )}
      </div>

      {/* Monthly NEPA Bill */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <label className="block text-sm font-semibold text-text-primary">
              Monthly NEPA Bill
            </label>
            <p className="text-xs text-text-muted mt-0.5">Your average monthly electricity bill</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-primary">
              ₦{data.monthlyBill.toLocaleString()}
            </span>
          </div>
        </div>
        <input
          type="range"
          min={5000}
          max={500000}
          step={5000}
          value={data.monthlyBill}
          onChange={e => onChange({ monthlyBill: Number(e.target.value) })}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>₦5,000</span><span>₦500,000</span>
        </div>
        {/* Direct input */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-medium">₦</span>
          <input
            type="number"
            min={5000}
            max={500000}
            step={1000}
            value={data.monthlyBill}
            onChange={e => onChange({ monthlyBill: Math.min(500000, Math.max(0, Number(e.target.value))) })}
            className="input-field w-full pl-8"
            placeholder="25000"
          />
        </div>
      </div>

      {/* Generator Fuel Spend */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <label className="block text-sm font-semibold text-text-primary">
              Monthly Generator Fuel Spend
            </label>
            <p className="text-xs text-text-muted mt-0.5">Total monthly spend on petrol/diesel</p>
          </div>
          <span className="text-lg font-bold text-primary">
            ₦{data.generatorSpend.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={500000}
          step={5000}
          value={data.generatorSpend}
          onChange={e => onChange({ generatorSpend: Number(e.target.value) })}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>₦0</span><span>₦500,000</span>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-medium">₦</span>
          <input
            type="number"
            min={0}
            max={500000}
            step={1000}
            value={data.generatorSpend}
            onChange={e => onChange({ generatorSpend: Math.min(500000, Math.max(0, Number(e.target.value))) })}
            className="input-field w-full pl-8"
            placeholder="50000"
          />
        </div>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          💡 Most Lagos households spend ₦60,000–₦150,000/month on generator fuel alone.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <button
        onClick={onNext}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base font-semibold"
      >
        Calculate Now →
      </button>
    </div>
  );
}
