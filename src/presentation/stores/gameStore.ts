import { create } from "zustand";
import type { GameMode, MapName } from "@/src/domain/types/room";

interface GameStore {
  gameMode: GameMode;
  mapName: MapName;
  setGameMode: (mode: GameMode) => void;
  setMapName: (map: MapName) => void;
  setGameSettings: (mode: GameMode, map: MapName) => void;
}

/**
 * Game Store
 * Manages current game mode and map settings
 */
export const useGameStore = create<GameStore>((set) => ({
  gameMode: "free_roam",
  mapName: "town_square",

  setGameMode: (mode) => set({ gameMode: mode }),
  
  setMapName: (map) => set({ mapName: map }),
  
  setGameSettings: (mode, map) => set({ gameMode: mode, mapName: map }),
}));
