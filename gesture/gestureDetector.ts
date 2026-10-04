import {
  GestureDetectionConfig,
  HandResults,
  DEFAULT_GESTURE_CONFIG,
} from '@/gesture/gestureTypes';
import { GestureState, GestureType } from '@/types/architecture';
import { clamp, distance2D, ExponentialFilter } from '@/utils/math';

interface PositionSample {
  x: number;
  y: number;
  time: number;
}

export class GestureDetector {
  private config: GestureDetectionConfig;
  private isPinching: boolean = false;
  private prevHandX: number | null = null;
  private prevHandY: number | null = null;
  private currentRotationX: number = 0;
  private currentRotationY: number = 0;
  private lastSwipeTime: number = 0;
  private lastPalmTime: number = 0;
  private lastPointTime: number = 0;
  private positionHistory: PositionSample[] = [];

  private xFilter = new ExponentialFilter(0.35);
  private yFilter = new ExponentialFilter(0.35);
  private pinchFilter = new ExponentialFilter(0.4);

  constructor(config: Partial<GestureDetectionConfig> = {}) {
    this.config = { ...DEFAULT_GESTURE_CONFIG, ...config };
  }

  public updateConfig(newConfig: Partial<GestureDetectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public resetRotation(): void {
    this.currentRotationX = 0;
    this.currentRotationY = 0;
    this.prevHandX = null;
    this.prevHandY = null;
    this.isPinching = false;
    this.positionHistory = [];
  }

  public processLandmarks(results: HandResults): GestureState {
    const now = performance.now();

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      this.isPinching = false;
      this.prevHandX = null;
      this.prevHandY = null;
      this.positionHistory = [];

      return {
        gesture: 'NONE',
        handDetected: false,
        confidence: 0,
        pinch: false,
        palmOpen: false,
        pointing: false,
        twoFinger: false,
        swipeDirection: null,
        handX: 0.5,
        handY: 0.5,
        rotationX: this.currentRotationX,
        rotationY: this.currentRotationY,
        timestamp: now,
        pinchDistance: 1.0,
        isTracking: true,
        trackingMessage: 'Awaiting hand in camera view...',
      };
    }

    const landmarks = results.multiHandLandmarks[0];
    const confidence = results.multiHandedness?.[0]?.score ?? 0.85;

    // Key landmarks
    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexMcp = landmarks[5];
    const indexPip = landmarks[6];
    const indexTip = landmarks[8];
    const middlePip = landmarks[10];
    const middleTip = landmarks[12];
    const ringPip = landmarks[14];
    const ringTip = landmarks[16];
    const pinkyPip = landmarks[18];
    const pinkyTip = landmarks[20];

    // Palm center approximation (average of wrist, index MCP, pinky MCP)
    const rawCenterX = (wrist.x + indexMcp.x + landmarks[17].x) / 3;
    const rawCenterY = (wrist.y + indexMcp.y + landmarks[17].y) / 3;

    // Smooth hand center coordinates
    const handX = this.xFilter.filter(rawCenterX);
    const handY = this.yFilter.filter(rawCenterY);

    // Track position history for swipe detection
    this.positionHistory.push({ x: handX, y: handY, time: now });
    this.positionHistory = this.positionHistory.filter((sample) => now - sample.time <= 350);

    // 1. PINCH DETECTION with hysteresis
    const rawPinchDist = distance2D(thumbTip.x, thumbTip.y, indexTip.x, indexTip.y);
    const pinchDistance = this.pinchFilter.filter(rawPinchDist);

    if (!this.isPinching) {
      if (pinchDistance < this.config.pinchThreshold) {
        this.isPinching = true;
        this.prevHandX = handX;
        this.prevHandY = handY;
      }
    } else {
      if (pinchDistance > this.config.pinchReleaseThreshold) {
        this.isPinching = false;
        this.prevHandX = null;
        this.prevHandY = null;
      }
    }

    // Finger extension checks
    const indexExtended =
      distance2D(indexTip.x, indexTip.y, wrist.x, wrist.y) >
      distance2D(indexPip.x, indexPip.y, wrist.x, wrist.y) * 1.15;
    const middleExtended =
      distance2D(middleTip.x, middleTip.y, wrist.x, wrist.y) >
      distance2D(middlePip.x, middlePip.y, wrist.x, wrist.y) * 1.15;
    const ringExtended =
      distance2D(ringTip.x, ringTip.y, wrist.x, wrist.y) >
      distance2D(ringPip.x, ringPip.y, wrist.x, wrist.y) * 1.15;
    const pinkyExtended =
      distance2D(pinkyTip.x, pinkyTip.y, wrist.x, wrist.y) >
      distance2D(pinkyPip.x, pinkyPip.y, wrist.x, wrist.y) * 1.15;

    // Thumb extended away from palm
    const thumbExtended = distance2D(thumbTip.x, thumbTip.y, pinkyPip.x, pinkyPip.y) > 0.16;

    // Finger spread
    const spreadIndexMiddle = distance2D(indexTip.x, indexTip.y, middleTip.x, middleTip.y);
    const spreadMiddlePinky = distance2D(middleTip.x, middleTip.y, pinkyTip.x, pinkyTip.y);
    const isSpread = spreadIndexMiddle + spreadMiddlePinky > 0.12;

    // 2. OPEN PALM DETECTION
    const isOpenPalmCandidate =
      indexExtended &&
      middleExtended &&
      ringExtended &&
      pinkyExtended &&
      thumbExtended &&
      isSpread &&
      !this.isPinching;

    let palmOpen = false;
    if (isOpenPalmCandidate) {
      if (now - this.lastPalmTime > this.config.palmCooldownMs) {
        palmOpen = true;
        this.lastPalmTime = now;
      }
    }

    // 3. POINT / INDEX FINGER DETECTION
    const isPointingCandidate =
      indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !this.isPinching;
    let isPointing = false;
    if (isPointingCandidate) {
      if (now - this.lastPointTime > 400) {
        isPointing = true;
        this.lastPointTime = now;
      }
    }

    // 4. TWO-FINGER GESTURE DETECTION (Index + Middle extended, others curled)
    const isTwoFinger =
      indexExtended && middleExtended && !ringExtended && !pinkyExtended && !this.isPinching;

    // 5. SWIPE DETECTION
    let swipeDirection: 'left' | 'right' | null = null;
    if (
      !this.isPinching &&
      this.positionHistory.length >= 4 &&
      now - this.lastSwipeTime > this.config.swipeCooldownMs
    ) {
      const oldest = this.positionHistory[0];
      const deltaX = handX - oldest.x;
      const deltaTime = now - oldest.time;

      if (deltaTime > 80 && deltaTime < 350) {
        const velocityX = Math.abs(deltaX) / deltaTime;

        if (
          Math.abs(deltaX) > this.config.swipeDistanceThreshold &&
          velocityX > this.config.swipeVelocityThreshold
        ) {
          swipeDirection = deltaX > 0 ? 'right' : 'left';
          this.lastSwipeTime = now;
          this.positionHistory = [];
        }
      }
    }

    // 6. PINCH ROTATION COMPUTATION
    if (this.isPinching) {
      if (this.prevHandX !== null && this.prevHandY !== null) {
        const deltaX = -(handX - this.prevHandX);
        const deltaY = handY - this.prevHandY;

        this.currentRotationY += deltaX * this.config.rotationSensitivity;
        this.currentRotationX += deltaY * this.config.rotationSensitivity;

        this.currentRotationX = clamp(this.currentRotationX, -Math.PI / 3.5, Math.PI / 3.5);
      }
      this.prevHandX = handX;
      this.prevHandY = handY;
    }

    // Classify primary gesture
    let primaryGesture: GestureType = 'NONE';
    if (this.isPinching) {
      primaryGesture = 'PINCH';
    } else if (swipeDirection === 'left') {
      primaryGesture = 'SWIPE_LEFT';
    } else if (swipeDirection === 'right') {
      primaryGesture = 'SWIPE_RIGHT';
    } else if (isOpenPalmCandidate) {
      primaryGesture = 'OPEN_PALM';
    } else if (isPointingCandidate) {
      primaryGesture = 'POINT';
    } else if (isTwoFinger) {
      primaryGesture = 'TWO_FINGER';
    }

    return {
      gesture: primaryGesture,
      handDetected: true,
      confidence,
      pinch: this.isPinching,
      palmOpen,
      pointing: isPointing,
      twoFinger: isTwoFinger,
      swipeDirection,
      handX,
      handY,
      rotationX: this.currentRotationX,
      rotationY: this.currentRotationY,
      timestamp: now,
      pinchDistance,
      isTracking: true,
      trackingMessage: this.isPinching
        ? 'ROTATE ARCHITECTURE'
        : isOpenPalmCandidate
        ? 'EXPLODED VIEW'
        : isPointingCandidate
        ? 'EXPLAIN COMPONENT'
        : isTwoFinger
        ? 'DETAIL VIEW'
        : swipeDirection === 'left'
        ? 'PREVIOUS LAYER'
        : swipeDirection === 'right'
        ? 'NEXT LAYER'
        : 'TRACKING ACTIVE',
    };
  }
}
