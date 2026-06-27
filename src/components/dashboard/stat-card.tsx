import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  colorClass?: string; // used for icon text color if any
}

export function StatCard({ label, value, icon, colorClass = "text-gray-400" }: StatCardProps) {
  return (
    <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E5E5E0] shadow-sm relative overflow-hidden">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">
          {label}
        </span>
        <span className="text-4xl font-black text-[#1A1A1A]">
          {value}
        </span>
      </div>
      {icon && (
        <div className={`absolute top-6 right-6 text-xl opacity-30 ${colorClass}`}>
          {icon}
        </div>
      )}
    </div>
  );
}
