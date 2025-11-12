"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useDebugStore } from "@/src/presentation/stores/debugStore";

/**
 * Debug Stats Component (Inside Canvas)
 * Collects performance stats using useFrame and updates debug store
 * This component doesn't render anything - it just collects data
 */
export function DebugStats() {
  const updateDebugInfo = useDebugStore((state) => state.updateDebugInfo);
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsUpdateInterval = useRef(0);

  useFrame((state) => {
    frameCount.current++;
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime.current;
    fpsUpdateInterval.current += deltaTime;

    // Update FPS every 500ms
    if (fpsUpdateInterval.current >= 500) {
      const fps = Math.round((frameCount.current * 1000) / fpsUpdateInterval.current);
      const frameTime = fpsUpdateInterval.current / frameCount.current;

      updateDebugInfo({
        fps,
        frameTime: Math.round(frameTime * 100) / 100,
        triangles: state.gl.info.render.triangles,
        calls: state.gl.info.render.calls,
      });

      frameCount.current = 0;
      fpsUpdateInterval.current = 0;
    }

    lastTime.current = currentTime;
  });

  // This component doesn't render anything
  return null;
}
