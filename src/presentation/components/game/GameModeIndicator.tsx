"use client";

import { useGameStore } from "@/src/presentation/stores/gameStore";
import { GAME_MODES, MAP_NAMES } from "@/src/domain/types/room";

/**
 * Game Mode Indicator
 * Shows current game mode and map in the UI
 */
export function GameModeIndicator() {
  const gameMode = useGameStore((state) => state.gameMode);
  const mapName = useGameStore((state) => state.mapName);

  const modeInfo = GAME_MODES[gameMode];
  const mapInfo = MAP_NAMES[mapName];

  return (
    <div className="fixed top-20 left-4 bg-black/60 backdrop-blur-sm text-white p-4 rounded-lg border border-white/20 z-10 min-w-[200px]">
      <div className="space-y-2">
        {/* Game Mode */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            โหมดเกม
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{modeInfo.icon}</span>
            <div>
              <div className="font-semibold">{modeInfo.label}</div>
              <div className="text-xs text-gray-300">{modeInfo.description}</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20" />

        {/* Map */}
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            แผนที่
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{mapInfo.icon}</span>
            <div>
              <div className="font-semibold">{mapInfo.label}</div>
              <div className="text-xs text-gray-300">{mapInfo.description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
