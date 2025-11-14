import { create } from "zustand";
import { useGameStore } from "./gameStore";
import type { MapName } from "@/src/domain/types/room";

const DEFAULT_SEAT_COUNT = 5;
const MAX_PENDING_ACTIONS = 120; // ~2s ที่ 60 FPS

export type TableStatus = "open" | "starting" | "in_progress" | "cooldown";

type TableMessageSender = (type: string, payload?: unknown) => void;

export type PokerActionType = "fold" | "bet" | "raise" | "call" | "insurance";

export interface PokerActionPayload {
  action: PokerActionType;
  playerId: string;
  amount?: number;
  seatIndex?: number;
}

export interface SeatState {
  playerId: string | null;
  committedFrame: number;
}

export interface TableSnapshot {
  frameId: number;
  seats: SeatState[];
  status: TableStatus;
  hostId: string | null;
}

interface TableState {
  seats: SeatState[];
  status: TableStatus;
  hostId: string | null;
  isHost: boolean;
  lastAuthoritativeFrame: number;
  localFrame: number;
  focusedSeatIndex: number | null;
  sendMessage: TableMessageSender | null;
  myPlayerId: string | null;
  pendingActions: TableAction[];
}

interface TableActions {
  initialize: (hostId: string | null, seatCount?: number) => void;
  hydrateFromServer: (snapshot: TableSnapshot) => void;
  pushLocalFrame: () => number;
  joinSeat: (seatIndex: number) => void;
  leaveSeat: (seatIndex?: number) => void;
  handleRollback: (snapshot: TableSnapshot) => void;
  applyTableStart: () => void;
  requestTableStart: () => void;
  setFocusedSeat: (seatIndex: number | null) => void;
  setNetworkContext: (context: { myPlayerId: string | null; sendMessage: TableMessageSender | null }) => void;
  sendPokerAction: (payload: PokerActionPayload) => void;
  reset: () => void;
}

type TableStore = TableState & TableActions;

type TableActionType = "join" | "leave";

interface TableAction {
  frameId: number;
  seatIndex: number;
  playerId: string | null;
  type: TableActionType;
}

const buildInitialSeats = (seatCount: number): SeatState[] =>
  Array.from({ length: seatCount }, () => ({ playerId: null, committedFrame: 0 }));

const cloneSeats = (seats: SeatState[]): SeatState[] =>
  seats.map((seat) => ({ playerId: seat.playerId, committedFrame: seat.committedFrame }));

const applyActionsToSeats = (baseSeats: SeatState[], actions: TableAction[]): SeatState[] => {
  const nextSeats = cloneSeats(baseSeats);

  actions
    .slice()
    .sort((a, b) => a.frameId - b.frameId)
    .forEach((action) => {
      const seat = nextSeats[action.seatIndex];
      if (!seat) {
        return;
      }

      switch (action.type) {
        case "join": {
          seat.playerId = action.playerId;
          seat.committedFrame = Math.max(seat.committedFrame, action.frameId);
          break;
        }
        case "leave": {
          if (!action.playerId || seat.playerId === action.playerId) {
            seat.playerId = null;
            seat.committedFrame = Math.max(seat.committedFrame, action.frameId);
          }
          break;
        }
        default:
          break;
      }
    });

  return nextSeats;
};

