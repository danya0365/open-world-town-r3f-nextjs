/**
 * Room Types and Interfaces
 * Defines types for room metadata, filtering, and sorting
 */

export type GameMode = "deathmatch" | "team_deathmatch" | "capture_flag" | "free_roam" | "custom";

export type MapName =
  | "town_square"
  | "forest"
  | "desert"
  | "snow_land"
  | "caribbean_poker"
  | "custom";

export interface RoomMetadata {
  roomName: string;
  gameMode: GameMode;
  mapName: MapName;
  isPrivate: boolean;
  hasPassword: boolean;
  maxClients: number;
  createdBy: string;
  createdAt: number;
  tags?: string[];
  description?: string;
}

export interface RoomFilterOptions {
  showPrivate: boolean;
  showPasswordProtected: boolean;
  gameMode?: GameMode;
  minPlayers?: number;
  maxPlayers?: number;
  searchQuery?: string;
}

export type RoomSortBy = "players" | "name" | "created" | "mode";
export type RoomSortOrder = "asc" | "desc";

export interface RoomSortOptions {
  sortBy: RoomSortBy;
  sortOrder: RoomSortOrder;
}

export const GAME_MODES: Record<GameMode, { label: string; description: string; icon: string }> = {
  deathmatch: {
    label: "Deathmatch",
    description: "Free-for-all combat",
    icon: "⚔️",
  },
  team_deathmatch: {
    label: "Team Deathmatch",
    description: "Team vs Team combat",
    icon: "🤝",
  },
  capture_flag: {
    label: "Capture the Flag",
    description: "Capture enemy flags",
    icon: "🚩",
  },
  free_roam: {
    label: "Free Roam",
    description: "Explore and socialize",
    icon: "🌍",
  },
  custom: {
    label: "Custom",
    description: "Custom game mode",
    icon: "⚙️",
  },
};

export const MAP_NAMES: Record<MapName, { label: string; description: string; icon: string }> = {
  town_square: {
    label: "Town Square",
    description: "A bustling town center",
    icon: "🏘️",
  },
  forest: {
    label: "Forest",
    description: "Dense woodland area",
    icon: "🌲",
  },
  desert: {
    label: "Desert",
    description: "Sandy dunes and oasis",
    icon: "🏜️",
  },
  snow_land: {
    label: "Snow Land",
    description: "Frozen tundra",
    icon: "❄️",
  },
  caribbean_poker: {
    label: "Caribbean Poker",
    description: "โต๊ะเกมคาริบเบียนโปกเกอร์",
    icon: "🃏",
  },
  custom: {
    label: "Custom",
    description: "Custom map",
    icon: "🗺️",
  },
};
