"use client";

import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";
import { useNPCStore } from "@/src/presentation/stores/npcStore";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { NPC } from "./NPC";
import type { NPCState } from "@/src/domain/types/npc";

/**
 * NPC Manager Component
 * Manages and renders all NPCs in the scene
 * In multiplayer mode, NPCs are synced from server
 * In single-player mode, NPCs are managed locally
 */
export function NPCManager() {
  const { isConnected, npcs: multiplayerNPCs } = useMultiplayerStore();
  const { npcs: localNPCs, spawnNPC, moveNPC } = useNPCStore();

  // Spawn initial NPCs (only in single-player mode)
  useEffect(() => {
    if (!isConnected && localNPCs.size === 0) {
      // Spawn some villagers
      spawnNPC({
        position: { x: 5, y: 0, z: 5 },
        type: "villager",
        behavior: "wander",
        name: "John",
      });

      spawnNPC({
        position: { x: -8, y: 0, z: 3 },
        type: "merchant",
        behavior: "idle",
        name: "Merchant Bob",
      });

      spawnNPC({
        position: { x: 0, y: 0, z: -10 },
        type: "guard",
        behavior: "patrol",
        name: "Guard Tom",
        patrolPoints: [
          { x: 0, y: 0, z: -10 },
          { x: 5, y: 0, z: -10 },
          { x: 5, y: 0, z: -5 },
          { x: 0, y: 0, z: -5 },
        ],
      });

      spawnNPC({
        position: { x: -5, y: 0, z: -5 },
        type: "animal",
        behavior: "wander",
        name: "Dog",
      });
    }
  }, [isConnected, localNPCs.size, spawnNPC]);

  // Update NPC AI (only in single-player mode)
  useFrame((_, delta) => {
    if (!isConnected) {
      localNPCs.forEach((npc) => {
        moveNPC(npc.id, delta);
      });
    }
  });

  // Use multiplayer NPCs if connected, otherwise use local NPCs
  const npcsToRender = useMemo(() => {
    if (isConnected) {
      // Convert multiplayer NPCs to NPCState format
      return Array.from(multiplayerNPCs.values()).map((npc) => ({
        id: npc.id,
        type: npc.type as any,
        name: npc.name,
        position: { x: npc.x, y: npc.y, z: npc.z },
        rotation: npc.rotation,
        behavior: npc.behavior as any,
        speed: npc.speed,
        health: npc.health,
        maxHealth: npc.maxHealth,
        isInteractable: npc.isInteractable,
      })) as NPCState[];
    } else {
      return Array.from(localNPCs.values());
    }
  }, [isConnected, multiplayerNPCs, localNPCs]);

  const handleNPCInteract = (npcId: string) => {
    console.log("Interacting with NPC:", npcId);
    const npc = npcsToRender.find((n) => n.id === npcId);
    if (npc) {
      alert(`สวัสดี! ฉันคือ ${npc.name}`);
    }
  };

  return (
    <group>
      {npcsToRender.map((npc) => (
        <NPC key={npc.id} npc={npc} onInteract={handleNPCInteract} />
      ))}
    </group>
  );
}
