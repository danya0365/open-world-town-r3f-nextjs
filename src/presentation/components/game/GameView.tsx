"use client";

import { useState } from "react";
import { ControlsInfo } from "./Controls";
import { DebugPanel } from "./DebugPanel";
import { GameCanvas } from "./GameCanvas";
import { ConnectionUI } from "./ConnectionUI";
import { ChatUI } from "./ChatUI";
import { ConnectionQualityIndicator } from "./ConnectionQualityIndicator";
import { PlayerListPanel } from "./PlayerListPanel";

/**
 * Game View Component
 * Main view for the game page with canvas and UI overlays
 */
export function GameView() {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Game Canvas */}
      <GameCanvas />

      {/* Connection UI */}
      <ConnectionUI />

      {/* Player List Panel */}
      <PlayerListPanel />

      {/* Chat UI */}
      <ChatUI />

      {/* Debug Panel */}
      {showDebug && <DebugPanel />}

      {/* Controls Info */}
      <ControlsInfo />

      {/* Top UI Bar */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        {/* Debug Toggle */}
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="px-3 py-2 bg-black/70 text-white rounded-lg text-sm hover:bg-black/80 transition-colors"
          title="Toggle Debug Panel"
        >
          {showDebug ? "Hide Debug" : "Show Debug"}
        </button>

        {/* Connection Quality */}
        <ConnectionQualityIndicator />

        {/* Menu Button */}
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          title="Menu"
        >
          Menu
        </button>
      </div>

      {/* Loading Overlay (optional) */}
      {/* <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="text-white text-xl">Loading...</div>
      </div> */}
    </div>
  );
}
