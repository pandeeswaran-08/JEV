import { useCallback, useEffect, useRef, useState } from 'react';
import { GestureDetector } from '@/gesture/gestureDetector';
import { HandTrackerService } from '@/gesture/handTracking';
import { GestureState } from '@/types/architecture';

const INITIAL_GESTURE_STATE: GestureState = {
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
  rotationX: 0,
  rotationY: 0,
  timestamp: 0,
  pinchDistance: 1.0,
  isTracking: false,
  trackingMessage: 'Camera initializing...',
};

export function useHandTracking() {
  const [gestureState, setGestureState] = useState<GestureState>(INITIAL_GESTURE_STATE);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [status, setStatus] = useState<'initializing' | 'ready' | 'stopped' | 'error'>('stopped');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<GestureDetector | null>(null);
  const trackerServiceRef = useRef<HandTrackerService | null>(null);

  if (!detectorRef.current) {
    detectorRef.current = new GestureDetector();
  }

  const handleResults = useCallback((results: any) => {
    if (!detectorRef.current) return;
    const state = detectorRef.current.processLandmarks(results);
    setGestureState(state);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setCameraError(errorMessage);
    setIsTracking(false);
  }, []);

  const handleStatusChange = useCallback((newStatus: 'initializing' | 'ready' | 'stopped' | 'error') => {
    setStatus(newStatus);
    if (newStatus === 'ready') {
      setIsTracking(true);
      setCameraError(null);
    } else if (newStatus === 'stopped' || newStatus === 'error') {
      setIsTracking(false);
    }
  }, []);

  const startTracking = useCallback(async () => {
    if (!videoRef.current) return;
    setCameraError(null);

    if (!trackerServiceRef.current) {
      trackerServiceRef.current = new HandTrackerService({
        onResults: handleResults,
        onError: handleError,
        onStatusChange: handleStatusChange,
      });
    }

    await trackerServiceRef.current.start(videoRef.current);
  }, [handleResults, handleError, handleStatusChange]);

  const stopTracking = useCallback(() => {
    if (trackerServiceRef.current) {
      trackerServiceRef.current.stop();
    }
    setIsTracking(false);
    setGestureState((prev) => ({
      ...INITIAL_GESTURE_STATE,
      trackingMessage: 'Camera paused',
    }));
  }, []);

  const toggleTracking = useCallback(() => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  }, [isTracking, startTracking, stopTracking]);

  const resetRotation = useCallback(() => {
    if (detectorRef.current) {
      detectorRef.current.resetRotation();
    }
    setGestureState((prev) => ({
      ...prev,
      rotationX: 0,
      rotationY: 0,
    }));
  }, []);

  // Auto-start camera on mount so user's face is immediately visible in background!
  useEffect(() => {
    const timer = setTimeout(() => {
      startTracking();
    }, 400);

    return () => clearTimeout(timer);
  }, [startTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trackerServiceRef.current) {
        trackerServiceRef.current.dispose();
        trackerServiceRef.current = null;
      }
    };
  }, []);

  return {
    videoRef,
    gestureState,
    isTracking,
    status,
    cameraError,
    startTracking,
    stopTracking,
    toggleTracking,
    resetRotation,
  };
}
