import {
  type GameRoomState,
  type RoomJoinOptions,
  type MultiplayerPlayerState,
} from "@/src/domain/types/multiplayer";
import type { GameMode, MapName } from "@/src/domain/types/room";
import {
  colyseusClient,
  type AvailableRoom,
} from "@/src/infrastructure/multiplayer/ColyseusClient";
import type { Room } from "colyseus.js";
import { create } from "zustand";
import { useGameStore } from "./gameStore";
import { useTableStore, type TableSnapshot } from "./tableStore";
import { usePokerRoundStore, type PokerRoundServerPayload } from "./pokerRoundStore";
import type { PokerActionType } from "./tableStore";

interface PlayerData {
  id: string;
  username: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  isMoving: boolean;
}

interface MultiplayerPlayer {
  id: string;
  username: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  isMoving: boolean;
  timestamp: number;
}

interface MultiplayerNPC {
  id: string;
  name: string;
  type: string;
  behavior: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  speed: number;
  health: number;
  maxHealth: number;
  isInteractable: boolean;
}

interface ServerNPCState {
  name: string;
  type: string;
  behavior: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  speed: number;
  health: number;
  maxHealth: number;
  isInteractable: boolean;
}

interface MultiplayerState {
  room: Room<GameRoomState> | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  players: Map<string, PlayerData>;
  npcs: Map<string, MultiplayerNPC>;
  myPlayerId: string | null;
  lastPing: number;
  connectionQuality: "excellent" | "good" | "poor" | "disconnected";
  availableRooms: AvailableRoom[];
  isFetchingRooms: boolean;
}

interface ConnectOptions {
  create?: boolean;
  roomId?: string;
  roomName?: string;
  maxClients?: number;
  isPrivate?: boolean;
  additionalOptions?: Omit<
    RoomJoinOptions,
    "username" | "roomName" | "maxClients" | "isPrivate"
  >;
}

interface MultiplayerActions {
  connect: (username: string, options?: ConnectOptions) => Promise<void>;
  disconnect: () => Promise<void>;
  sendMove: (
    position: [number, number, number],
    rotation: number,
    isMoving: boolean
  ) => void;
  sendChat: (message: string) => void;
  updateConnectionQuality: () => void;
  fetchRooms: (roomName?: string) => Promise<void>;
}

type MultiplayerStore = MultiplayerState & MultiplayerActions;

interface PokerActionAckPayload {
  success: boolean;
  action?: string;
  amount?: number;
  reason?: string;
}

/**
 * Multiplayer Store using Zustand
 * Manages Colyseus connection and multiplayer state
 */
