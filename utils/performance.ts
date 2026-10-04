import { PerformanceMode, PerformanceState, PerformanceTier } from '@/types/architecture';

export class PerformanceManager {
  private fpsBuffer: number[] = [];
  private readonly bufferSize = 45; // sample over ~0.75-1.5 seconds
  private lastTierChangeTime = 0;
  private readonly cooldownMs = 2500; // prevent flickering between tiers
  private currentMode: PerformanceMode = 'AUTO';
  private currentTier: PerformanceTier = 'NORMAL';
  private lastFps = 60;

  constructor(initialMode: PerformanceMode = 'AUTO') {
    this.currentMode = initialMode;
    this.applyMode(initialMode);
  }

  public setMode(mode: PerformanceMode): void {
    this.currentMode = mode;
    this.applyMode(mode);
  }

  public getMode(): PerformanceMode {
    return this.currentMode;
  }

  public recordFrame(deltaSeconds: number): void {
    if (deltaSeconds <= 0) return;
    const instantaneousFps = Math.min(120, 1 / deltaSeconds);
    this.fpsBuffer.push(instantaneousFps);
    if (this.fpsBuffer.length > this.bufferSize) {
      this.fpsBuffer.shift();
    }

    if (this.fpsBuffer.length >= 15) {
      const sum = this.fpsBuffer.reduce((a, b) => a + b, 0);
      this.lastFps = Math.round(sum / this.fpsBuffer.length);
    }

    if (this.currentMode === 'AUTO') {
      this.evaluateAdaptiveTier();
    }
  }

  private applyMode(mode: PerformanceMode): void {
    if (mode === 'HIGH') {
      this.currentTier = 'HIGH';
    } else if (mode === 'BALANCED') {
      this.currentTier = 'NORMAL';
    } else if (mode === 'LOW') {
      this.currentTier = 'LOW';
    } else {
      // AUTO mode starts at NORMAL
      this.currentTier = 'NORMAL';
    }
  }

  private evaluateAdaptiveTier(): void {
    const now = performance.now();
    if (now - this.lastTierChangeTime < this.cooldownMs) {
      return;
    }

    const fps = this.lastFps;
    let nextTier = this.currentTier;

    if (fps >= 52) {
      nextTier = 'HIGH';
    } else if (fps >= 38) {
      nextTier = 'NORMAL';
    } else if (fps >= 24) {
      nextTier = 'LOW';
    } else {
      nextTier = 'CRITICAL';
    }

    if (nextTier !== this.currentTier) {
      this.currentTier = nextTier;
      this.lastTierChangeTime = now;
    }
  }

  public getState(): PerformanceState {
    const tier = this.currentTier;
    let particleCount = 500;
    let dpr = 1.0;
    let enableEffects = true;

    switch (tier) {
      case 'HIGH':
        particleCount = 800;
        dpr = 1.5;
        enableEffects = true;
        break;
      case 'NORMAL':
        particleCount = 500;
        dpr = 1.25;
        enableEffects = true;
        break;
      case 'LOW':
        particleCount = 200;
        dpr = 1.0;
        enableEffects = false;
        break;
      case 'CRITICAL':
        particleCount = 0;
        dpr = 1.0;
        enableEffects = false;
        break;
    }

    return {
      tier,
      mode: this.currentMode,
      fps: this.lastFps,
      particleCount,
      dpr,
      enableEffects,
    };
  }
}
