import { useCallback, useEffect, useRef, useState } from 'react';
import { PerformanceMode, PerformanceState } from '@/types/architecture';
import { PerformanceManager } from '@/utils/performance';

export function usePerformanceMonitor(initialMode: PerformanceMode = 'AUTO') {
  const managerRef = useRef<PerformanceManager | null>(null);
  if (!managerRef.current) {
    managerRef.current = new PerformanceManager(initialMode);
  }

  const [performanceState, setPerformanceState] = useState<PerformanceState>(() =>
    managerRef.current!.getState()
  );

  const lastSyncTimeRef = useRef<number>(0);

  const recordFrame = useCallback((deltaSeconds: number) => {
    if (!managerRef.current) return;
    managerRef.current.recordFrame(deltaSeconds);

    const now = performance.now();
    // Throttle React state updates to ~500ms to avoid re-rendering every frame
    if (now - lastSyncTimeRef.current > 500) {
      lastSyncTimeRef.current = now;
      const state = managerRef.current.getState();
      setPerformanceState((prev) => {
        if (
          prev.fps !== state.fps ||
          prev.tier !== state.tier ||
          prev.particleCount !== state.particleCount
        ) {
          return state;
        }
        return prev;
      });
    }
  }, []);

  const setPerformanceMode = useCallback((mode: PerformanceMode) => {
    if (!managerRef.current) return;
    managerRef.current.setMode(mode);
    setPerformanceState(managerRef.current.getState());
  }, []);

  useEffect(() => {
    return () => {
      managerRef.current = null;
    };
  }, []);

  return {
    performanceState,
    setPerformanceMode,
    recordFrame,
  };
}
