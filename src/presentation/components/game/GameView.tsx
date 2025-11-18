"use client";

import { useState } from "react";
import { ControlsInfo } from "./Controls";
import { DebugPanel } from "./DebugPanel";
import { VoiceVideoTelemetryPanel } from "./VoiceVideoTelemetryPanel";
import { GameCanvas } from "./GameCanvas";
import { ConnectionUI } from "./ConnectionUI";
import { ChatUI } from "./ChatUI";
import { ConnectionQualityIndicator } from "./ConnectionQualityIndicator";
import { PlayerListPanel } from "./PlayerListPanel";
import { LobbyUI } from "./LobbyUI";
import { GameModeIndicator } from "./GameModeIndicator";
import { VoiceVideoControls } from "./VoiceVideoControls";
import { VideoGrid } from "./VideoGrid";
import { VoiceVideoSync } from "./VoiceVideoSync";
import { SpatialAudioManager } from "./SpatialAudioManager";
import { NotificationCenter } from "../feedback/NotificationCenter";
import { DragonQuestControls } from "./DragonQuestControls";
import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";
import type { CharacterType } from "./CharacterSelection";

interface GameViewProps {
  selectedCharacter: CharacterType;
}

/**
 * Game View Component
 * Main view for the game page with canvas and UI overlays
 */
export function GameView({ selectedCharacter }: GameViewProps) {
  const [showDebug, setShowDebug] = useState(false);
  const isConnected = useMultiplayerStore((state) => state.isConnected);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Lobby UI - Show when not connected */}
      {!isConnected && <LobbyUI selectedCharacter={selectedCharacter} />}

      {/* Game Canvas */}
      <GameCanvas />

      {/* Connection UI */}
      <ConnectionUI />

      {/* Game Mode Indicator */}
      {isConnected && <GameModeIndicator />}

      {/* Player List Panel */}
      <PlayerListPanel />

      {/* Chat UI */}
      <ChatUI />

      {/* Voice/Video Components */}
      <VoiceVideoSync />
      <SpatialAudioManager />
      <VoiceVideoControls />
      <VideoGrid />

      {/* Debug Panel */}
      {showDebug && (
        <>
          <DebugPanel />
          <VoiceVideoTelemetryPanel />
        </>
      )}

      {/* Controls Info */}
      <ControlsInfo />

      {/* Dragon Quest On-Screen Controls */}
      <DragonQuestControls />

      {/* Global Notifications */}
      <NotificationCenter />

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
