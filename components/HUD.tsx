import React from 'react';
import {
  GestureState,
  InspectionState,
  JEVArchitectureConfig,
  PerformanceMode,
  PerformanceState,
  ViewMode,
} from '@/types/architecture';
import { GestureStatus } from '@/components/GestureStatus';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { ModeSwitcher } from '@/components/ModeSwitcher';

interface HUDProps {
  activeConfig: JEVArchitectureConfig;
  viewMode: ViewMode;
  gestureState: GestureState;
  performanceState: PerformanceState;
  inspection: InspectionState;
  isTracking: boolean;
  cameraError: string | null;
  onSelectLayer: (layerId: string) => void;
  onToggleExploded: () => void;
  onToggleTracking: () => void;
  onResetView: () => void;
  onNextLayer: () => void;
  onPrevLayer: () => void;
  onToggleExplanation: () => void;
  onPerformanceModeChange: (mode: PerformanceMode) => void;
}

export const HUD: React.FC<HUDProps> = ({
  activeConfig,
  viewMode,
  gestureState,
  performanceState,
  inspection,
  isTracking,
  cameraError,
  onSelectLayer,
  onToggleExploded,
  onToggleTracking,
  onResetView,
  onNextLayer,
  onPrevLayer,
  onToggleExplanation,
  onPerformanceModeChange,
}) => {
  const currentViewLabel =
    viewMode === 'EXPLODED'
      ? 'EXPLODED VIEW'
      : inspection.selectedLayerId
      ? `LAYER FOCUS: ${
          activeConfig.layers.find((l) => l.id === inspection.selectedLayerId)?.layerNumber || ''
        }`
      : 'OVERVIEW';

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 md:p-6 select-none overflow-hidden font-serif">
      {/* TOP BAR */}
      <header className="flex items-start justify-between w-full pointer-events-auto gap-4">
        {/* Top-Left: Brand & Architecture Lab */}
        <div className="backdrop-blur-2xl bg-[#070d1be6] border border-slate-700/80 rounded-2xl p-4 md:p-5 shadow-2xl max-w-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00D9FF] animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-cyan-300 font-bold">
              SYSTEM ARCHITECTURE LABORATORY
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {activeConfig.name}
          </h1>

          <p className="text-sm text-cyan-200/90 font-medium mt-0.5">
            {activeConfig.subtitle}
          </p>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {activeConfig.description}
          </p>

          {/* Sequential Decision Flow Legend */}
          <div className="mt-3 flex items-center flex-wrap gap-1 text-[11px] font-sans text-slate-300 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[#3B82F6] font-bold">INTENT</span>
            <span className="text-slate-500 font-bold">→</span>
            <span className="text-[#8B5CF6] font-bold">CONTEXT</span>
            <span className="text-slate-500 font-bold">→</span>
            <span className="text-[#00D9FF] font-bold">DECISION CORE</span>
            <span className="text-slate-500 font-bold">→</span>
            <span className="text-[#22C55E] font-bold">EXECUTION</span>
            <span className="text-slate-500 font-bold">→</span>
            <span className="text-white font-bold">RESULT</span>
          </div>
        </div>

        {/* Top-Right: System Status & Performance Monitor */}
        <div className="flex flex-col items-end gap-2.5">
          {/* Status Box */}
          <div className="backdrop-blur-2xl bg-[#070d1be6] border border-slate-700/80 rounded-2xl p-3 shadow-2xl text-xs min-w-[180px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1.5 mb-1.5 border-b border-slate-800">
              SYSTEM STATUS
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">CAMERA:</span>
                <span className={`font-bold ${isTracking ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {isTracking ? 'ACTIVE' : 'READY'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">TRACKING:</span>
                <span className={`font-bold ${gestureState.handDetected ? 'text-cyan-400' : 'text-slate-400'}`}>
                  {gestureState.handDetected ? 'TRACKED' : isTracking ? 'SEARCHING' : 'IDLE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">VIEW:</span>
                <span className="font-bold text-white">{currentViewLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <GestureStatus gestureState={gestureState} isTracking={isTracking} />
            <PerformanceMonitor
              performanceState={performanceState}
              onModeChange={onPerformanceModeChange}
            />
          </div>
        </div>
      </header>

      {/* CAMERA ERROR NOTIFICATION (IF ANY) */}
      {cameraError && (
        <div className="self-center pointer-events-auto backdrop-blur-md bg-amber-950/80 border border-amber-600/50 text-amber-200 px-4 py-2 rounded-xl text-xs shadow-xl max-w-xl">
          <span>{cameraError}</span>
        </div>
      )}

      {/* BOTTOM CONTROLS & DOCK */}
      <footer className="relative flex flex-col md:flex-row items-center md:items-end justify-between w-full pointer-events-auto gap-4">
        {/* Bottom-Left: Hand Gesture & Keyboard Legend */}
        <div className="backdrop-blur-2xl bg-[#070d1be6] border border-slate-700/80 rounded-2xl p-3 shadow-2xl hidden lg:block text-xs max-w-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pb-1 border-b border-slate-800">
            GESTURE & SHORTCUTS
          </div>
          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-cyan-300 font-bold">Pinch Hand:</span>
              <span>Rotate 3D Architecture</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300 font-bold">Open Palm:</span>
              <span>Exploded View [Space]</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-300 font-bold">Point Finger:</span>
              <span>Explain Component [E]</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-300 font-bold">Swipe Hand:</span>
              <span>Navigate Layers [← / →]</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white font-bold">Keys 1 - 5:</span>
              <span>Overview & Layers</span>
            </div>
          </div>
        </div>

        {/* Center: Mode Switcher Bar */}
        <div className="self-center md:absolute md:left-1/2 md:-translate-x-1/2">
          <ModeSwitcher
            viewMode={viewMode}
            isTracking={isTracking}
            selectedLayerId={inspection.selectedLayerId}
            onSelectLayer={onSelectLayer}
            onToggleExploded={onToggleExploded}
            onToggleTracking={onToggleTracking}
            onResetView={onResetView}
            onNextLayer={onNextLayer}
            onPrevLayer={onPrevLayer}
            onToggleExplanation={onToggleExplanation}
            isAutoPlaying={inspection.isAutoPlaying}
          />
        </div>

        {/* Bottom-Right: Camera Status Badge */}
        <div className="flex items-center gap-2 backdrop-blur-md bg-[#070d1be6] border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] text-slate-400">
          <span
            className={`w-2 h-2 rounded-full ${isTracking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}
          />
          <span>{isTracking ? 'Live Background Sensor Active' : 'Camera Sensor Idle'}</span>
        </div>
      </footer>
    </div>
  );
};
