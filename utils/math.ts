/**
 * Math and interpolation utilities for 3D animation and gesture smoothing
 */

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start: number, end: number, alpha: number): number {
  return start + (end - start) * alpha;
}

/**
 * Frame-rate independent dampening (spring-like lerp)
 * Similar to Three.js MathUtils.damp
 */
export function damp(current: number, target: number, lambda: number, delta: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * delta));
}

/**
 * 2D Euclidean distance
 */
export function distance2D(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 3D Euclidean distance
 */
export function distance3D(
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Exponential moving average filter
 */
export class ExponentialFilter {
  private value: number | null = null;
  private alpha: number;

  constructor(alpha: number = 0.25) {
    this.alpha = alpha;
  }

  public filter(val: number): number {
    if (this.value === null) {
      this.value = val;
    } else {
      this.value = this.alpha * val + (1 - this.alpha) * this.value;
    }
    return this.value;
  }

  public reset(val?: number): void {
    this.value = val !== undefined ? val : null;
  }

  public get current(): number {
    return this.value ?? 0;
  }
}
