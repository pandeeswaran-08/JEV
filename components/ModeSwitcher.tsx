import React from 'react';
import { ViewMode } from '@/types/architecture';

interface ModeSwitcherProps {
  viewMode: ViewMode;
  isTracking: boolean;
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string) => void;
  onToggleExploded: () => void;
  onToggleTracking: () => void;
  onResetView: () => void;
  onNextLayer: () => void;
  onPrevLayer: () => void;
  onToggleExplanation: () => void;
  isAutoPlaying: boolean;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  viewMode,
  isTracking,
  selectedLayerId,
  onSelectLayer,
  onToggleExploded,
  onToggleTracking,
  onResetView,
  onNextLayer,
  onPrevLayer,
  onToggleExplanation,
  isAutoPlaying,
}) => {
  const isExploded = viewMode === 'EXPLODED';

  const layers = [
    { id: 'jev-layer-04', label: 'L4 INTENT', keyNum: '2', color: '#3B82F6' },
    { id: 'jev-layer-03', label: 'L3 CONTEXT', keyNum: '3', color: '#8B5CF6' },
    { id: 'jev-layer-02', label: 'L2 DECISION CORE', keyNum: '4', color: '#00D9FF' },
    { id: 'jev-layer-01', label: 'L1 EXECUTION', keyNum: '5', color: '#22C55E' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 backdrop-blur-2xl bg-[#070d1be6] border border-slate-700/80 p-2 md:p-2.5 rounded-2xl shadow-2xl font-serif">
      {/* 4 Layer Direct Selectors */}
      <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 gap-1">
        {layers.map((l) => {
          const isSelected = selectedLayerId === l.id;
          return (
            <button
              key={l.id}
              onClick={() => onSelectLayer(l.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                isSelected
                  ? 'border shadow-lg font-bold text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{
                backgroundColor: isSelected ? `${l.color}25` : 'transparent',
                borderColor: isSelected ? l.color : 'transparent',
                color: isSelected ? '#ffffff' : undefined,
              }}
            >
              <span>{l.label}</span>{' '}
              <span className="text-[10px] text-slate-500 font-sans">[{l.keyNum}]</span>
            </button>
          );
        })}
      </div>

      {/* Exploded View Toggle */}
      <button
        onClick={onToggleExploded}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
          isExploded
            ? 'bg-purple-500/20 text-purple-200 border-purple-400/60 shadow-lg'
            : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
        }`}
        title="Toggle Exploded View [Space]"
      >
        <span>EXPLODED VIEW</span>{' '}
        <span className="text-[10px] text-slate-500 font-sans">[Space]</span>
      </button>

      {/* Step Explanation / Auto-Presentation */}
      <button
        onClick={onToggleExplanation}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
          isAutoPlaying
            ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/60 animate-pulse'
            : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
        }`}
        title="Explain Architecture Presentation [E]"
      >
        <span>{isAutoPlaying ? 'PLAYING STEP FLOW' : 'EXPLAIN FLOW'}</span>{' '}
        <span className="text-[10px] text-slate-500 font-sans">[E]</span>
      </button>

      {/* Previous / Next Layer */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrevLayer}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition-colors"
          title="Previous Architectural Layer [←]"
        >
          <span>PREV</span>
        </button>
        <button
          onClick={onNextLayer}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition-colors"
          title="Next Architectural Layer [→]"
        >
          <span>NEXT</span>
        </button>
      </div>

      {/* Camera Tracking Toggle */}
      <button
        onClick={onToggleTracking}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
          isTracking
            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-lg'
            : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
        }`}
        title={isTracking ? 'Disable Camera Tracking' : 'Enable Camera Tracking'}
      >
        {isTracking ? 'TRACKING: ACTIVE' : 'ENABLE CAMERA'}
      </button>

      {/* Reset View Button */}
      <button
        onClick={onResetView}
        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition-colors"
        title="Reset 3D Scene View [1 / R]"
      >
        <span>OVERVIEW</span>{' '}
        <span className="text-[10px] text-slate-500 font-sans">[R]</span>
      </button>
    </div>
  );
};
