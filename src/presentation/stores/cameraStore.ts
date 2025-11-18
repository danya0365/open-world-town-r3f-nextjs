import { create } from "zustand";

export type CameraMode = "top-down" | "isometric" | "third-person" | "dragon-quest";

interface CameraStore {
  mode: CameraMode;
  setMode: (mode: CameraMode) => void;
  cycleMode: () => void;
  
  // Third-person mode specific state
  thirdPersonAngle: number; // Smooth rotation angle
  rotateThirdPersonCamera: (delta: number) => void; // Smooth rotation
  
  // Dragon Quest mode specific state
  dragonQuestAngle: number; // Angle in radians (0, π/4, π/2, 3π/4, π, 5π/4, 3π/2, 7π/4)
  dragonQuestDistance: number; // Zoom distance
  rotateDragonQuestCamera: (direction: "left" | "right") => void;
  zoomDragonQuestCamera: (direction: "in" | "out") => void;
}

const CAMERA_MODES: CameraMode[] = ["top-down", "isometric", "third-person", "dragon-quest"];

export const useCameraStore = create<CameraStore>((set, get) => ({
  mode: "top-down",
  
  // Third-person initial state
  thirdPersonAngle: 0, // Start facing north
  
  // Dragon Quest initial state
  dragonQuestAngle: 0, // Start facing north
  dragonQuestDistance: 8, // Default distance

  setMode: (mode: CameraMode) => {
    set({ mode });
  },

  cycleMode: () => {
    const currentMode = get().mode;
    const currentIndex = CAMERA_MODES.indexOf(currentMode);
    const nextIndex = (currentIndex + 1) % CAMERA_MODES.length;
    set({ mode: CAMERA_MODES[nextIndex] });
  },
  
  rotateThirdPersonCamera: (delta: number) => {
    const currentAngle = get().thirdPersonAngle;
    const newAngle = currentAngle + delta;
    set({ thirdPersonAngle: newAngle });
  },
  
  rotateDragonQuestCamera: (direction: "left" | "right") => {
    const currentAngle = get().dragonQuestAngle;
    const step = Math.PI / 4; // 45 degrees
    const rawAngle = direction === "left"
      ? currentAngle + step
      : currentAngle - step;
    const fullCircle = Math.PI * 2;
    const normalizedAngle = ((rawAngle % fullCircle) + fullCircle) % fullCircle;
    set({ dragonQuestAngle: normalizedAngle });
  },
  
  zoomDragonQuestCamera: (direction: "in" | "out") => {
    const currentDistance = get().dragonQuestDistance;
    const step = 1;
    const minDistance = 4;
    const maxDistance = 15;
    const newDistance = direction === "in" 
      ? Math.max(minDistance, currentDistance - step)
      : Math.min(maxDistance, currentDistance + step);
    set({ dragonQuestDistance: newDistance });
  },
}));