export const useTableStore = create<TableStore>((set, get) => ({
  seats: buildInitialSeats(DEFAULT_SEAT_COUNT),
  status: "open",
  hostId: null,
  isHost: false,
  lastAuthoritativeFrame: 0,
  localFrame: 0,
  focusedSeatIndex: null,
  sendMessage: null,
  myPlayerId: null,
  pendingActions: [],

  initialize: (hostId, seatCount = DEFAULT_SEAT_COUNT) => {
    const { myPlayerId } = get();
    const initialSeats = buildInitialSeats(seatCount);

    set({
      seats: initialSeats,
      hostId,
      isHost: myPlayerId !== null && hostId === myPlayerId,
      status: "open",
      lastAuthoritativeFrame: 0,
      localFrame: 0,
      focusedSeatIndex: null,
      myPlayerId,
      pendingActions: [],
    });
  },

  hydrateFromServer: (snapshot) => {
    const { myPlayerId, pendingActions } = get();
    const filteredActions = pendingActions.filter((action) => action.frameId > snapshot.frameId);
    const nextSeats = applyActionsToSeats(cloneSeats(snapshot.seats), filteredActions);

    set({
      seats: nextSeats,
      status: snapshot.status,
      hostId: snapshot.hostId,
      isHost: myPlayerId !== null && snapshot.hostId === myPlayerId,
      lastAuthoritativeFrame: snapshot.frameId,
      pendingActions: filteredActions.slice(-MAX_PENDING_ACTIONS),
    });
  },

  pushLocalFrame: () => {
    const { localFrame } = get();
    const nextFrame = localFrame + 1;

    set({ localFrame: nextFrame });
    return nextFrame;
  },

  joinSeat: (seatIndex) => {
    const state = get();
    const { sendMessage, myPlayerId } = state;
    if (!sendMessage || !myPlayerId) {
      return;
    }

    const seat = state.seats[seatIndex];
    if (!seat) {
      return;
    }

    if (seat.playerId !== null) {
      return; // ที่นั่งถูกจับจองแล้ว
    }

    const frameId = get().pushLocalFrame();

    set((prev) => {
      const nextSeats = prev.seats.map((s, idx) =>
        idx === seatIndex ? { playerId: myPlayerId, committedFrame: frameId } : s
      );

      const nextPending = [...prev.pendingActions, {
        frameId,
        seatIndex,
        playerId: myPlayerId,
        type: "join" as const,
      }].slice(-MAX_PENDING_ACTIONS);

      return { seats: nextSeats, pendingActions: nextPending, localFrame: frameId };
    });

    sendMessage("table_join", { seatIndex, frameId });
  },

  leaveSeat: (seatIndex) => {
    const state = get();
    const { sendMessage, myPlayerId } = state;
    if (!sendMessage || !myPlayerId) {
      return;
    }

    const resolvedIndex =
      typeof seatIndex === "number"
        ? seatIndex
        : state.seats.findIndex((seat) => seat.playerId === myPlayerId);

    if (resolvedIndex < 0) {
      return;
    }

    const frameId = get().pushLocalFrame();

    set((prev) => {
      const nextSeats = prev.seats.map((seat, idx) =>
        idx === resolvedIndex ? { playerId: null, committedFrame: frameId } : seat
      );
      const nextPending = [...prev.pendingActions, {
        frameId,
        seatIndex: resolvedIndex,
        playerId: myPlayerId,
        type: "leave" as const,
      }].slice(-MAX_PENDING_ACTIONS);

      return { seats: nextSeats, pendingActions: nextPending, localFrame: frameId };
    });

    sendMessage("table_leave", { seatIndex: resolvedIndex, frameId });
  },

  handleRollback: (snapshot) => {
    const { myPlayerId, pendingActions } = get();
    const filteredActions = pendingActions.filter((action) => action.frameId > snapshot.frameId);
    const nextSeats = applyActionsToSeats(cloneSeats(snapshot.seats), filteredActions);

    set({
      seats: nextSeats,
      status: snapshot.status,
      hostId: snapshot.hostId,
      lastAuthoritativeFrame: snapshot.frameId,
      localFrame: snapshot.frameId,
      isHost: myPlayerId !== null && snapshot.hostId === myPlayerId,
      pendingActions: filteredActions.slice(-MAX_PENDING_ACTIONS),
    });
  },

  applyTableStart: () => {
    set({ status: "in_progress" });
    const { setGameSettings } = useGameStore.getState();
    const mapName: MapName = "caribbean_poker";
    setGameSettings("custom", mapName);
  },

  requestTableStart: () => {
    const { isHost, seats, status, sendMessage } = get();
    if (!isHost || status !== "open") {
      return;
    }

    const allOccupied = seats.every((seat) => seat.playerId);
    if (!allOccupied) {
      return;
    }

    if (!sendMessage) {
      return;
    }

    sendMessage("table_start");
  },

  setFocusedSeat: (seatIndex) => {
    set((state) =>
      state.focusedSeatIndex === seatIndex ? state : { focusedSeatIndex: seatIndex }
    );
  },

  setNetworkContext: ({ myPlayerId, sendMessage }) => {
    set((state) => ({
      myPlayerId,
      sendMessage,
      isHost: myPlayerId !== null && state.hostId === myPlayerId,
    }));
  },

  sendPokerAction: (payload) => {
    const { sendMessage } = get();
    if (!sendMessage) {
      return;
    }

    sendMessage("poker_player_action", payload);
  },

  reset: () => {
    set({
      seats: buildInitialSeats(DEFAULT_SEAT_COUNT),
      status: "open",
      hostId: null,
      isHost: false,
      lastAuthoritativeFrame: 0,
      localFrame: 0,
      focusedSeatIndex: null,
      sendMessage: null,
      myPlayerId: null,
      pendingActions: [],
    });
  },
}));
