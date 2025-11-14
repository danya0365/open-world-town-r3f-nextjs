import { Room, Client } from "@colyseus/core";
import { GameState, Player, NPC, TableSeat, PokerPlayerBetState } from "./schema/GameState";

interface GameRoomOptions {
  roomName?: string;
  maxClients?: number;
  isPrivate?: boolean;
  username?: string;
  mode?: string;
  mapName?: string;
}

interface TableJoinMessage {
  seatIndex: number;
  frameId?: number;
}

interface TableLeaveMessage {
  seatIndex?: number;
  frameId?: number;
}

type PokerPhase =
  | "waiting"
  | "ante"
  | "deal_player"
  | "deal_dealer"
  | "betting"
  | "reveal"
  | "payout";

interface PokerPlayerActionMessage {
  action?: string;
  playerId?: string;
  amount?: number;
  seatIndex?: number;
}

interface PokerPhaseConfig {
  phase: PokerPhase;
  durationMs: number;
  autoAdvance: boolean;
  allowPlayerActions: boolean;
}

export class GameRoom extends Room<GameState> {
  maxClients = 50; // Maximum players per room
  state = new GameState();
  private updateInterval?: NodeJS.Timeout;
  private npcIdCounter = 0;
  private readonly tableSeatCount = 5;
  private readonly tableRollbackBufferSize = 120; // ~2s @60fps
  private readonly minBetAmount = 1;
  private readonly maxBetAmount = 100;
  private readonly roundIntermissionMs = 5_000;
  private readonly pokerPhasePipeline: PokerPhaseConfig[] = [
    { phase: "ante", durationMs: 5_000, autoAdvance: true, allowPlayerActions: false },
    { phase: "deal_player", durationMs: 1_000, autoAdvance: true, allowPlayerActions: false },
    { phase: "deal_dealer", durationMs: 1_000, autoAdvance: true, allowPlayerActions: false },
    { phase: "betting", durationMs: 15_000, autoAdvance: true, allowPlayerActions: true },
    { phase: "reveal", durationMs: 4_000, autoAdvance: true, allowPlayerActions: false },
    { phase: "payout", durationMs: 4_000, autoAdvance: true, allowPlayerActions: false },
  ];
  private tableSnapshots: Array<{
    frameId: number;
    seats: { index: number; playerId: string; committedFrame: number }[];
    status: string;
    hostId: string;
  }> = [];

  private pokerPhase: PokerPhase = "waiting";
  private pokerDealerSeed = 0;
  private lastPokerAction: { playerId: string; action: string; amount?: number } | null = null;
  private pokerPhaseTimer?: NodeJS.Timeout;
  private pokerDeck: string[] = [];
  private pokerDealerHand: string[] = [];
  private pokerPlayerHands: Map<string, string[]> = new Map();
  private nextRoundStartAt: number | null = null;

  private getPokerStatePayload() {
    const playerBets: Record<string, { ante: number; bet: number; insurance: number; hasFolded: boolean }> = {};

    this.state.pokerRound.playerBets.forEach((betState, playerId) => {
      playerBets[playerId] = {
        ante: betState.ante,
        bet: betState.bet,
        insurance: betState.insurance,
        hasFolded: betState.hasFolded,
      };
    });

    const shouldRevealDealer = this.pokerPhase === "reveal" || this.pokerPhase === "payout";
    const shouldShowDealer =
      shouldRevealDealer || this.pokerPhase === "deal_dealer" || this.pokerPhase === "betting";
    const dealerHand = shouldShowDealer
      ? this.pokerDealerHand.map((card, index) => (shouldRevealDealer || index === 0 ? card : "??"))
      : [];

    const playerHands: Record<string, { cards: string[] }> = {};
    this.pokerPlayerHands.forEach((cards, playerId) => {
      const visibleCards =
        this.pokerPhase === "deal_player" ||
        this.pokerPhase === "betting" ||
        this.pokerPhase === "reveal" ||
        this.pokerPhase === "payout"
          ? cards
          : [];
      playerHands[playerId] = { cards: visibleCards };
    });

    return {
      phase: this.pokerPhase,
      dealerSeed: this.pokerDealerSeed,
      winningPlayerIds: Array.from(this.state.pokerRound.winningPlayerIds),
      playerBets,
      community: {
        dealerHand,
        playerHands,
      },
      lastAction: this.lastPokerAction,
      potTotal: this.getCurrentPotTotal(),
      nextRoundStartAt: this.nextRoundStartAt,
    };
  }

