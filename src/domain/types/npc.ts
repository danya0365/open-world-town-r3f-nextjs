/**
 * NPC Types and Interfaces
 * Defines types for NPCs, AI behavior, and interactions
 */

export type NPCType = "villager" | "merchant" | "guard" | "animal" | "custom";

export type NPCBehavior = "idle" | "wander" | "patrol" | "follow" | "flee";

export interface NPCPosition {
  x: number;
  y: number;
  z: number;
}

export interface NPCState {
  id: string;
  type: NPCType;
  name: string;
  position: NPCPosition;
  rotation: number;
  behavior: NPCBehavior;
  speed: number;
  health: number;
  maxHealth: number;
  isInteractable: boolean;
  dialogueId?: string;
  patrolPoints?: NPCPosition[];
  currentPatrolIndex?: number;
}

export interface NPCDialogue {
  id: string;
  npcId: string;
  lines: string[];
  currentLine: number;
}

export const NPC_TYPES: Record<NPCType, { label: string; color: string; icon: string }> = {
  villager: {
    label: "Villager",
    color: "#8B4513",
    icon: "👨",
  },
  merchant: {
    label: "Merchant",
    color: "#FFD700",
    icon: "🛒",
  },
  guard: {
    label: "Guard",
    color: "#4169E1",
    icon: "🛡️",
  },
  animal: {
    label: "Animal",
    color: "#228B22",
    icon: "🐕",
  },
  custom: {
    label: "Custom",
    color: "#808080",
    icon: "❓",
  },
};

export interface NPCSpawnPoint {
  position: NPCPosition;
  type: NPCType;
  behavior: NPCBehavior;
  name: string;
  patrolPoints?: NPCPosition[];
}
