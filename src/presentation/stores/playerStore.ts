import { create } from "zustand";
import {
  checkCircleBoxCollision,
  checkCircleCollision,
  resolveCircleBoxCollision,
  resolveCircleCollision,
  type CircleCollider,
  type BoxCollider,
} from "../utils/collision";
import { useCollisionStore } from "./collisionStore";

interface PlayerState {
  position: [number, number, number];
  rotation: number;
  isMoving: boolean;
  speed: number;
  sprintMultiplier: number;
  collisionRadius: number;
  enablePlayerCollision: boolean;
}

interface PlayerActions {
  setPosition: (position: [number, number, number]) => void;
  setRotation: (rotation: number) => void;
  setIsMoving: (isMoving: boolean) => void;
  movePlayer: (direction: [number, number], isSprinting: boolean) => void;
  togglePlayerCollision: () => void;
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
  speed: 5,
  sprintMultiplier: 1.5,
  collisionRadius: 0.4, // Half of player width
  enablePlayerCollision: true,

  // Actions
  setPosition: (position) => set({ position }),

  setRotation: (rotation) => set({ rotation }),

  setIsMoving: (isMoving) => set({ isMoving }),

  movePlayer: (direction: [number, number], isSprinting: boolean = false) => {
    const state = get();
    const speed = isSprinting
      ? state.speed * state.sprintMultiplier
      : state.speed;
    const deltaTime = 1 / 60; // Assume 60 FPS

    const [dx, dz] = direction;
    let newX = state.position[0] + dx * speed * deltaTime;
    let newZ = state.position[2] + dz * speed * deltaTime;

    // Simple boundary collision (world bounds)
    const worldBounds = 50; // Match ground plane size
    newX = Math.max(
      -worldBounds + state.collisionRadius,
      Math.min(worldBounds - state.collisionRadius, newX)
    );
    newZ = Math.max(
      -worldBounds + state.collisionRadius,
      Math.min(worldBounds - state.collisionRadius, newZ)
    );

    // Check collision with obstacles if enabled
    if (state.enablePlayerCollision) {
      const obstacles = useCollisionStore.getState().getObstacles();
      
      // Check collision with each obstacle
      for (const obstacle of obstacles) {
        if (obstacle.type === "box") {
          const boxCollider = obstacle.collider as BoxCollider;
          const playerCircle: CircleCollider = {
            x: newX,
            z: newZ,
            radius: state.collisionRadius,
          };
          
          // Check if collision occurs
          if (checkCircleBoxCollision(playerCircle, boxCollider)) {
            // Resolve collision
            const resolved = resolveCircleBoxCollision(playerCircle, boxCollider);
            newX = resolved.x;
            newZ = resolved.z;
          }
        } else if (obstacle.type === "circle") {
          const circleCollider = obstacle.collider as CircleCollider;
          const playerCircle: CircleCollider = {
            x: newX,
            z: newZ,
            radius: state.collisionRadius,
          };
          
          // Check if collision occurs
          if (checkCircleCollision(playerCircle, circleCollider)) {
            // Resolve collision
            const resolved = resolveCircleCollision(playerCircle, circleCollider);
            newX = resolved.x;
            newZ = resolved.z;
          }
        }
      }
    }

    // Calculate rotation based on movement direction
    if (dx !== 0 || dz !== 0) {
      const newRotation = Math.atan2(dx, dz);
      set({
        position: [newX, state.position[1], newZ],
        rotation: newRotation,
        isMoving: true,
      });
    } else {
      set({ isMoving: false });
    }
  },

  togglePlayerCollision: () =>
    set((state) => ({
      enablePlayerCollision: !state.enablePlayerCollision,
    })),
}));
