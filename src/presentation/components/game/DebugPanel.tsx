"use client";

import { useFrame } from "@react-three/fiber";
import { useState, useRef } from "react";

interface DebugInfo {
  fps: number;
  frameTime: number;
  triangles: number;
  calls: number;
}

/**
 * Debug Panel Component
 * Shows FPS, performance metrics, and debug information
 */
export function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    fps: 0,
    frameTime: 0,
    triangles: 0,
    calls: 0,
  });

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

      setDebugInfo({
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

  return (
    <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg font-mono text-sm space-y-1 min-w-[200px] z-10">
      <div className="text-green-400 font-bold mb-2">Debug Info</div>
      <div className="flex justify-between">
        <span>FPS:</span>
        <span className={debugInfo.fps < 30 ? "text-red-400" : "text-green-400"}>
          {debugInfo.fps}
        </span>
      </div>
      <div className="flex justify-between">
        <span>Frame Time:</span>
        <span>{debugInfo.frameTime}ms</span>
      </div>
      <div className="flex justify-between">
        <span>Triangles:</span>
        <span>{debugInfo.triangles.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Draw Calls:</span>
        <span>{debugInfo.calls}</span>
      </div>
    </div>
  );
}
