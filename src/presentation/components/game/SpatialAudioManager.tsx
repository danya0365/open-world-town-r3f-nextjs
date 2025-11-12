"use client";

import { useEffect } from "react";
import { useVoiceVideoStore } from "@/src/presentation/stores/voiceVideoStore";
import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";
import { usePlayerStore } from "@/src/presentation/stores/playerStore";

/**
 * Spatial Audio Manager
 * Updates audio volume based on player distances (proximity-based audio)
 */
export function SpatialAudioManager() {
  const { activeCalls, spatialAudioEnabled, updatePeerDistance } = useVoiceVideoStore();
  const players = useMultiplayerStore((state) => state.players);
  const myPlayerId = useMultiplayerStore((state) => state.myPlayerId);
  const myPosition = usePlayerStore((state) => state.position);

  useEffect(() => {
    if (!spatialAudioEnabled || activeCalls.size === 0) {
      return;
    }

    // Update distances every frame
    const interval = setInterval(() => {
      activeCalls.forEach((connection, peerId) => {
        // Find player in multiplayer store
        const player = players.get(peerId);
        
        if (!player) {
          return;
        }

        // Calculate distance between my player and remote player
        const dx = myPosition[0] - player.x;
        const dz = myPosition[2] - player.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Update volume based on distance
        updatePeerDistance(peerId, distance);
      });
    }, 100); // Update 10 times per second

    return () => clearInterval(interval);
  }, [
    spatialAudioEnabled,
    activeCalls,
    players,
    myPosition,
    updatePeerDistance,
  ]);

  // This component doesn't render anything
  return null;
}
