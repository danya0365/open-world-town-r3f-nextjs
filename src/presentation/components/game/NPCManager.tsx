"use client";

import { useNPCStore } from "@/src/presentation/stores/npcStore";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { NPC } from "./NPC";

/**
 * NPC Manager Component
 * Manages and renders all NPCs in the scene
 */
export function NPCManager() {
  const { npcs, spawnNPC, moveNPC } = useNPCStore();

  // Spawn initial NPCs
  useEffect(() => {
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
  }, [spawnNPC]);

  // Update NPC AI
  useFrame((_, delta) => {
    npcs.forEach((npc) => {
      moveNPC(npc.id, delta);
    });
  });

  const npcArray = useMemo(() => Array.from(npcs.values()), [npcs]);

  const handleNPCInteract = (npcId: string) => {
    console.log("Interacting with NPC:", npcId);
    // TODO: Implement dialogue system
    alert(`สวัสดี! ฉันคือ ${npcs.get(npcId)?.name}`);
  };

  return (
    <group>
      {npcArray.map((npc) => (
        <NPC key={npc.id} npc={npc} onInteract={handleNPCInteract} />
      ))}
    </group>
  );
}
