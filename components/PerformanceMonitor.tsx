import React from 'react';
import { PerformanceMode, PerformanceState } from '@/types/architecture';

interface PerformanceMonitorProps {
  performanceState: PerformanceState;
  onModeChange: (mode: PerformanceMode) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  performanceState,
  onModeChange,
}) => {
  const { fps, tier, mode, particleCount } = performanceState;

  const getTierColor = () => {
    switch (tier) {
      case 'HIGH':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'NORMAL':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      case 'LOW':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'CRITICAL':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    }
  };

  const modes: PerformanceMode[] = ['AUTO', 'HIGH', 'BALANCED', 'LOW'];

  return (
    <div className="flex flex-col gap-1.5 backdrop-blur-xl bg-[#070c18d0] border border-slate-800 p-2.5 rounded-xl shadow-2xl text-xs font-serif min-w-[170px]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="font-bold">SYSTEM:</span>
          <span
            className={`font-bold ${
              fps >= 50 ? 'text-emerald-400' : fps >= 30 ? 'text-cyan-400' : 'text-amber-400'
            }`}
          >
            {fps} FPS
          </span>
        </div>

        <div className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getTierColor()}`}>
          {tier}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span>Active Particles:</span>
        <span className="text-slate-300 font-bold">{particleCount}</span>
      </div>

      {/* Manual Mode Buttons */}
      <div className="flex items-center gap-1 pt-1 border-t border-slate-800/80">
        {modes.map((m) => {
          const isActive = mode === m;
          return (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
};
