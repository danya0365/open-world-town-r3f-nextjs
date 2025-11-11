import { create } from "zustand";

interface PlayerState {
  position: [number, number, number];
  rotation: number;
  isMoving: boolean;
  speed: number;
  sprintMultiplier: number;
}

interface PlayerActions {
  setPosition: (position: [number, number, number]) => void;
  setRotation: (rotation: number) => void;
  setIsMoving: (isMoving: boolean) => void;
  movePlayer: (direction: [number, number], isSprinting: boolean) => void;
}

type PlayerStore = PlayerState & PlayerActions;

/**
 * Player Store using Zustand
 * Manages player state for the game
 */
export const usePlayerStore = create<PlayerStore>((set, get) => ({
  // Initial State
  position: [0, 0, 0],
  rotation: 0,
  isMoving: false,
  speed: 3,
  sprintMultiplier: 1.5,

  // Actions
  setPosition: (position) => set({ position }),

  setRotation: (rotation) => set({ rotation }),

  setIsMoving: (isMoving) => set({ isMoving }),

  movePlayer: (direction, isSprinting) => {
    const state = get();
    const speed = isSprinting
      ? state.speed * state.sprintMultiplier
      : state.speed;

    const [dx, dz] = direction;
    const [x, y, z] = state.position;

    // Calculate new position
    const newX = x + dx * speed * 0.016; // Assuming 60 FPS
    const newZ = z + dz * speed * 0.016;

    // Calculate rotation based on movement direction
    if (dx !== 0 || dz !== 0) {
      const rotation = Math.atan2(dx, dz);
      set({
        position: [newX, y, newZ],
        rotation,
        isMoving: true,
      });
    } else {
      set({ isMoving: false });
    }
  },
}));
