import React from 'react';
import {
  FlowStep,
  InspectionState,
  JEVArchitectureConfig,
  JEVComponent,
  JEVLayerData,
} from '@/types/architecture';

interface InspectionPanelProps {
  inspection: InspectionState;
  activeConfig: JEVArchitectureConfig;
  onClose: () => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onToggleAutoPlay?: () => void;
  onSelectComponent?: (layerId: string, comp: JEVComponent) => void;
}

export const InspectionPanel: React.FC<InspectionPanelProps> = ({
  inspection,
  activeConfig,
  onClose,
  onNextStep,
  onPrevStep,
  onToggleAutoPlay,
  onSelectComponent,
}) => {
  const { selectedLayerId, selectedComponent, activeStepIndex, isAutoPlaying, isDetailView } =
    inspection;

  if (!selectedLayerId && !selectedComponent && activeStepIndex === null) {
    return null;
  }

  // Determine current active layer and step
  const activeStep: FlowStep | null =
    activeStepIndex !== null && activeStepIndex >= 0 && activeStepIndex < activeConfig.flowSteps.length
      ? activeConfig.flowSteps[activeStepIndex]
      : null;

  const currentLayer: JEVLayerData =
    activeConfig.layers.find((l) => l.id === (activeStep ? activeStep.layerId : selectedLayerId)) ||
    activeConfig.layers[0];

  const comp: JEVComponent =
    selectedComponent ||
    (currentLayer.components.length > 0 ? currentLayer.components[0] : {
      name: currentLayer.title,
      role: currentLayer.subtitle,
      description: currentLayer.description,
      input: 'Context and parameters',
      output: 'Evaluated decision state',
    });

  return (
    <aside
      aria-label="Architecture Explanation Panel"
      className="absolute top-20 right-4 md:right-6 w-[92vw] sm:w-96 md:w-[420px] max-h-[82vh] overflow-y-auto backdrop-blur-2xl bg-[#070d1be6] border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-2xl z-30 transition-all duration-300 text-slate-100 font-serif"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: currentLayer.color }}
          />
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
            ARCHITECTURE EXPLANATION
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded border border-slate-700 hover:border-slate-500 transition-colors"
          aria-label="Close Explanation"
        >
          CLOSE
        </button>
      </div>

      {/* Step Sequence Indicator if in presentation mode */}
      {activeStep && (
        <div className="mt-3.5 bg-slate-900/90 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-bold text-cyan-400">
              STEP {activeStep.stepNumber} OF 06
            </span>
            <span className="text-[11px] text-slate-400">{activeStep.title}</span>
          </div>

          {/* Step Progress Line */}
          <div className="flex items-center gap-1.5 w-full my-2">
            {activeConfig.flowSteps.map((s, idx) => (
              <div
                key={s.stepNumber}
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    idx === activeStepIndex
                      ? currentLayer.color
                      : idx < (activeStepIndex || 0)
                      ? `${currentLayer.color}80`
                      : '#334155',
                }}
              />
            ))}
          </div>

          {/* Sequential Data Path Animation Badges */}
          <div className="mt-2.5 flex items-center flex-wrap gap-1.5 text-[11px]">
            {activeStep.animationSequence.map((item, i) => (
              <React.Fragment key={i}>
                <span
                  className="px-2 py-0.5 rounded border text-[11px] font-semibold"
                  style={{
                    backgroundColor: `${currentLayer.color}15`,
                    borderColor: `${currentLayer.color}40`,
                    color: currentLayer.color,
                  }}
                >
                  {item}
                </span>
                {i < activeStep.animationSequence.length - 1 && (
                  <span className="text-slate-500 font-sans font-bold">→</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Navigation Buttons */}
          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
            <button
              onClick={onPrevStep}
              className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              PREVIOUS
            </button>
            {onToggleAutoPlay && (
              <button
                onClick={onToggleAutoPlay}
                className="px-2.5 py-1 text-xs rounded border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
              >
                {isAutoPlaying ? 'PAUSE AUTO' : 'AUTO PLAY'}
              </button>
            )}
            <button
              onClick={onNextStep}
              className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              NEXT STEP
            </button>
          </div>
        </div>
      )}

      {/* Layer Identity */}
      <div className="mt-4 flex items-start justify-between">
        <div>
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: currentLayer.color }}
          >
            LAYER {currentLayer.layerNumber}
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide mt-0.5">
            {currentLayer.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{currentLayer.subtitle}</p>
        </div>
        <div
          className="px-2.5 py-1 rounded text-xs font-bold border shrink-0"
          style={{
            borderColor: `${currentLayer.color}60`,
            backgroundColor: `${currentLayer.color}15`,
            color: currentLayer.color,
          }}
        >
          L-{currentLayer.layerNumber}
        </div>
      </div>

      {/* Selected Component Information */}
      <div className="mt-4 pt-3 border-t border-slate-800/90">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-wide">
            {comp.name}
          </h3>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded border"
            style={{
              borderColor: `${currentLayer.color}40`,
              color: currentLayer.color,
            }}
          >
            {comp.role}
          </span>
        </div>

        {/* Role & What happens here */}
        <div className="mt-3.5 space-y-3">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              What happens here
            </span>
            <p className="text-sm text-slate-200 leading-relaxed">
              {comp.description}
            </p>
          </div>

          {/* Structured Input & Output (Core specification requirement) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                Input
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {comp.input}
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Output
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {comp.output}
              </p>
            </div>
          </div>
        </div>

        {/* Component Selector Grid */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Layer Components
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currentLayer.components.map((c) => {
              const isSelected = comp.name === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => onSelectComponent?.(currentLayer.id, c)}
                  className={`text-xs px-2.5 py-1 rounded transition-colors border ${
                    isSelected
                      ? 'bg-slate-700 border-white text-white font-bold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail View Expansion */}
        {isDetailView && (
          <div className="mt-4 p-3 bg-slate-900/90 border border-cyan-500/30 rounded-xl text-xs text-slate-300">
            <span className="text-cyan-400 font-bold block mb-1">
              SYSTEM ARCHITECTURE SPECIFICATION
            </span>
            <p className="leading-relaxed">
              Every stage in JEV Architecture operates deterministically on structured payloads.
              Data transforms from raw interaction signals into parsed goals, expands into semantic
              knowledge candidates, resolves through the JEV Decision Core with strict confidence
              estimation, and passes to the execution environment.
            </p>
          </div>
        )}
      </div>

      {/* Layer Overview Summary */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 leading-relaxed">
        {currentLayer.description}
      </div>
    </aside>
  );
};
