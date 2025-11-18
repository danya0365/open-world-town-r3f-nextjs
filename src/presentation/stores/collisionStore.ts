import { create } from "zustand";
import type { BoxCollider, CircleCollider } from "../utils/collision";

export interface Obstacle {
  id: string;
  type: "box" | "circle";
  collider: BoxCollider | CircleCollider;
  name?: string; // Optional name for debugging
}

interface CollisionState {
  obstacles: Obstacle[];
}

interface CollisionActions {
  addObstacle: (obstacle: Obstacle) => void;
  removeObstacle: (id: string) => void;
  clearObstacles: () => void;
  getObstacles: () => Obstacle[];
}

type CollisionStore = CollisionState & CollisionActions;

/**
 * Collision Store using Zustand
 * Manages collision obstacles in the game world
 */
export const useCollisionStore = create<CollisionStore>((set, get) => ({
  // Initial State
  obstacles: [],

  // Actions
  addObstacle: (obstacle) => {
    set((state) => ({
      obstacles: [...state.obstacles, obstacle],
    }));
  },

  removeObstacle: (id) => {
    set((state) => ({
      obstacles: state.obstacles.filter((obs) => obs.id !== id),
    }));
  },

  clearObstacles: () => {
    set({ obstacles: [] });
  },

  getObstacles: () => {
    return get().obstacles;
  },
}));