  private resetPokerRound() {
    this.clearPokerPhaseTimer();
    this.pokerPhase = "waiting";
    this.pokerDealerSeed = 0;
    this.lastPokerAction = null;
    this.pokerDeck = [];
    this.pokerDealerHand = [];
    this.pokerPlayerHands.clear();
    this.nextRoundStartAt = null;

    this.state.pokerRound.phase = "waiting";
    this.state.pokerRound.dealerSeed = 0;
    this.state.pokerRound.playerBets.clear();
    this.state.pokerRound.winningPlayerIds.splice(0, this.state.pokerRound.winningPlayerIds.length);
  }

  private ensurePokerPlayerBetState(playerId: string) {
    let betState = this.state.pokerRound.playerBets.get(playerId);
    if (!betState) {
      betState = new PokerPlayerBetState();
      this.state.pokerRound.playerBets.set(playerId, betState);
    }
    return betState;
  }

  private setPokerPhase(phase: PokerPhase) {
    this.pokerPhase = phase;
    this.state.pokerRound.phase = phase;
  }

  private clearPokerPhaseTimer() {
    if (this.pokerPhaseTimer) {
      clearTimeout(this.pokerPhaseTimer);
      this.pokerPhaseTimer = undefined;
    }
  }

  private getPhaseConfig(phase: PokerPhase): PokerPhaseConfig | undefined {
    return this.pokerPhasePipeline.find((entry) => entry.phase === phase);
  }

  private getNextPhase(current: PokerPhase): PokerPhase | "waiting" {
    const currentIndex = this.pokerPhasePipeline.findIndex((entry) => entry.phase === current);
    if (currentIndex === -1 || currentIndex + 1 >= this.pokerPhasePipeline.length) {
      return "waiting";
    }

    return this.pokerPhasePipeline[currentIndex + 1].phase;
  }

  private beginPokerPhase(phase: PokerPhase) {
    const config = this.getPhaseConfig(phase);
    if (!config) {
      console.warn(`Unknown poker phase requested: ${phase}`);
      this.setPokerPhase("waiting");
      this.broadcastPokerState();
      return;
    }

    this.clearPokerPhaseTimer();
    this.nextRoundStartAt = null;
    this.setPokerPhase(phase);
    this.handlePhaseEntry(phase);

    if (config.autoAdvance) {
      this.pokerPhaseTimer = setTimeout(() => {
        this.advancePokerPhase();
      }, config.durationMs);
    }

    this.broadcastPokerState();
  }

  private advancePokerPhase() {
    const nextPhase = this.getNextPhase(this.pokerPhase);

    if (nextPhase === "waiting") {
      this.resetPokerRound();
      this.scheduleNextRound();
      this.broadcastPokerState();
      return;
    }

    this.beginPokerPhase(nextPhase);
  }

  private handlePhaseEntry(phase: PokerPhase) {
    switch (phase) {
      case "ante":
        this.prepareAntePhase();
        break;
      case "deal_player":
        this.dealPlayerCards();
        break;
      case "deal_dealer":
        this.dealDealerCards();
        break;
      case "reveal":
        this.prepareRevealPhase();
        break;
      case "payout":
        this.performPayouts();
        break;
      default:
        break;
    }
  }

