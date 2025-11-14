import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

/**
 * Player Schema
 * Represents a player in the game
 */
export class Player extends Schema {
  @type("string") id: string = "";
  @type("string") username: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
  @type("number") rotation: number = 0;
  @type("boolean") isMoving: boolean = false;
  @type("number") timestamp: number = 0;
}

/**
 * NPC Schema
 * Represents a non-player character in the game
 */
export class NPC extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type("string") type: string = "villager"; // villager, merchant, guard, animal
  @type("string") behavior: string = "idle"; // idle, wander, patrol
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
  @type("number") rotation: number = 0;
  @type("number") speed: number = 1.5;
  @type("number") health: number = 100;
  @type("number") maxHealth: number = 100;
  @type("boolean") isInteractable: boolean = true;
}

/**
 * Table Seat Schema
 * Represents a single seat at the Caribbean Poker table
 */
export class TableSeat extends Schema {
  @type("number") index: number = 0;
  @type("string") playerId: string = ""; // empty string หมายถึง ว่าง
  @type("number") committedFrame: number = 0;
}

export class PokerPlayerBetState extends Schema {
  @type("number") ante: number = 0;
  @type("number") bet: number = 0;
  @type("number") insurance: number = 0;
  @type("boolean") hasFolded: boolean = false;
}

export class PokerPlayerHand extends Schema {
  @type(["string"]) cards = new ArraySchema<string>();
}

export class PokerCommunityCards extends Schema {
  @type(["string"]) dealerHand = new ArraySchema<string>();
  @type({ map: PokerPlayerHand }) playerHands = new MapSchema<PokerPlayerHand>();
}

export class PokerRoundState extends Schema {
  @type("string") phase: string = "waiting";
  @type("number") dealerSeed: number = 0;
  @type({ map: PokerPlayerBetState }) playerBets = new MapSchema<PokerPlayerBetState>();
  @type(["string"]) winningPlayerIds = new ArraySchema<string>();
}

/**
 * Game State Schema
 * Root state that gets synchronized with all clients
 */
export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: NPC }) npcs = new MapSchema<NPC>();
  @type("number") serverTime: number = Date.now();
  @type([TableSeat]) tableSeats = new ArraySchema<TableSeat>();
  @type("string") tableStatus: string = "open";
  @type("string") tableHostId: string = "";
  @type("number") tableFrame: number = 0;
  @type("string") activeSubgame: string = "none";
  @type(PokerRoundState) pokerRound = new PokerRoundState();
}
