export interface MultiplayerPlayerState {
  id: string;
  username: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  isMoving: boolean;
  timestamp?: number;
}

export interface MapSchemaLike<T> {
  forEach(callback: (value: T, key: string) => void): void;
  get?(key: string): T | undefined;
}

export interface GameRoomState {
  players: MapSchemaLike<MultiplayerPlayerState>;
  serverTime: number;
}

export interface PlayerJoinedMessage {
  playerId: string;
  username: string;
}

export interface PlayerLeftMessage {
  playerId: string;
  username: string;
}

export interface ChatMessage {
  playerId: string;
  message: string;
  timestamp: number;
}

export interface RoomJoinOptions {
  username: string;
  roomName?: string;
  maxClients?: number;
  isPrivate?: boolean;
  [key: string]: unknown;
}
