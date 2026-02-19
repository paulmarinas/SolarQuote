
import React from 'react';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  description?: string;
  colorClass?: string;
}

const ResultCard: React.FC<Props> = ({ label, value, unit, icon, description, colorClass = "text-emerald-600" }) => {
  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-white shadow-sm ${colorClass}`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-800">{value}</span>
        {unit && <span className="text-slate-500 font-medium">{unit}</span>}
      </div>
      {description && <p className="mt-2 text-xs text-slate-400 leading-relaxed">{description}</p>}
    </div>
  );
};

export default ResultCard;
