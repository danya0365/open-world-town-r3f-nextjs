import { Schema, type, MapSchema } from "@colyseus/schema";

/**
 * Player Schema
 * Represents a single player in the game
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
 * Game State Schema
 * Synchronized state for the entire game room
 */
export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("number") serverTime: number = Date.now();
}
