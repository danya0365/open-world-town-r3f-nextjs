import { create } from "zustand";

interface DebugInfo {
  fps: number;
  frameTime: number;
  triangles: number;
  calls: number;
}

interface DebugState {
  debugInfo: DebugInfo;
}

interface DebugActions {
  updateDebugInfo: (info: DebugInfo) => void;
}

type DebugStore = DebugState & DebugActions;

/**
 * Debug Store using Zustand
 * Stores debug information from inside Canvas for display outside
 */
export const useDebugStore = create<DebugStore>((set) => ({
  debugInfo: {
    fps: 0,
    frameTime: 0,
    triangles: 0,
    calls: 0,
  },

  updateDebugInfo: (info) => set({ debugInfo: info }),
}));
