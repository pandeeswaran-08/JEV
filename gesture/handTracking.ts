import { HandResults } from '@/gesture/gestureTypes';

export interface HandTrackerCallbacks {
  onResults: (results: HandResults) => void;
  onError: (error: string) => void;
  onStatusChange: (status: 'initializing' | 'ready' | 'stopped' | 'error') => void;
}

// Robust helper to load MediaPipe Hands in Next.js / browser
async function getMediaPipeHandsConstructor(): Promise<any> {
  if (typeof window === 'undefined') return null;

  // 1. Check if window.Hands is already available
  if ((window as any).Hands) {
    return (window as any).Hands;
  }

  // 2. Try dynamic import
  try {
    const mpHands = await import('@mediapipe/hands');
    if ((window as any).Hands) return (window as any).Hands;
    if (mpHands && (mpHands as any).Hands) return (mpHands as any).Hands;
    if (mpHands && (mpHands as any).default && (mpHands as any).default.Hands) {
      return (mpHands as any).default.Hands;
    }
  } catch (err) {
    console.warn('Direct import of @mediapipe/hands failed, using CDN script injection', err);
  }

  // 3. Fallback: dynamically inject official CDN script
  return new Promise((resolve, reject) => {
    if ((window as any).Hands) {
      resolve((window as any).Hands);
      return;
    }

    const scriptId = 'mediapipe-hands-cdn';
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if ((window as any).Hands) resolve((window as any).Hands);
        else reject(new Error('MediaPipe Hands object missing after script load.'));
      });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load MediaPipe CDN.')));
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      if ((window as any).Hands) {
        resolve((window as any).Hands);
      } else {
        reject(new Error('MediaPipe Hands not defined on window.'));
      }
    };
    script.onerror = () => reject(new Error('Could not load MediaPipe Hands from CDN.'));
    document.head.appendChild(script);
  });
}

export class HandTrackerService {
  private videoElement: HTMLVideoElement | null = null;
  private handsInstance: any = null;
  private stream: MediaStream | null = null;
  private isRunning: boolean = false;
  private isProcessingFrame: boolean = false;
  private animationFrameId: number | null = null;
  private callbacks: HandTrackerCallbacks;

  constructor(callbacks: HandTrackerCallbacks) {
    this.callbacks = callbacks;
  }

  public async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    this.callbacks.onStatusChange('initializing');

    try {
      const HandsConstructor = await getMediaPipeHandsConstructor();

      if (!HandsConstructor) {
        throw new Error('MediaPipe Hands module could not be loaded.');
      }

      this.handsInstance = new HandsConstructor({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`;
        },
      });

      this.handsInstance.setOptions({
        maxNumHands: 1,
        modelComplexity: 0, // Lite model for smooth real-time execution
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.handsInstance.onResults((results: HandResults) => {
        if (this.isRunning) {
          this.callbacks.onResults(results);
        }
      });

      this.callbacks.onStatusChange('ready');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initialize MediaPipe Hands';
      console.error('HandTrackerService init error:', err);
      this.callbacks.onError(`Hand Tracking Init: ${message}`);
      this.callbacks.onStatusChange('error');
    }
  }

  public async start(videoElement: HTMLVideoElement): Promise<void> {
    this.videoElement = videoElement;

    // Start video stream first so user immediately sees their face in background!
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: 'user',
        },
        audio: false,
      });

      this.stream = stream;
      this.videoElement.srcObject = stream;
      await this.videoElement.play();

      this.isRunning = true;
      this.callbacks.onStatusChange('ready');

      // Initialize hands model if not ready yet
      if (!this.handsInstance) {
        await this.initialize();
      }

      this.startFrameLoop();
    } catch (err: any) {
      let friendlyMessage = 'Camera access failed.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        friendlyMessage = 'Camera permission required for hand gestures. Please allow camera access in browser.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        friendlyMessage = 'No webcam detected on this device.';
      } else if (err.name === 'NotReadableError') {
        friendlyMessage = 'Webcam is currently in use by another application.';
      } else {
        friendlyMessage = err.message || 'Unable to access camera.';
      }

      console.error('Camera start error:', err);
      this.callbacks.onError(friendlyMessage);
      this.callbacks.onStatusChange('error');
      this.stop();
    }
  }

  private startFrameLoop(): void {
    let frameCount = 0;

    const processLoop = async () => {
      if (!this.isRunning) return;

      frameCount++;

      // Process hands on every frame or alternate frame if busy
      if (
        this.handsInstance &&
        this.videoElement &&
        this.videoElement.readyState >= 2 &&
        !this.videoElement.paused &&
        this.videoElement.videoWidth > 0 &&
        this.videoElement.videoHeight > 0 &&
        !this.isProcessingFrame
      ) {
        this.isProcessingFrame = true;
        try {
          await this.handsInstance.send({ image: this.videoElement });
        } catch (e) {
          // Ignore transient send failures
        } finally {
          this.isProcessingFrame = false;
        }
      }

      if (this.isRunning) {
        this.animationFrameId = requestAnimationFrame(processLoop);
      }
    };

    this.animationFrameId = requestAnimationFrame(processLoop);
  }

  public stop(): void {
    this.isRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.callbacks.onStatusChange('stopped');
  }

  public dispose(): void {
    this.stop();
    if (this.handsInstance && typeof this.handsInstance.close === 'function') {
      try {
        this.handsInstance.close();
      } catch {
        // Safe disposal
      }
    }
    this.handsInstance = null;
  }
}
