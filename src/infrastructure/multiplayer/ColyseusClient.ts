import { Client, Room } from "colyseus.js";

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

  async joinOrCreateRoom(roomName: string, options: any = {}): Promise<Room> {
    try {
      const room = await this.client.joinOrCreate(roomName, options);
      console.log("✅ Successfully joined room:", room.id);
      return room;
    } catch (error) {
      console.error("❌ Failed to join room:", error);
      throw error;
    }
  }

  async joinRoom(roomId: string, options: any = {}): Promise<Room> {
    try {
      const room = await this.client.joinById(roomId, options);
      console.log("✅ Successfully joined room by ID:", room.id);
      return room;
    } catch (error) {
      console.error("❌ Failed to join room by ID:", error);
      throw error;
    }
  }

  async createRoom(roomName: string, options: any = {}): Promise<Room> {
    try {
      const room = await this.client.create(roomName, options);
      console.log("✅ Successfully created room:", room.id);
      return room;
    } catch (error) {
      console.error("❌ Failed to create room:", error);
      throw error;
    }
  }

  async getAvailableRooms(roomName: string = "game_room") {
    try {
      const rooms = await this.client.getAvailableRooms(roomName);
      return rooms;
    } catch (error) {
      console.error("❌ Failed to get available rooms:", error);
      throw error;
    }
  }
}

export const colyseusClient = ColyseusClient.getInstance();
