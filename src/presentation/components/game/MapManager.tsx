"use client";

import { useGameStore } from "@/src/presentation/stores/gameStore";
import { TownSquareMap } from "./maps/TownSquareMap";
import { ForestMap } from "./maps/ForestMap";
import { DesertMap } from "./maps/DesertMap";
import { SnowLandMap } from "./maps/SnowLandMap";
import { CaribbeanPokerMap } from "./maps/CaribbeanPokerMap";
import type { MapName } from "@/src/domain/types/room";

/**
 * Map Manager Component
 * Renders the appropriate map based on current game settings
 */
export function MapManager() {
  const mapName = useGameStore((state) => state.mapName);

  // Render the appropriate map
  const renderMap = () => {
    switch (mapName) {
      case "town_square":
        return <TownSquareMap />;
      case "forest":
        return <ForestMap />;
      case "desert":
        return <DesertMap />;
      case "snow_land":
        return <SnowLandMap />;
      case "caribbean_poker":
        return <CaribbeanPokerMap />;
      case "custom":
        // Default to town square for custom maps (can be extended later)
        return <TownSquareMap />;
      default:
        return <TownSquareMap />;
    }
  };

  return <>{renderMap()}</>;
}

/**
 * Get ambient light color based on map
 */
export function getAmbientLightColor(mapName: MapName): string {
  switch (mapName) {
    case "town_square":
      return "#FFFAF0"; // Warm white
    case "forest":
      return "#D4F1D4"; // Green tint
    case "desert":
      return "#FFF4E6"; // Warm orange tint
    case "snow_land":
      return "#E0F2FE"; // Cool blue tint
    case "caribbean_poker":
      return "#FFF4DE"; // Soft warm for casino feel
    default:
      return "#FFFFFF";
  }
}

/**
 * Get directional light color based on map
 */
export function getDirectionalLightColor(mapName: MapName): string {
  switch (mapName) {
    case "town_square":
      return "#FFFACD"; // Lemon chiffon
    case "forest":
      return "#98FB98"; // Pale green
    case "desert":
      return "#FFE4B5"; // Moccasin
    case "snow_land":
      return "#B0E0E6"; // Powder blue
    case "caribbean_poker":
      return "#FFD966"; // Warm spotlight
    default:
      return "#FFFFFF";
  }
}

/**
 * Get fog color based on map
 */
export function getFogColor(mapName: MapName): string {
  switch (mapName) {
    case "town_square":
      return "#87CEEB"; // Sky blue
    case "forest":
      return "#90EE90"; // Light green
    case "desert":
      return "#F4A460"; // Sandy brown
    case "snow_land":
      return "#F0F8FF"; // Alice blue
    case "caribbean_poker":
      return "#FFE9C4"; // Soft golden haze
    default:
      return "#FFFFFF";
  }
}