  private prepareAntePhase() {
    const seatedPlayerIds = this.getSeatedPlayerIds();
    const baseSeed = this.pokerDealerSeed || Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    this.pokerDeck = this.buildShuffledDeck(baseSeed);
    this.pokerDealerHand = [];
    this.pokerPlayerHands.clear();
    this.lastPokerAction = null;
    this.state.pokerRound.dealerSeed = baseSeed;

    this.state.pokerRound.winningPlayerIds.splice(0, this.state.pokerRound.winningPlayerIds.length);

    // Remove stale bet states for players who left the table.
    const existingPlayerIds = Array.from(this.state.pokerRound.playerBets.keys());
    existingPlayerIds.forEach((playerId) => {
      if (!seatedPlayerIds.includes(playerId)) {
        this.state.pokerRound.playerBets.delete(playerId);
      }
    });

    seatedPlayerIds.forEach((playerId) => {
      const betState = this.ensurePokerPlayerBetState(playerId);
      betState.ante = this.minBetAmount;
      betState.bet = 0;
      betState.insurance = 0;
      betState.hasFolded = false;
    });
  }

  private dealPlayerCards() {
    const seatedPlayerIds = this.getSeatedPlayerIds();
    seatedPlayerIds.forEach((playerId) => {
      this.ensurePokerPlayerBetState(playerId);
      const cards: string[] = [];
      for (let i = 0; i < 5; i += 1) {
        cards.push(this.drawCard());
      }
      this.pokerPlayerHands.set(playerId, cards);
    });
  }

  private dealDealerCards() {
    const cards: string[] = [];
    for (let i = 0; i < 5; i += 1) {
      cards.push(this.drawCard());
    }
    this.pokerDealerHand = cards;
  }

  private prepareRevealPhase() {
    // Ensure dealer has cards revealed; placeholder hook for future animations.
  }

  private performPayouts() {
    const winners = this.evaluateWinningPlayers();
    const target = this.state.pokerRound.winningPlayerIds;
    target.splice(0, target.length, ...winners);
  }

  private getCurrentPotTotal() {
    let total = 0;
    this.state.pokerRound.playerBets.forEach((betState) => {
      total += Math.max(0, betState.ante) + Math.max(0, betState.bet);
    });
    return total;
  }

