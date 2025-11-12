import { useRef, useEffect } from "react";

/**
 * Network Interpolation Hook
 * Smoothly interpolates between network updates for better visual experience
 */

interface NetworkState {
  x: number;
  y: number;
  z: number;
  rotation: number;
  timestamp: number;
}

interface InterpolationOptions {
  lerpSpeed?: number; // 0-1, higher = faster interpolation
  rotationLerpSpeed?: number;
}

export function useNetworkInterpolation(
  targetState: NetworkState | null,
  options: InterpolationOptions = {}
) {
  const { lerpSpeed = 0.15, rotationLerpSpeed = 0.2 } = options;

  const currentState = useRef<NetworkState>({
    x: 0,
    y: 0,
    z: 0,
    rotation: 0,
    timestamp: Date.now(),
  });

  const previousState = useRef<NetworkState | null>(null);

  useEffect(() => {
    if (!targetState) return;

    // Store previous state for interpolation
    previousState.current = { ...currentState.current };

    // Update target
    currentState.current = {
      x: lerp(currentState.current.x, targetState.x, lerpSpeed),
      y: lerp(currentState.current.y, targetState.y, lerpSpeed),
      z: lerp(currentState.current.z, targetState.z, lerpSpeed),
      rotation: lerpAngle(
        currentState.current.rotation,
        targetState.rotation,
        rotationLerpSpeed
      ),
      timestamp: targetState.timestamp,
    };
  }, [targetState, lerpSpeed, rotationLerpSpeed]);

  return currentState.current;
}

/**
 * Linear interpolation
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Angle interpolation (handles wrapping around 2π)
 */
function lerpAngle(start: number, end: number, t: number): number {
  // Normalize angles to 0-2π
  start = ((start % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  end = ((end % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

  // Find shortest path
  let diff = end - start;
  if (diff > Math.PI) {
    diff -= Math.PI * 2;
  } else if (diff < -Math.PI) {
    diff += Math.PI * 2;
  }

  return start + diff * t;
}
