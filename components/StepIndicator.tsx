
import React from 'react';
import { AppStep } from '../types';
import { STEP_METADATA } from '../constants';

interface Props {
  currentStep: AppStep;
}

const StepIndicator: React.FC<Props> = ({ currentStep }) => {
  const currentIndex = STEP_METADATA.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="relative flex justify-between items-center">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (STEP_METADATA.length - 1)) * 100}%` }}
        />

        {STEP_METADATA.map((step, idx) => {
          const isActive = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' 
                    : isActive 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                {idx + 1}
              </div>
              <span 
                className={`absolute top-10 whitespace-nowrap text-xs font-medium transition-colors duration-300 ${
                  isActive ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