export const useMultiplayerStore = create<MultiplayerStore>((set, get) => {
  // Store reference globally for collision detection
  if (typeof window !== "undefined") {
    (
      window as typeof window & {
        __multiplayerStore?: { getState: typeof get };
      }
    ).__multiplayerStore = { getState: get };
  }

  return {
    // Initial State
    room: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    players: new Map(),
    npcs: new Map(),
    myPlayerId: null,
    lastPing: 0,
    connectionQuality: "disconnected",
    availableRooms: [],
    isFetchingRooms: false,

    // Actions
    connect: async (username: string, options?: ConnectOptions) => {
      const state = get();

      if (state.isConnected || state.isConnecting) {
        console.warn("Already connected or connecting");
        return;
      }

      set({ isConnecting: true, error: null });

      try {
        console.log("🎮 Connecting to multiplayer server...");

        const {
          roomId,
          create: shouldCreate,
          roomName,
          maxClients,
          isPrivate,
          additionalOptions,
        } = options ?? {};

        const desiredGameMode = additionalOptions?.mode as GameMode | undefined;
        const desiredMapName = additionalOptions?.mapName as MapName | undefined;

        const joinOptions: RoomJoinOptions = {
          username,
          ...(roomName ? { roomName } : {}),
          ...(typeof maxClients === "number" ? { maxClients } : {}),
          ...(typeof isPrivate === "boolean" ? { isPrivate } : {}),
          ...(additionalOptions ?? {}),
        };

        let room: Room<GameRoomState>;

        if (roomId) {
          room = await colyseusClient.joinRoomById(roomId, joinOptions);
        } else if (shouldCreate) {
          room = await colyseusClient.createRoom("game_room", joinOptions);
        } else {
          room = await colyseusClient.joinOrCreateRoom(
            "game_room",
            joinOptions
          );
        }

        if (shouldCreate && desiredGameMode && desiredMapName) {
          useGameStore.getState().setGameSettings(desiredGameMode, desiredMapName);
        } else if (shouldCreate && desiredMapName) {
          useGameStore.getState().setMapName(desiredMapName);
        }

        // Set game settings from room metadata
        const roomWithMetadata = room as Room<GameRoomState> & {
          metadata?: Record<string, unknown>;
        };

        if (roomWithMetadata.metadata) {
          const gameMode = roomWithMetadata.metadata.mode as
            | GameMode
            | undefined;
          const mapName = roomWithMetadata.metadata.mapName as
            | MapName
            | undefined;

          if (gameMode && mapName) {
            useGameStore.getState().setGameSettings(gameMode, mapName);
          } else if (mapName) {
            useGameStore.getState().setMapName(mapName);
          } else if (shouldCreate && desiredMapName) {
            useGameStore.getState().setMapName(desiredMapName);
          }
        }

        // Setup room event handlers
        room.onStateChange((state: GameRoomState) => {
          const newPlayers = new Map<string, MultiplayerPlayer>();
          const newNPCs = new Map<string, MultiplayerNPC>();

          state.players.forEach((player: MultiplayerPlayerState, playerId: string) => {
            newPlayers.set(playerId, {
              id: playerId,
              username: player.username,
              x: player.x,
              y: player.y,
              z: player.z,
              rotation: player.rotation,
              isMoving: player.isMoving,
              timestamp: player.timestamp || Date.now(),
            });
          });

          // Sync NPCs from server
          state.npcs?.forEach((npc: ServerNPCState, npcId: string) => {
            newNPCs.set(npcId, {
              id: npcId,
              name: npc.name,
              type: npc.type,
              behavior: npc.behavior,
              x: npc.x,
              y: npc.y,
              z: npc.z,
              rotation: npc.rotation,
              speed: npc.speed,
              health: npc.health,
              maxHealth: npc.maxHealth,
              isInteractable: npc.isInteractable,
            });
          });

          set({ players: newPlayers, npcs: newNPCs });
        });

        const sendTableMessage = (type: string, payload?: unknown) => {
          room.send(type, payload);
        };

        useTableStore
          .getState()
          .setNetworkContext({
            myPlayerId: room.sessionId,
            sendMessage: sendTableMessage,
          });

        room.send("table_sync_request");
        room.send("poker_phase_request");

        room.onMessage<TableSnapshot>("table_state_sync", (snapshot) => {
          useTableStore.getState().hydrateFromServer(snapshot);
        });

        room.onMessage<TableSnapshot>("table_rollback", (snapshot) => {
          useTableStore.getState().handleRollback(snapshot);
        });

        room.onMessage("table_started", () => {
          useTableStore.getState().applyTableStart();
        });

        room.onMessage("table_start_denied", (payload: { reason?: string }) => {
          console.warn("Table start denied", payload?.reason);
        });

        room.onMessage<PokerRoundServerPayload>("poker_state_update", (payload) => {
          if (!payload) {
            return;
          }

          const pokerStore = usePokerRoundStore.getState();
          const safePhase = payload.phase ?? pokerStore.phase;
          const safeDealerSeed =
            typeof payload.dealerSeed === "number" && Number.isFinite(payload.dealerSeed)
              ? payload.dealerSeed
              : pokerStore.dealerSeed;

          pokerStore.hydrateFromServer({
            phase: safePhase,
            dealerSeed: safeDealerSeed,
            winningPlayerIds: payload.winningPlayerIds,
            playerBets: payload.playerBets,
            community: payload.community,
            lastUpdateFrame: payload.lastUpdateFrame,
            lastAction: payload.lastAction ?? null,
            potTotal: payload.potTotal,
            nextRoundStartAt: payload.nextRoundStartAt,
          });
        });

        room.onMessage<PokerActionAckPayload>("poker_action_ack", (payload) => {
          const pokerStore = usePokerRoundStore.getState();
          if (!payload) {
            pokerStore.setActionFeedback(null);
            return;
          }

          const actionLabel = payload.action
            ? (payload.action.toLowerCase() as PokerActionType)
            : undefined;

          const message = payload.success
            ? actionLabel
              ? `🎯 ส่งคำสั่ง ${actionLabel} แล้ว`
              : "🎯 ส่งคำสั่งแล้ว"
            : `⚠️ ${payload.reason ?? "ทำรายการไม่สำเร็จ"}`;

          pokerStore.setActionFeedback(message);
        });

        room.onError((code, message) => {
          console.error("Room error:", code, message);
          set({ error: `Room error: ${message}` });
        });

        room.onLeave(() => {
          console.log("👋 Left room");
          useTableStore.getState().reset();
          usePokerRoundStore.getState().resetRound();
          set({
            isConnected: false,
            room: null,
            myPlayerId: null,
            players: new Map(),
            npcs: new Map(),
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
        (
          room as Room<GameRoomState> & { _pingInterval?: NodeJS.Timeout }
        )._pingInterval = pingInterval;

        console.log("✅ Connected to multiplayer room:", room.roomId);
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
        const activeRoom = state.room as Room<GameRoomState> & {
          _pingInterval?: NodeJS.Timeout;
        };

        if (activeRoom._pingInterval) {
          clearInterval(activeRoom._pingInterval);
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

    sendMove: (
      position: [number, number, number],
      rotation: number,
      isMoving: boolean
    ) => {
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
        connectionQuality: quality,
      });
    },

    fetchRooms: async (roomName = "game_room") => {
      set({ isFetchingRooms: true });

      try {
        const rooms = await colyseusClient.getAvailableRooms(roomName);
        set({ availableRooms: rooms, isFetchingRooms: false });
      } catch (error) {
        console.error("❌ Failed to fetch available rooms:", error);
        set({ availableRooms: [], isFetchingRooms: false });
      }
    },
  };
});
