"use client";

import { useEffect } from "react";
import { useVoiceVideoStore } from "@/src/presentation/stores/voiceVideoStore";
import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";

/**
 * Voice/Video Sync Component
 * Initializes PeerJS and manages peer connections based on multiplayer room
 */
export function VoiceVideoSync() {
  const {
    isInitialized,
    initialize,
    cleanup,
    callPeer,
    activeCalls,
  } = useVoiceVideoStore();

  const {
    isConnected,
    myPlayerId,
    players,
  } = useMultiplayerStore();

  // Initialize PeerJS when connected to multiplayer
  useEffect(() => {
    if (isConnected && myPlayerId && !isInitialized) {
      // Initialize with multiplayer session ID as peer ID
      initialize(myPlayerId).catch((error) => {
        console.error("Failed to initialize voice/video:", error);
      });
    }

    // Cleanup when disconnecting
    return () => {
      if (!isConnected && isInitialized) {
        cleanup();
      }
    };
  }, [isConnected, myPlayerId, isInitialized, initialize, cleanup]);

  // Auto-call other players when they join
  useEffect(() => {
    if (!isInitialized || !isConnected) {
      return;
    }

    // Call players that are in the room but not in active calls
    players.forEach((player, playerId) => {
      if (playerId !== myPlayerId && !activeCalls.has(playerId)) {
        // Small delay to ensure both peers are ready
        setTimeout(() => {
          console.log(`📞 Auto-calling player: ${player.username} (${playerId})`);
          callPeer(playerId, player.username);
        }, 1000);
      }
    });
  }, [players, myPlayerId, isInitialized, isConnected, callPeer, activeCalls]);

  // This component doesn't render anything
  return null;
}
