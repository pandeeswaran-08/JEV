'use client';

import React, { useState } from 'react';
import { useHandTracking } from '@/hooks/useHandTracking';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useArchitectureController } from '@/hooks/useArchitectureController';
import { ArchitectureScene } from '@/scene/ArchitectureScene';
import { HUD } from '@/components/HUD';
import { InspectionPanel } from '@/components/InspectionPanel';

export default function JEVVisualizer() {
  const [resetSignal, setResetSignal] = useState<number>(0);

  // 1. Performance Monitor
  const { performanceState, setPerformanceMode, recordFrame } = usePerformanceMonitor('AUTO');

  // 2. Hand Tracking with Auto-Starting Full Background Camera
  const {
    videoRef,
    gestureState,
    isTracking,
    cameraError,
    toggleTracking,
    startTracking,
    resetRotation,
  } = useHandTracking();

  // 3. JEV Architecture State Controller
  const {
    activeConfig,
    viewMode,
    inspection,
    toggleExploded,
    selectComponent,
    selectLayer,
    clearInspection,
    nextLayer,
    prevLayer,
    nextStep,
    prevStep,
    toggleAutoPlay,
    resetAll,
  } = useArchitectureController({
    gestureState,
    onResetRotation: resetRotation,
  });

  const handleResetView = () => {
    resetAll();
    setResetSignal((prev) => prev + 1);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#050816] font-serif select-none">
      {/* 1. FULL BACKGROUND WEBCAM VIDEO FEED (Face in background, object in front) */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none z-0 transition-opacity duration-700"
        style={{
          opacity: isTracking ? 0.72 : 0,
          filter: 'contrast(1.08) brightness(0.92)',
        }}
      />

      {/* 2. ARCHITECTURAL ATMOSPHERE / GLASS OVERLAY */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] transition-colors duration-1000"
        style={{
          background: isTracking
            ? inspection.selectedLayerId === 'jev-layer-04'
              ? 'radial-gradient(circle at 50% 50%, rgba(5, 8, 22, 0.4) 0%, rgba(5, 8, 22, 0.75) 100%)'
              : inspection.selectedLayerId === 'jev-layer-03'
              ? 'radial-gradient(circle at 50% 50%, rgba(5, 8, 22, 0.4) 0%, rgba(5, 8, 22, 0.75) 100%)'
              : inspection.selectedLayerId === 'jev-layer-02'
              ? 'radial-gradient(circle at 50% 50%, rgba(5, 8, 22, 0.35) 0%, rgba(5, 8, 22, 0.75) 100%)'
              : inspection.selectedLayerId === 'jev-layer-01'
              ? 'radial-gradient(circle at 50% 50%, rgba(5, 8, 22, 0.4) 0%, rgba(5, 8, 22, 0.75) 100%)'
              : 'radial-gradient(circle at 50% 50%, rgba(5, 8, 22, 0.38) 0%, rgba(5, 8, 22, 0.78) 100%)'
            : 'radial-gradient(circle at 50% 50%, rgba(5, 8, 22, 0.85) 0%, rgba(5, 8, 22, 0.98) 100%)',
        }}
      />

      {/* 3. 3D WEBGL CANVAS SCENE (Floats directly in front of user) */}
      <div className="absolute inset-0 z-10">
        <ArchitectureScene
          activeConfig={activeConfig}
          viewMode={viewMode}
          gestureState={gestureState}
          performanceState={performanceState}
          selectedLayerId={inspection.selectedLayerId}
          selectedComponent={inspection.selectedComponent}
          onSelectComponent={selectComponent}
          onSelectLayer={selectLayer}
          onRecordFrame={recordFrame}
          resetSignal={resetSignal}
        />
      </div>

      {/* 4. REAL-TIME HAND SKELETON / CROSSHAIR VISUAL FEEDBACK (z-20) */}
      {isTracking && gestureState.handDetected && (
        <div
          className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
          style={{
            left: `${(1 - gestureState.handX) * 100}%`,
            top: `${gestureState.handY * 100}%`,
          }}
        >
          {/* Outer Pulsing Reticle */}
          <div
            className="w-12 h-12 rounded-full border-2 animate-ping opacity-60"
            style={{
              borderColor:
                gestureState.gesture === 'PINCH'
                  ? '#00D9FF'
                  : gestureState.gesture === 'OPEN_PALM'
                  ? '#8B5CF6'
                  : gestureState.gesture === 'POINT'
                  ? '#3B82F6'
                  : '#22C55E',
            }}
          />
          {/* Inner Solid Target Ring */}
          <div
            className="absolute inset-0 m-auto w-6 h-6 rounded-full border-2 bg-black/40 backdrop-blur-sm shadow-2xl flex items-center justify-center"
            style={{
              borderColor:
                gestureState.gesture === 'PINCH'
                  ? '#00D9FF'
                  : gestureState.gesture === 'OPEN_PALM'
                  ? '#8B5CF6'
                  : gestureState.gesture === 'POINT'
                  ? '#3B82F6'
                  : '#22C55E',
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  gestureState.gesture === 'PINCH'
                    ? '#00D9FF'
                    : gestureState.gesture === 'OPEN_PALM'
                    ? '#8B5CF6'
                    : gestureState.gesture === 'POINT'
                    ? '#3B82F6'
                    : '#22C55E',
              }}
            />
          </div>
          {/* Gesture Floating Tag */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/85 border border-slate-700 text-[10px] text-white font-bold whitespace-nowrap shadow-xl">
            {gestureState.gesture !== 'NONE' ? gestureState.gesture : 'HAND DETECTED'}
          </div>
        </div>
      )}

      {/* Camera Activation Callout if Camera is not started yet */}
      {!isTracking && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <button
            onClick={startTracking}
            className="px-5 py-2.5 rounded-2xl bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold text-xs tracking-wider shadow-2xl border border-cyan-400/50 flex items-center gap-2 transition-all hover:scale-105"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            START CAMERA & HAND GESTURES
          </button>
        </div>
      )}

      {/* 5. ARCHITECTURE LAB HUD OVERLAY (z-30) */}
      <HUD
        activeConfig={activeConfig}
        viewMode={viewMode}
        gestureState={gestureState}
        performanceState={performanceState}
        inspection={inspection}
        isTracking={isTracking}
        cameraError={cameraError}
        onSelectLayer={selectLayer}
        onToggleExploded={toggleExploded}
        onToggleTracking={toggleTracking}
        onResetView={handleResetView}
        onNextLayer={nextLayer}
        onPrevLayer={prevLayer}
        onToggleExplanation={toggleAutoPlay}
        onPerformanceModeChange={setPerformanceMode}
      />

      {/* 6. ARCHITECTURE EXPLANATION PANEL (z-30) */}
      <InspectionPanel
        inspection={inspection}
        activeConfig={activeConfig}
        onClose={clearInspection}
        onNextStep={nextStep}
        onPrevStep={prevStep}
        onToggleAutoPlay={toggleAutoPlay}
        onSelectComponent={selectComponent}
      />
    </main>
  );
}
