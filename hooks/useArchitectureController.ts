import { useCallback, useEffect, useState } from 'react';
import { JEV_ARCHITECTURE_CONFIG } from '@/config/jevArchitecture';
import {
  GestureState,
  InspectionState,
  JEVArchitectureConfig,
  JEVComponent,
  ViewMode,
} from '@/types/architecture';

interface UseArchitectureControllerProps {
  gestureState: GestureState;
  onResetRotation: () => void;
}

export function useArchitectureController({
  gestureState,
  onResetRotation,
}: UseArchitectureControllerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('NORMAL');
  const [inspection, setInspection] = useState<InspectionState>({
    selectedLayerId: null,
    selectedComponent: null,
    activeStepIndex: null,
    isAutoPlaying: false,
    isDetailView: false,
  });

  const activeConfig: JEVArchitectureConfig = JEV_ARCHITECTURE_CONFIG;

  // Toggle Exploded View
  const toggleExploded = useCallback(() => {
    setViewMode((prev) => (prev === 'EXPLODED' ? 'NORMAL' : 'EXPLODED'));
  }, []);

  // Select Component for Inspection
  const selectComponent = useCallback((layerId: string, component: JEVComponent) => {
    setInspection((prev) => ({
      ...prev,
      selectedLayerId: layerId,
      selectedComponent: component,
      activeStepIndex: null,
    }));
  }, []);

  // Select Layer
  const selectLayer = useCallback((layerId: string) => {
    const layer = JEV_ARCHITECTURE_CONFIG.layers.find((l) => l.id === layerId);
    if (layer) {
      setInspection((prev) => ({
        ...prev,
        selectedLayerId: layerId,
        selectedComponent: layer.components[0] || null,
        activeStepIndex: null,
      }));
    }
  }, []);

  // Clear Inspection (Overview)
  const clearInspection = useCallback(() => {
    setInspection({
      selectedLayerId: null,
      selectedComponent: null,
      activeStepIndex: null,
      isAutoPlaying: false,
      isDetailView: false,
    });
  }, []);

  // Next / Previous Layer
  const nextLayer = useCallback(() => {
    const layerIds = JEV_ARCHITECTURE_CONFIG.layers.map((l) => l.id); // 04, 03, 02, 01
    setInspection((prev) => {
      const curIdx = prev.selectedLayerId ? layerIds.indexOf(prev.selectedLayerId) : -1;
      const nextIdx = (curIdx + 1) % layerIds.length;
      const targetLayer = JEV_ARCHITECTURE_CONFIG.layers[nextIdx];
      return {
        ...prev,
        selectedLayerId: targetLayer.id,
        selectedComponent: targetLayer.components[0] || null,
      };
    });
  }, []);

  const prevLayer = useCallback(() => {
    const layerIds = JEV_ARCHITECTURE_CONFIG.layers.map((l) => l.id);
    setInspection((prev) => {
      const curIdx = prev.selectedLayerId ? layerIds.indexOf(prev.selectedLayerId) : 0;
      const nextIdx = (curIdx - 1 + layerIds.length) % layerIds.length;
      const targetLayer = JEV_ARCHITECTURE_CONFIG.layers[nextIdx];
      return {
        ...prev,
        selectedLayerId: targetLayer.id,
        selectedComponent: targetLayer.components[0] || null,
      };
    });
  }, []);

  // Step-by-Step Flow Controls
  const setStep = useCallback((stepIndex: number | null) => {
    if (stepIndex === null) {
      setInspection((prev) => ({
        ...prev,
        activeStepIndex: null,
      }));
      return;
    }
    const safeIdx = Math.max(0, Math.min(stepIndex, JEV_ARCHITECTURE_CONFIG.flowSteps.length - 1));
    const step = JEV_ARCHITECTURE_CONFIG.flowSteps[safeIdx];
    const targetLayer = JEV_ARCHITECTURE_CONFIG.layers.find((l) => l.id === step.layerId);

    setInspection((prev) => ({
      ...prev,
      activeStepIndex: safeIdx,
      selectedLayerId: step.layerId,
      selectedComponent: targetLayer?.components[0] || null,
    }));
  }, []);

  const nextStep = useCallback(() => {
    setInspection((prev) => {
      const curStep = prev.activeStepIndex !== null ? prev.activeStepIndex : -1;
      const nextIdx = (curStep + 1) % JEV_ARCHITECTURE_CONFIG.flowSteps.length;
      const step = JEV_ARCHITECTURE_CONFIG.flowSteps[nextIdx];
      const targetLayer = JEV_ARCHITECTURE_CONFIG.layers.find((l) => l.id === step.layerId);
      return {
        ...prev,
        activeStepIndex: nextIdx,
        selectedLayerId: step.layerId,
        selectedComponent: targetLayer?.components[0] || null,
      };
    });
  }, []);

  const prevStep = useCallback(() => {
    setInspection((prev) => {
      const total = JEV_ARCHITECTURE_CONFIG.flowSteps.length;
      const curStep = prev.activeStepIndex !== null ? prev.activeStepIndex : 0;
      const nextIdx = (curStep - 1 + total) % total;
      const step = JEV_ARCHITECTURE_CONFIG.flowSteps[nextIdx];
      const targetLayer = JEV_ARCHITECTURE_CONFIG.layers.find((l) => l.id === step.layerId);
      return {
        ...prev,
        activeStepIndex: nextIdx,
        selectedLayerId: step.layerId,
        selectedComponent: targetLayer?.components[0] || null,
      };
    });
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setInspection((prev) => {
      const willAutoPlay = !prev.isAutoPlaying;
      return {
        ...prev,
        isAutoPlaying: willAutoPlay,
        activeStepIndex: willAutoPlay && prev.activeStepIndex === null ? 0 : prev.activeStepIndex,
      };
    });
  }, []);

  const toggleDetailView = useCallback(() => {
    setInspection((prev) => ({
      ...prev,
      isDetailView: !prev.isDetailView,
    }));
  }, []);

  // Auto-play timer effect
  useEffect(() => {
    if (!inspection.isAutoPlaying) return;
    const interval = setInterval(() => {
      nextStep();
    }, 4500);
    return () => clearInterval(interval);
  }, [inspection.isAutoPlaying, nextStep]);

  // Reset entire view
  const resetAll = useCallback(() => {
    setViewMode('NORMAL');
    setInspection({
      selectedLayerId: null,
      selectedComponent: null,
      activeStepIndex: null,
      isAutoPlaying: false,
      isDetailView: false,
    });
    onResetRotation();
  }, [onResetRotation]);

  // Respond to Gestures
  useEffect(() => {
    if (gestureState.palmOpen) {
      toggleExploded();
    }
  }, [gestureState.palmOpen, toggleExploded]);

  useEffect(() => {
    if (gestureState.swipeDirection === 'left') {
      prevLayer();
    } else if (gestureState.swipeDirection === 'right') {
      nextLayer();
    }
  }, [gestureState.swipeDirection, prevLayer, nextLayer]);

  useEffect(() => {
    if (gestureState.pointing) {
      // Index finger pointing triggers explain step
      nextStep();
    }
  }, [gestureState.pointing, nextStep]);

  useEffect(() => {
    if (gestureState.twoFinger) {
      toggleDetailView();
    }
  }, [gestureState.twoFinger, toggleDetailView]);

  // Keyboard accessibility shortcuts (Section 20 of specification)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case '1':
          clearInspection();
          break;
        case '2':
          selectLayer('jev-layer-04'); // Intent
          break;
        case '3':
          selectLayer('jev-layer-03'); // Context
          break;
        case '4':
          selectLayer('jev-layer-02'); // Decision Core
          break;
        case '5':
          selectLayer('jev-layer-01'); // Execution
          break;
        case ' ':
          e.preventDefault();
          toggleExploded();
          break;
        case 'e':
        case 'E':
          toggleAutoPlay();
          break;
        case 'r':
        case 'R':
          resetAll();
          break;
        case 'ArrowLeft':
          prevLayer();
          break;
        case 'ArrowRight':
          nextLayer();
          break;
        case 'Escape':
          clearInspection();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    clearInspection,
    selectLayer,
    toggleExploded,
    toggleAutoPlay,
    resetAll,
    prevLayer,
    nextLayer,
  ]);

  return {
    activeConfig,
    viewMode,
    inspection,
    toggleExploded,
    setViewMode,
    selectComponent,
    selectLayer,
    clearInspection,
    nextLayer,
    prevLayer,
    setStep,
    nextStep,
    prevStep,
    toggleAutoPlay,
    toggleDetailView,
    resetAll,
  };
}
