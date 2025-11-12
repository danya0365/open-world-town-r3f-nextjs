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
  lastPing: number;
  connectionQuality: "excellent" | "good" | "poor" | "disconnected";
}

interface MultiplayerActions {
  connect: (username: string, options?: {
    create?: boolean;
    roomId?: string;
    roomName?: string;
    maxClients?: number;
    isPrivate?: boolean;
  }) => Promise<void>;
  disconnect: () => Promise<void>;
  sendMove: (position: [number, number, number], rotation: number, isMoving: boolean) => void;
  sendChat: (message: string) => void;
  updateConnectionQuality: () => void;
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
  lastPing: 0,
  connectionQuality: "disconnected",

  // Actions
  connect: async (username: string, options?: {
    create?: boolean;
    roomId?: string;
    roomName?: string;
    maxClients?: number;
    isPrivate?: boolean;
  }) => {
    const state = get();
    
    if (state.isConnected || state.isConnecting) {
      console.warn("Already connected or connecting");
      return;
    }

    set({ isConnecting: true, error: null });

    try {
      console.log("🎮 Connecting to multiplayer server...");

      let room;

      // Join specific room by ID
      if (options?.roomId) {
        room = await colyseusClient.joinRoomById(options.roomId, { username });
      }
      // Create new room
      else if (options?.create) {
        room = await colyseusClient.createRoom("game_room", {
          username,
          roomName: options.roomName,
          maxClients: options.maxClients,
          isPrivate: options.isPrivate,
        });
      }
      // Quick join (join or create)
      else {
        room = await colyseusClient.joinOrCreateRoom("game_room", { username });
      }

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
        lastPing: Date.now(),
        connectionQuality: "excellent",
      });

      // Setup ping interval for connection quality
      const pingInterval = setInterval(() => {
        get().updateConnectionQuality();
      }, 1000);

      // Store interval for cleanup
      (room as any)._pingInterval = pingInterval;

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
      // Clear ping interval
      if ((state.room as any)._pingInterval) {
        clearInterval((state.room as any)._pingInterval);
      }
      
      await state.room.leave();
      set({
        room: null,
        isConnected: false,
        players: new Map(),
        myPlayerId: null,
        lastPing: 0,
        connectionQuality: "disconnected",
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

  updateConnectionQuality: () => {
    const state = get();
    
    if (!state.isConnected || !state.room) {
      set({ connectionQuality: "disconnected" });
      return;
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - state.lastPing;

    // Determine quality based on time since last update
    let quality: "excellent" | "good" | "poor" | "disconnected";
    
    if (timeSinceLastUpdate < 100) {
      quality = "excellent"; // < 100ms
    } else if (timeSinceLastUpdate < 250) {
      quality = "good"; // 100-250ms
    } else if (timeSinceLastUpdate < 500) {
      quality = "poor"; // 250-500ms
    } else {
      quality = "disconnected"; // > 500ms
    }

    set({ 
      lastPing: now,
      connectionQuality: quality 
    });
  },
}));
