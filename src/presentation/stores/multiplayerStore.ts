import { create } from "zustand";
import type { Room } from "colyseus.js";
import { colyseusClient } from "@/src/infrastructure/multiplayer/ColyseusClient";

interface PlayerData {
  id: string;
  username: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  isMoving: boolean;
}

interface MultiplayerState {
  room: Room | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  players: Map<string, PlayerData>;
  myPlayerId: string | null;
}

interface MultiplayerActions {
  connect: (username: string) => Promise<void>;
  disconnect: () => Promise<void>;
  sendMove: (position: [number, number, number], rotation: number, isMoving: boolean) => void;
  sendChat: (message: string) => void;
}

type MultiplayerStore = MultiplayerState & MultiplayerActions;

/**
 * Multiplayer Store using Zustand
 * Manages Colyseus connection and multiplayer state
 */
export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  // Initial State
  room: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  players: new Map(),
  myPlayerId: null,

  // Actions
  connect: async (username: string) => {
    const state = get();
    
    if (state.isConnected || state.isConnecting) {
      console.warn("Already connected or connecting");
      return;
    }

    set({ isConnecting: true, error: null });

    try {
      // Join or create a game room
      const room = await colyseusClient.joinOrCreateRoom("game_room", {
        username,
      });

      // Setup room event handlers
      room.onStateChange((state) => {
        const playersMap = new Map<string, PlayerData>();
        
        state.players.forEach((player: any, key: string) => {
          playersMap.set(key, {
            id: player.id,
            username: player.username,
            x: player.x,
            y: player.y,
            z: player.z,
            rotation: player.rotation,
            isMoving: player.isMoving,
          });
        });

        set({ players: playersMap });
      });

      room.onMessage("player_joined", (message) => {
        console.log("Player joined:", message);
      });

      room.onMessage("player_left", (message) => {
        console.log("Player left:", message);
      });

      room.onMessage("chat", (message) => {
        console.log("Chat message:", message);
      });

      room.onError((code, message) => {
        console.error("Room error:", code, message);
        set({ error: `Room error: ${message}` });
      });

      room.onLeave((code) => {
        console.log("Left room with code:", code);
        set({
          room: null,
          isConnected: false,
          players: new Map(),
          myPlayerId: null,
        });
      });

      set({
        room,
        isConnected: true,
        isConnecting: false,
        myPlayerId: room.sessionId,
      });

      console.log("✅ Connected to multiplayer room:", room.id);
    } catch (error) {
      console.error("❌ Failed to connect:", error);
      set({
        isConnecting: false,
        error: error instanceof Error ? error.message : "Failed to connect",
      });
    }
  },

  disconnect: async () => {
    const state = get();
    
    if (state.room) {
      await state.room.leave();
      set({
        room: null,
        isConnected: false,
        players: new Map(),
        myPlayerId: null,
      });
    }
  },

  sendMove: (position: [number, number, number], rotation: number, isMoving: boolean) => {
    const state = get();
    
    if (state.room && state.isConnected) {
      state.room.send("move", {
        x: position[0],
        y: position[1],
        z: position[2],
        rotation,
        isMoving,
      });
    }
  },

  sendChat: (message: string) => {
    const state = get();
    
    if (state.room && state.isConnected) {
      state.room.send("chat", {
        text: message,
      });
    }
  },
}));
