import {
  type GameRoomState,
  type RoomJoinOptions,
} from "@/src/domain/types/multiplayer";
import { Client, Room } from "colyseus.js";

export interface AvailableRoom {
  roomId: string;
  clients: number;
  maxClients: number;
  name?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  locked?: boolean;
}

const COLYSEUS_HOST = process.env.NEXT_PUBLIC_COLYSEUS_HOST || "localhost";
const COLYSEUS_PORT = process.env.NEXT_PUBLIC_COLYSEUS_PORT || "2567";
const COLYSEUS_SECURE = process.env.NEXT_PUBLIC_COLYSEUS_SECURE === "true";

export class ColyseusClient {
  private client: Client;
  private static instance: ColyseusClient;

  private constructor() {
    const protocol = COLYSEUS_SECURE ? "wss" : "ws";
    const endpoint = `${protocol}://${COLYSEUS_HOST}:${COLYSEUS_PORT}`;

    console.log(`🎮 Initializing Colyseus client: ${endpoint}`);
    this.client = new Client(endpoint);
  }

  static getInstance(): ColyseusClient {
    if (!ColyseusClient.instance) {
      ColyseusClient.instance = new ColyseusClient();
    }
    return ColyseusClient.instance;
  }

  async joinOrCreateRoom(
    roomName: string,
    options: RoomJoinOptions
  ): Promise<Room<GameRoomState>> {
    try {
      const room = await this.client.joinOrCreate<GameRoomState>(
        roomName,
        options
      );
      console.log("✅ Successfully joined room:", room);
      return room;
    } catch (error) {
      console.error("❌ Failed to join room:", error);
      throw error;
    }
  }

  async joinRoomById(
    roomId: string,
    options: RoomJoinOptions
  ): Promise<Room<GameRoomState>> {
    try {
      const room = await this.client.joinById<GameRoomState>(roomId, options);
      console.log("✅ Successfully joined room:", room);
      return room;
    } catch (error) {
      console.error("❌ Failed to join room by ID:", error);
      throw error;
    }
  }

  async createRoom(
    roomName: string,
    options: RoomJoinOptions
  ): Promise<Room<GameRoomState>> {
    try {
      const room = await this.client.create<GameRoomState>(roomName, options);
      console.log("✅ Successfully created room:", room);
      return room;
    } catch (error) {
      console.error("❌ Failed to create room:", error);
      throw error;
    }
  }

  async getAvailableRooms(
    roomName: string = "game_room"
  ): Promise<AvailableRoom[]> {
    try {
      const { data } = await this.client.http.get<AvailableRoom[]>(
        `/matchmake/${encodeURIComponent(roomName)}`
      );
      return data ?? [];
    } catch (error) {
      console.error("❌ Failed to get available rooms:", error);
      throw error;
    }
  }
}

export const colyseusClient = ColyseusClient.getInstance();
