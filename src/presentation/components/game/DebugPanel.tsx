"use client";

import { useDebugStore } from "@/src/presentation/stores/debugStore";

/**
 * Debug Panel Component (Outside Canvas)
 * Displays FPS, performance metrics, and debug information
 * Gets data from DebugStats component inside Canvas via Zustand store
 */
export function DebugPanel() {
  const debugInfo = useDebugStore((state) => state.debugInfo);

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
