import React from 'react';
import { GestureState } from '@/types/architecture';

interface GestureStatusProps {
  gestureState: GestureState;
  isTracking: boolean;
}

export const GestureStatus: React.FC<GestureStatusProps> = ({
  gestureState,
  isTracking,
}) => {
  const getGestureLabel = () => {
    if (!isTracking) {
      return {
        title: 'CAMERA READY',
        color: 'text-slate-400 border-slate-700 bg-slate-900/60',
      };
    }

    if (!gestureState.handDetected) {
      return {
        title: 'AWAITING HAND',
        color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      };
    }

    switch (gestureState.gesture) {
      case 'PINCH':
        return {
          title: 'ROTATE ARCHITECTURE',
          color: 'text-cyan-300 border-cyan-400/50 bg-cyan-500/20',
        };
      case 'OPEN_PALM':
        return {
          title: 'EXPLODED VIEW',
          color: 'text-purple-300 border-purple-400/50 bg-purple-500/20',
        };
      case 'POINT':
        return {
          title: 'EXPLAIN COMPONENT',
          color: 'text-blue-300 border-blue-400/50 bg-blue-500/20',
        };
      case 'TWO_FINGER':
        return {
          title: 'DETAIL VIEW',
          color: 'text-emerald-300 border-emerald-400/50 bg-emerald-500/20',
        };
      case 'SWIPE_LEFT':
        return {
          title: 'PREVIOUS LAYER',
          color: 'text-emerald-300 border-emerald-400/50 bg-emerald-500/20',
        };
      case 'SWIPE_RIGHT':
        return {
          title: 'NEXT LAYER',
          color: 'text-emerald-300 border-emerald-400/50 bg-emerald-500/20',
        };
      default:
        return {
          title: 'HAND DETECTED',
          color: 'text-blue-300 border-blue-400/40 bg-blue-500/10',
        };
    }
  };

  const status = getGestureLabel();

  return (
    <div className="flex flex-col gap-1 backdrop-blur-xl bg-[#070c18d0] border border-slate-800 p-2.5 rounded-xl shadow-2xl min-w-[170px] font-serif">
      <div className="flex items-center justify-between text-[11px] tracking-wider text-slate-400">
        <span className="font-bold">HAND TRACKING</span>
        <span className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isTracking && gestureState.handDetected
                ? 'bg-emerald-400 animate-pulse'
                : isTracking
                ? 'bg-amber-400'
                : 'bg-slate-600'
            }`}
          />
          <span className="text-[10px]">
            {gestureState.handDetected ? `${Math.round(gestureState.confidence * 100)}%` : 'OFF'}
          </span>
        </span>
      </div>

      <div
        className={`px-2.5 py-1 rounded border text-xs font-bold tracking-wide text-center transition-all duration-200 ${status.color}`}
      >
        {status.title}
      </div>

      {gestureState.trackingMessage && (
        <div className="text-[10px] text-slate-400 truncate text-center">
          {gestureState.trackingMessage}
        </div>
      )}
    </div>
  );
};
