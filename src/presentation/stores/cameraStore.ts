import { create } from "zustand";

export type CameraMode = "top-down" | "isometric" | "third-person";

interface CameraStore {
  mode: CameraMode;
  setMode: (mode: CameraMode) => void;
  cycleMode: () => void;
}

const CAMERA_MODES: CameraMode[] = ["top-down", "isometric", "third-person"];

export const useCameraStore = create<CameraStore>((set, get) => ({
  mode: "top-down",

  setMode: (mode: CameraMode) => {
    set({ mode });
  },

  cycleMode: () => {
    const currentMode = get().mode;
    const currentIndex = CAMERA_MODES.indexOf(currentMode);
    const nextIndex = (currentIndex + 1) % CAMERA_MODES.length;
    set({ mode: CAMERA_MODES[nextIndex] });
  },
}));
