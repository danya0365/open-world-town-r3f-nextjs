import { create } from "zustand";
import type { PokerActionType } from "./tableStore";

export type PokerPhase =
  | "waiting"
  | "ante"
  | "deal_player"
  | "deal_dealer"
  | "betting"
  | "reveal"
  | "payout";

type SuitSymbol = "♠" | "♥" | "♦" | "♣" | "?";

type Card = {
  rank: string;
  suit: SuitSymbol;
};

const toCard = (raw: string): Card => {
  if (!raw || raw === "??") {
    return { rank: "?", suit: "?" };
  }

  const suit = raw.slice(-1) as SuitSymbol;
  const rank = raw.slice(0, raw.length - 1);
  return { rank, suit };
};

interface CommunityCards {
  dealerHand: Card[];
  playerHands: Record<string, Card[]>;
}

interface BetState {
  ante: number;
  bet: number;
  insurance: number;
}

interface PlayerBetState extends BetState {
  hasFolded: boolean;
}

interface PokerRoundState {
  phase: PokerPhase;
  dealerSeed: number;
  community: CommunityCards;
  playerBets: Record<string, PlayerBetState>;
  winningPlayerIds: string[];
  lastAction: { playerId: string; action: PokerActionType; amount?: number } | null;
  lastActionFeedback: string | null;
  potTotal: number;
  nextRoundStartAt: number | null;
}

interface PokerRoundActions {
  resetRound: () => void;
  setPhase: (phase: PokerPhase) => void;
  updatePlayerBet: (playerId: string, bets: Partial<PlayerBetState>) => void;
  setCommunityCards: (cards: Partial<CommunityCards>) => void;
  setDealerSeed: (seed: number) => void;
  setWinners: (playerIds: string[]) => void;
  hydrateFromServer: (payload: PokerRoundServerPayload) => void;
  markPhaseAcknowledged: () => void;
  setLastAction: (action: PokerRoundState["lastAction"]) => void;
  setActionFeedback: (message: string | null) => void;
  setPotTotal: (total: number) => void;
  setNextRoundStartAt: (timestamp: number | null) => void;
}

interface ServerCommunityCardsPayload {
  dealerHand?: string[];
  playerHands?: Record<string, { cards: string[] }>;
}

export interface PokerRoundServerPayload {
  phase: PokerPhase;
  dealerSeed: number;
  winningPlayerIds?: string[];
  playerBets?: Record<string, PlayerBetState>;
  community?: ServerCommunityCardsPayload;
  lastUpdateFrame?: number;
  lastAction?: { playerId: string; action: PokerActionType; amount?: number } | null;
  potTotal?: number;
  nextRoundStartAt?: number | null;
}

type PokerRoundStore = PokerRoundState & PokerRoundActions;

const buildInitialState = (): PokerRoundState => ({
  phase: "waiting",
  dealerSeed: 0,
  community: {
    dealerHand: [],
    playerHands: {},
  },
  playerBets: {},
  winningPlayerIds: [],
  lastAction: null,
  lastActionFeedback: null,
  potTotal: 0,
  nextRoundStartAt: null,
});

export const usePokerRoundStore = create<PokerRoundStore>((set) => ({
  ...buildInitialState(),

  resetRound: () => set(buildInitialState()),

  setPhase: (phase) => set({ phase }),

  updatePlayerBet: (playerId, bets) => {
    set((state) => ({
      playerBets: {
        ...state.playerBets,
        [playerId]: {
          ante: state.playerBets[playerId]?.ante ?? 0,
          bet: state.playerBets[playerId]?.bet ?? 0,
          insurance: state.playerBets[playerId]?.insurance ?? 0,
          hasFolded: state.playerBets[playerId]?.hasFolded ?? false,
          ...bets,
        },
      },
    }));
  },

  setCommunityCards: (cards) => {
    set((state) => ({
      community: {
        dealerHand: cards.dealerHand ?? state.community.dealerHand,
        playerHands: cards.playerHands
          ? { ...state.community.playerHands, ...cards.playerHands }
          : state.community.playerHands,
      },
    }));
  },

  setDealerSeed: (seed) => set({ dealerSeed: seed }),

  setWinners: (playerIds) => set({ winningPlayerIds: playerIds }),

  hydrateFromServer: (payload) => {
    set((state) => {
      const nextCommunity: CommunityCards = {
        dealerHand: state.community.dealerHand,
        playerHands: state.community.playerHands,
      };

      if (payload.community) {
        if (typeof payload.community.dealerHand !== "undefined") {
          nextCommunity.dealerHand = payload.community.dealerHand.map(toCard);
        }

        if (typeof payload.community.playerHands !== "undefined") {
          const rebuiltHands: Record<string, Card[]> = {};
          Object.entries(payload.community.playerHands).forEach(([playerId, handPayload]) => {
            rebuiltHands[playerId] = handPayload.cards.map(toCard);
          });
          nextCommunity.playerHands = rebuiltHands;
        }
      }

      const hasNextRoundTimestamp =
        typeof payload.nextRoundStartAt === "number" && Number.isFinite(payload.nextRoundStartAt);

      const nextPhase = payload.phase ?? state.phase;
      const nextLastAction =
        typeof payload.lastAction === "undefined" ? null : payload.lastAction ?? null;
      const shouldClearFeedback =
        nextPhase !== state.phase || nextLastAction === null || hasNextRoundTimestamp;

      return {
        phase: nextPhase,
        dealerSeed: payload.dealerSeed ?? state.dealerSeed,
        winningPlayerIds: payload.winningPlayerIds ?? state.winningPlayerIds,
        playerBets: payload.playerBets ?? state.playerBets,
        community: nextCommunity,
        lastAction: nextLastAction,
        potTotal: typeof payload.potTotal === "number" ? payload.potTotal : state.potTotal,
        nextRoundStartAt: hasNextRoundTimestamp ? payload.nextRoundStartAt! : null,
        lastActionFeedback: shouldClearFeedback ? null : state.lastActionFeedback,
      };
    });
  },

  markPhaseAcknowledged: () => {
    set((state) => ({
      playerBets: Object.fromEntries(
        Object.entries(state.playerBets).map(([playerId, bets]) => [
          playerId,
          {
            ...bets,
            hasFolded: bets.hasFolded,
          },
        ])
      ),
    }));
  },

  setLastAction: (action) => set({ lastAction: action }),

  setActionFeedback: (message) => set({ lastActionFeedback: message }),

  setPotTotal: (total) => set({ potTotal: total }),

  setNextRoundStartAt: (timestamp) => set({ nextRoundStartAt: timestamp }),
}));