  private buildShuffledDeck(seed: number) {
    const ranks = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
    const suits = ["♠", "♥", "♦", "♣"];
    const deck: string[] = [];
    suits.forEach((suit) => {
      ranks.forEach((rank) => {
        deck.push(`${rank}${suit}`);
      });
    });

    const random = this.createSeededRandom(seed);
    for (let i = deck.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }

  private createSeededRandom(seed: number) {
    let value = seed % 2147483647;
    if (value <= 0) {
      value += 2147483646;
    }
    return () => {
      value = (value * 16807) % 2147483647;
      return (value - 1) / 2147483646;
    };
  }

  private drawCard() {
    if (this.pokerDeck.length === 0) {
      this.pokerDeck = this.buildShuffledDeck(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    }

    return this.pokerDeck.shift() ?? "";
  }

  private getSeatedPlayerIds() {
    return this.state.tableSeats
      .filter((seat) => Boolean(seat.playerId))
      .map((seat) => seat.playerId)
      .filter((playerId): playerId is string => Boolean(playerId));
  }

  private evaluateWinningPlayers() {
    if (this.pokerDealerHand.length === 0) {
      return [] as string[];
    }

    const dealerScore = this.calculateHandScore(this.pokerDealerHand);
    const highestBet = this.getHighestBetAmount();

    const winners: string[] = [];
    this.state.pokerRound.playerBets.forEach((betState, playerId) => {
      if (betState.hasFolded || betState.bet <= 0 || betState.bet < highestBet) {
        return;
      }

      const playerCards = this.pokerPlayerHands.get(playerId);
      if (!playerCards || playerCards.length === 0) {
        return;
      }

      const playerScore = this.calculateHandScore(playerCards);
      if (this.compareScores(playerScore, dealerScore) > 0) {
        winners.push(playerId);
      }
    });

    if (winners.length === 0) {
      const activePlayers = this.getSeatedPlayerIds().filter((playerId) => {
        const betState = this.state.pokerRound.playerBets.get(playerId);
        return !!betState && !betState.hasFolded;
      });
      return activePlayers.length > 0 ? [activePlayers[0]] : [];
    }

    return winners;
  }

  private calculateHandScore(cards: string[]) {
    const values = cards.map((card) => this.getCardValue(card)).sort((a, b) => b - a);
    return values;
  }

  private compareScores(a: number[], b: number[]) {
    const length = Math.max(a.length, b.length);
    for (let i = 0; i < length; i += 1) {
      const diff = (a[i] ?? 0) - (b[i] ?? 0);
      if (diff !== 0) {
        return diff;
      }
    }
    return 0;
  }

  private getCardValue(card: string) {
    const rank = card.slice(0, card.length - 1);
    switch (rank) {
      case "A":
        return 14;
      case "K":
        return 13;
      case "Q":
        return 12;
      case "J":
        return 11;
      case "10":
        return 10;
      case "9":
        return 9;
      case "8":
        return 8;
      case "7":
        return 7;
      case "6":
        return 6;
      case "5":
        return 5;
      case "4":
        return 4;
      case "3":
        return 3;
      case "2":
      default:
        return 2;
    }
  }

  private getHighestBetAmount() {
    let highest = 0;
    this.state.pokerRound.playerBets.forEach((betState) => {
      if (!betState.hasFolded) {
        highest = Math.max(highest, betState.bet);
      }
    });
    return highest;
  }

  private maybeCompleteBettingPhase() {
    if (this.pokerPhase !== "betting") {
      return;
    }

    const highestBet = this.getHighestBetAmount();
    const seatedPlayerIds = this.getSeatedPlayerIds();
    if (seatedPlayerIds.length === 0) {
      this.advancePokerPhase();
      return;
    }

    const activePlayers = seatedPlayerIds.filter((playerId) => {
      const betState = this.state.pokerRound.playerBets.get(playerId);
      return !!betState && !betState.hasFolded;
    });

    if (activePlayers.length <= 1) {
      this.advancePokerPhase();
      return;
    }

    const allSettled = seatedPlayerIds.every((playerId) => {
      const betState = this.state.pokerRound.playerBets.get(playerId);
      if (!betState) {
        return false;
      }

      if (betState.hasFolded) {
        return true;
      }

      return betState.bet >= Math.max(this.minBetAmount, highestBet);
    });

    if (allSettled) {
      this.advancePokerPhase();
    }
  }

  private scheduleNextRound() {
    if (this.state.tableStatus !== "in_progress") {
      return;
    }

    const seatedPlayerIds = this.getSeatedPlayerIds();
    if (seatedPlayerIds.length === 0) {
      return;
    }

    const nextSeed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    this.pokerDealerSeed = nextSeed;
    this.state.pokerRound.dealerSeed = nextSeed;

    this.clearPokerPhaseTimer();
    this.nextRoundStartAt = Date.now() + this.roundIntermissionMs;
    this.pokerPhaseTimer = setTimeout(() => {
      if (this.state.tableStatus !== "in_progress") {
        return;
      }

      if (this.getSeatedPlayerIds().length === 0) {
        return;
      }

      this.beginPokerPhase("ante");
    }, this.roundIntermissionMs);
  }

  private clampBetAmount(rawAmount?: number) {
    if (typeof rawAmount !== "number" || !Number.isFinite(rawAmount)) {
      return 0;
    }

    const rounded = Math.floor(rawAmount);
    if (rounded <= 0) {
      return 0;
    }

    return Math.min(this.maxBetAmount, Math.max(this.minBetAmount, rounded));
  }

  private broadcastTableState() {
    const latestSnapshot = this.tableSnapshots[this.tableSnapshots.length - 1];

    if (!latestSnapshot) {
      return;
    }

    this.broadcast("table_state_sync", latestSnapshot);
  }

  private broadcastPokerState() {
    this.broadcast("poker_state_update", this.getPokerStatePayload());
  }

  private initializeTableState() {
    if (this.state.tableSeats.length === 0) {
      for (let i = 0; i < this.tableSeatCount; i += 1) {
        const seat = new TableSeat();
        seat.index = i;
        seat.playerId = "";
        seat.committedFrame = 0;
        this.state.tableSeats.push(seat);
      }
    }

    if (!this.state.tableHostId && this.clients[0]) {
      this.state.tableHostId = this.clients[0].sessionId;
    }

    this.state.tableStatus = "open";
    this.state.tableFrame = 0;
    this.state.activeSubgame = "none";
    this.resetPokerRound();
    this.recordTableSnapshot();
  }

  private handleTableJoin(client: Client, message: TableJoinMessage) {
    const seatIndex = Number(message?.seatIndex);
    const frameId = Number(message?.frameId ?? 0);

    if (!Number.isInteger(seatIndex) || seatIndex < 0 || seatIndex >= this.tableSeatCount) {
      return;
    }

    const seat = this.state.tableSeats[seatIndex];
    if (!seat) {
      return;
    }

    if (seat.playerId && seat.playerId !== client.sessionId) {
      this.sendTableSnapshot(client, true);
      return;
    }

    seat.playerId = client.sessionId;
    seat.committedFrame = frameId > 0 ? frameId : this.state.tableFrame + 1;
    this.state.tableFrame = Math.max(this.state.tableFrame + 1, seat.committedFrame);
    this.recordTableSnapshot();
  }

  private handleTableLeave(client: Client, message: TableLeaveMessage) {
    const seatIndex =
      typeof message?.seatIndex === "number"
        ? Number(message.seatIndex)
        : this.state.tableSeats.findIndex((seat) => seat.playerId === client.sessionId);

    if (!Number.isInteger(seatIndex) || seatIndex < 0 || seatIndex >= this.tableSeatCount) {
      return;
    }

    const seat = this.state.tableSeats[seatIndex];

    if (!seat || seat.playerId !== client.sessionId) {
      this.sendTableSnapshot(client, true);
      return;
    }

    seat.playerId = "";
    seat.committedFrame = this.state.tableFrame + 1;
    this.state.tableFrame = seat.committedFrame;
    this.state.tableStatus = "open";

    this.state.pokerRound.playerBets.delete(client.sessionId);
    this.resetPokerRound();
    this.recordTableSnapshot();
    this.broadcastPokerState();
  }

  private handleTableStart(client: Client) {
    if (client.sessionId !== this.state.tableHostId) {
      client.send("table_start_denied", { reason: "not_host" });
      return;
    }

    const allOccupied = this.state.tableSeats.every((seat) => seat.playerId);
    if (!allOccupied) {
      client.send("table_start_denied", { reason: "seats_not_full" });
      return;
    }

    this.state.tableStatus = "in_progress";
    this.state.activeSubgame = "caribbean_poker";
    this.state.tableFrame += 1;
    this.recordTableSnapshot();

    this.broadcast("table_started", {
      frameId: this.state.tableFrame,
      subgame: this.state.activeSubgame,
    });

    this.resetPokerRound();
    const newSeed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    this.pokerDealerSeed = newSeed;
    this.state.pokerRound.dealerSeed = newSeed;
    this.beginPokerPhase("ante");

    const metadata = this.metadata ?? {};
    this.setMetadata({ ...metadata, mapName: "caribbean_poker" });
  }

  private releaseTableSeatByPlayer(playerId: string) {
    const seat = this.state.tableSeats.find((entry) => entry.playerId === playerId);

    if (!seat) {
      return;
    }

    seat.playerId = "";
    seat.committedFrame = this.state.tableFrame + 1;
    this.state.tableFrame = seat.committedFrame;
    this.state.tableStatus = "open";
    this.recordTableSnapshot();
  }

  private reassignTableHost() {
    const nextClient = this.clients[0];
    this.state.tableHostId = nextClient ? nextClient.sessionId : "";
    this.state.tableFrame += 1;
    this.recordTableSnapshot();
  }

  private recordTableSnapshot() {
    const snapshot = {
      frameId: this.state.tableFrame,
      seats: this.state.tableSeats.map((seat) => ({
        index: seat.index,
        playerId: seat.playerId,
        committedFrame: seat.committedFrame,
      })),
      status: this.state.tableStatus,
      hostId: this.state.tableHostId,
    };

    this.tableSnapshots.push(snapshot);
    if (this.tableSnapshots.length > this.tableRollbackBufferSize) {
      this.tableSnapshots.splice(0, this.tableSnapshots.length - this.tableRollbackBufferSize);
    }

    this.broadcastTableState();
  }

  private sendTableSnapshot(client: Client, forRollback = false) {
    const latestSnapshot = this.tableSnapshots[this.tableSnapshots.length - 1];

    if (!latestSnapshot) {
      return;
    }

    client.send(forRollback ? "table_rollback" : "table_state_sync", {
      frameId: latestSnapshot.frameId,
      seats: latestSnapshot.seats,
      status: latestSnapshot.status,
      hostId: latestSnapshot.hostId,
    });
  }

  onCreate(options: GameRoomOptions) {
    console.log("🎮 GameRoom created!", options);

    const {
      roomName,
      maxClients,
      isPrivate,
      username,
      mode,
      mapName,
    } = options ?? {};

    if (typeof maxClients === "number" && Number.isFinite(maxClients)) {
      const clampedMax = Math.max(1, Math.min(100, Math.floor(maxClients)));
      this.maxClients = clampedMax;
    }

    if (typeof isPrivate === "boolean") {
      this.setPrivate(isPrivate);
    }

    const metadata: Record<string, unknown> = {
      roomName: roomName?.trim() || "Game Room",
      maxClients: this.maxClients,
      isPrivate: !!isPrivate,
    };

    if (mode) {
      metadata.mode = mode;
    }

    if (mapName) {
      metadata.mapName = mapName;
    }

    if (username) {
      metadata.createdBy = username;
    }

    this.setMetadata(metadata);

    this.initializeTableState();

    // Set up message handlers
    this.onMessage("move", (client, message: any) => {
      this.handlePlayerMove(client, message);
    });

    this.onMessage("chat", (client, message: any) => {
      this.broadcast(
        "chat",
        {
          playerId: client.sessionId,
          message: message.text,
          timestamp: Date.now(),
        },
        { except: client }
      );
    });

    this.onMessage("table_join", (client, message: TableJoinMessage) => {
      this.handleTableJoin(client, message);
    });

    this.onMessage("table_leave", (client, message: TableLeaveMessage) => {
      this.handleTableLeave(client, message);
    });

    this.onMessage("table_start", (client) => {
      this.handleTableStart(client);
    });

    this.onMessage("poker_player_action", (client, payload: PokerPlayerActionMessage) => {
      this.handlePokerPlayerAction(client, payload);
    });

    this.onMessage("poker_phase_request", (client) => {
      client.send("poker_state_update", this.getPokerStatePayload());
    });

    this.onMessage("table_sync_request", (client) => {
      this.sendTableSnapshot(client);
    });

    // Spawn initial NPCs
    this.spawnInitialNPCs();

    // Game loop - Update state every 16ms (~60 FPS)
    this.updateInterval = setInterval(() => {
      this.updateGameState();
    }, 1000 / 60);

    console.log("✅ GameRoom initialized with update loop at 60 FPS");
  }

  onJoin(client: Client, options: any) {
    console.log(`👤 Player ${client.sessionId} joined!`);

    // Create new player
    const player = new Player();
    player.id = client.sessionId;
    player.username = options.username || `Player${this.clients.length}`;
    
    // Random spawn position (-5 to 5)
    player.x = Math.random() * 10 - 5;
    player.y = 0;
    player.z = Math.random() * 10 - 5;
    player.rotation = 0;
    player.timestamp = Date.now();

    // Add player to state
    this.state.players.set(client.sessionId, player);

    if (!this.state.tableHostId) {
      this.state.tableHostId = client.sessionId;
      this.recordTableSnapshot();
    }

    this.sendTableSnapshot(client);
    client.send("poker_state_update", this.getPokerStatePayload());

    // Broadcast join message to other players
    this.broadcast(
      "player_joined",
      {
        playerId: client.sessionId,
        username: player.username,
      },
      { except: client }
    );

    console.log(`✅ Player "${player.username}" spawned at (${player.x.toFixed(2)}, ${player.z.toFixed(2)})`);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`👋 Player ${client.sessionId} left (consented: ${consented})`);

    const player = this.state.players.get(client.sessionId);

    if (player) {
      // Broadcast leave message
      this.broadcast("player_left", {
        playerId: client.sessionId,
        username: player.username,
      });

      // Remove player from state
      this.state.players.delete(client.sessionId);
      console.log(`🗑️  Removed player "${player.username}" from game`);
    }

    this.releaseTableSeatByPlayer(client.sessionId);

    if (this.state.tableHostId === client.sessionId) {
      this.reassignTableHost();
    }
  }

  onDispose() {
    console.log("🔴 GameRoom", this.roomId, "disposing...");

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  /**
   * Handle player movement updates
   */
  private handlePlayerMove(client: Client, message: any) {
    const player = this.state.players.get(client.sessionId);

    if (player && message) {
      player.x = message.x ?? player.x;
      player.y = message.y ?? player.y;
      player.z = message.z ?? player.z;
      player.rotation = message.rotation ?? player.rotation;
      player.isMoving = message.isMoving ?? false;
      player.timestamp = Date.now();
    }
  }

  /**
   * Spawn initial NPCs
   */
  private spawnInitialNPCs() {
    // Spawn villager
    const villager = new NPC();
    villager.id = `npc_${this.npcIdCounter++}`;
    villager.name = "John";
    villager.type = "villager";
    villager.behavior = "wander";
    villager.x = 5;
    villager.z = 5;
    this.state.npcs.set(villager.id, villager);

    // Spawn merchant
    const merchant = new NPC();
    merchant.id = `npc_${this.npcIdCounter++}`;
    merchant.name = "Merchant Bob";
    merchant.type = "merchant";
    merchant.behavior = "idle";
    merchant.x = -8;
    merchant.z = 3;
    this.state.npcs.set(merchant.id, merchant);

    // Spawn guard
    const guard = new NPC();
    guard.id = `npc_${this.npcIdCounter++}`;
    guard.name = "Guard Tom";
    guard.type = "guard";
    guard.behavior = "patrol";
    guard.x = 0;
    guard.z = -10;
    this.state.npcs.set(guard.id, guard);

    // Spawn animal
    const animal = new NPC();
    animal.id = `npc_${this.npcIdCounter++}`;
    animal.name = "Dog";
    animal.type = "animal";
    animal.behavior = "wander";
    animal.x = -5;
    animal.z = -5;
    this.state.npcs.set(animal.id, animal);

    console.log(`✅ Spawned ${this.state.npcs.size} NPCs`);
  }

  /**
   * Update game state (60 FPS)
   */
  private updateGameState() {
    // Update server timestamp
    this.state.serverTime = Date.now();

    // Update NPC AI
    this.state.npcs.forEach((npc) => {
      this.updateNPCAI(npc);
    });
  }

  /**
   * Update NPC AI behavior
   */
  private updateNPCAI(npc: NPC) {
    const deltaTime = 1 / 60; // 60 FPS

    switch (npc.behavior) {
      case "wander":
        // Random wandering
        if (Math.random() < 0.02) {
          const angle = Math.random() * Math.PI * 2;
          const distance = npc.speed * deltaTime;
          npc.x += Math.cos(angle) * distance;
          npc.z += Math.sin(angle) * distance;
          npc.rotation = angle;

          // Keep within bounds
          npc.x = Math.max(-45, Math.min(45, npc.x));
          npc.z = Math.max(-45, Math.min(45, npc.z));
        }
        break;

      case "patrol":
        // Simple patrol pattern (will implement full patrol points later)
        const time = Date.now() / 1000;
        const patrolRadius = 5;
        npc.x = Math.cos(time * 0.5) * patrolRadius;
        npc.z = -10 + Math.sin(time * 0.5) * patrolRadius;
        npc.rotation = Math.atan2(Math.sin(time * 0.5), Math.cos(time * 0.5));
        break;

      case "idle":
      default:
        // Do nothing
        break;
    }
  }

  private handlePokerPlayerAction(client: Client, payload: PokerPlayerActionMessage) {
    if (!payload?.action) {
      client.send("poker_action_ack", { success: false, reason: "missing_action" });
      return;
    }

    if (this.state.tableStatus !== "in_progress") {
      client.send("poker_action_ack", { success: false, reason: "table_not_active" });
      return;
    }

    const action = payload.action.toLowerCase();
    const requestedSeatIndex =
      typeof payload.seatIndex === "number" && Number.isInteger(payload.seatIndex)
        ? Number(payload.seatIndex)
        : this.state.tableSeats.findIndex((seat) => seat.playerId === client.sessionId);

    if (requestedSeatIndex < 0 || requestedSeatIndex >= this.tableSeatCount) {
      client.send("poker_action_ack", { success: false, reason: "invalid_seat" });
      return;
    }

    const seat = this.state.tableSeats[requestedSeatIndex];

    if (!seat || seat.playerId !== client.sessionId) {
      client.send("poker_action_ack", { success: false, reason: "not_in_seat" });
      return;
    }

    const phaseConfig = this.getPhaseConfig(this.pokerPhase);
    if (phaseConfig && !phaseConfig.allowPlayerActions) {
      client.send("poker_action_ack", { success: false, reason: "phase_locked" });
      return;
    }

    const betState = this.ensurePokerPlayerBetState(client.sessionId);
    const clampedAmount = this.clampBetAmount(payload.amount);
    const highestBetBeforeAction = this.getHighestBetAmount();

    switch (action) {
      case "fold": {
        betState.hasFolded = true;
        break;
      }
      case "bet": {
        if (clampedAmount <= 0) {
          client.send("poker_action_ack", { success: false, reason: "invalid_amount" });
          return;
        }

        betState.bet = clampedAmount;
        break;
      }
      case "raise": {
        if (clampedAmount <= 0) {
          client.send("poker_action_ack", { success: false, reason: "invalid_amount" });
          return;
        }

        betState.bet = Math.min(this.maxBetAmount, betState.bet + clampedAmount);
        break;
      }
      case "call": {
        if (highestBetBeforeAction <= 0) {
          client.send("poker_action_ack", { success: false, reason: "nothing_to_call" });
          return;
        }

        betState.hasFolded = false;
        betState.bet = Math.min(this.maxBetAmount, Math.max(betState.bet, highestBetBeforeAction));
        break;
      }
      case "insurance": {
        if (clampedAmount <= 0) {
          client.send("poker_action_ack", { success: false, reason: "invalid_amount" });
          return;
        }

        betState.insurance = clampedAmount;
        break;
      }
      default: {
        client.send("poker_action_ack", { success: false, reason: "unknown_action" });
        return;
      }
    }

    this.lastPokerAction = {
      playerId: client.sessionId,
      action,
      amount: clampedAmount > 0 ? clampedAmount : undefined,
    };

    if (action !== "insurance") {
      this.maybeCompleteBettingPhase();
    }

    this.broadcastPokerState();
    client.send("poker_action_ack", { success: true, action, amount: clampedAmount || undefined });
  }
}
