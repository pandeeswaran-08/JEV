export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface HandResults {
  multiHandLandmarks?: NormalizedLandmark[][];
  multiHandedness?: Array<{
    index: number;
    score: number;
    label: string;
  }>;
}

export interface GestureDetectionConfig {
  pinchThreshold: number;       // Distance between thumb tip and index tip
  pinchReleaseThreshold: number;// Distance to consider pinch released
  palmSpreadThreshold: number;  // Minimum average distance of fingers from wrist for open palm
  swipeDistanceThreshold: number; // Horizontal delta to trigger swipe
  swipeVelocityThreshold: number; // Velocity threshold
  swipeCooldownMs: number;      // Milliseconds between swipe triggers
  palmCooldownMs: number;       // Milliseconds between open palm toggles
  rotationSensitivity: number;  // Multiplier for pinch drag to rotation
  smoothingAlpha: number;       // Exponential smoothing factor for coordinates
}

export const DEFAULT_GESTURE_CONFIG: GestureDetectionConfig = {
  pinchThreshold: 0.075,
  pinchReleaseThreshold: 0.11,
  palmSpreadThreshold: 0.28,
  swipeDistanceThreshold: 0.22,
  swipeVelocityThreshold: 0.0006,
  swipeCooldownMs: 800,
  palmCooldownMs: 1000,
  rotationSensitivity: 3.5,
  smoothingAlpha: 0.25,
};
