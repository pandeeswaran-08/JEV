export type ViewMode = 'NORMAL' | 'EXPLODED';

export interface JEVComponent {
  name: string;
  role: string;
  description: string;
  input: string;
  output: string;
}

export interface JEVLayerData {
  id: string;
  layerNumber: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  emissiveColor: string;
  glowColor: string;
  components: JEVComponent[];
  yOffset: number;
  explodedYOffset: number;
  height: number;
  width: number;
  depth: number;
}

export interface FlowStep {
  stepNumber: string;
  title: string;
  layerId: string;
  description: string;
  animationSequence: string[];
}

export interface JEVArchitectureConfig {
  name: string;
  subtitle: string;
  description: string;
  layers: JEVLayerData[];
  flowSteps: FlowStep[];
}

export type PerformanceTier = 'HIGH' | 'NORMAL' | 'LOW' | 'CRITICAL';
export type PerformanceMode = 'AUTO' | 'HIGH' | 'BALANCED' | 'LOW';

export interface PerformanceState {
  tier: PerformanceTier;
  mode: PerformanceMode;
  fps: number;
  particleCount: number;
  dpr: number;
  enableEffects: boolean;
}

export type GestureType =
  | 'NONE'
  | 'PINCH'
  | 'OPEN_PALM'
  | 'SWIPE_LEFT'
  | 'SWIPE_RIGHT'
  | 'POINT'
  | 'TWO_FINGER';

export interface GestureState {
  gesture: GestureType;
  handDetected: boolean;
  confidence: number;
  pinch: boolean;
  palmOpen: boolean;
  pointing: boolean;
  twoFinger: boolean;
  swipeDirection: 'left' | 'right' | null;
  handX: number;
  handY: number;
  rotationX: number;
  rotationY: number;
  timestamp: number;
  pinchDistance: number;
  isTracking: boolean;
  trackingMessage?: string;
}

export interface InspectionState {
  selectedLayerId: string | null;
  selectedComponent: JEVComponent | null;
  activeStepIndex: number | null;
  isAutoPlaying: boolean;
  isDetailView: boolean;
}
