import { create } from "zustand";
import type { NPCState, NPCSpawnPoint, NPCBehavior } from "@/src/domain/types/npc";

interface NPCStore {
  npcs: Map<string, NPCState>;
  spawnNPC: (spawnPoint: NPCSpawnPoint) => void;
  removeNPC: (id: string) => void;
  updateNPC: (id: string, updates: Partial<NPCState>) => void;
  moveNPC: (id: string, deltaTime: number) => void;
  getNPC: (id: string) => NPCState | undefined;
}

let npcIdCounter = 0;

export const useNPCStore = create<NPCStore>((set, get) => ({
  npcs: new Map(),

  spawnNPC: (spawnPoint: NPCSpawnPoint) => {
    const id = `npc_${npcIdCounter++}`;
    const npc: NPCState = {
      id,
      type: spawnPoint.type,
      name: spawnPoint.name,
      position: { ...spawnPoint.position },
      rotation: 0,
      behavior: spawnPoint.behavior,
      speed: 1.5,
      health: 100,
      maxHealth: 100,
      isInteractable: true,
      patrolPoints: spawnPoint.patrolPoints,
      currentPatrolIndex: 0,
    };

    set((state) => {
      const newNpcs = new Map(state.npcs);
      newNpcs.set(id, npc);
      return { npcs: newNpcs };
    });
  },

  removeNPC: (id: string) => {
    set((state) => {
      const newNpcs = new Map(state.npcs);
      newNpcs.delete(id);
      return { npcs: newNpcs };
    });
  },

  updateNPC: (id: string, updates: Partial<NPCState>) => {
    set((state) => {
      const npc = state.npcs.get(id);
      if (!npc) return state;

      const newNpcs = new Map(state.npcs);
      newNpcs.set(id, { ...npc, ...updates });
      return { npcs: newNpcs };
    });
  },

  moveNPC: (id: string, deltaTime: number) => {
    const npc = get().npcs.get(id);
    if (!npc) return;

    switch (npc.behavior) {
      case "wander":
        // Random wandering
        if (Math.random() < 0.02) {
          const angle = Math.random() * Math.PI * 2;
          const distance = npc.speed * deltaTime;
          const newX = npc.position.x + Math.cos(angle) * distance;
          const newZ = npc.position.z + Math.sin(angle) * distance;

          // Keep within bounds
          const clampedX = Math.max(-45, Math.min(45, newX));
          const clampedZ = Math.max(-45, Math.min(45, newZ));

          get().updateNPC(id, {
            position: { ...npc.position, x: clampedX, z: clampedZ },
            rotation: angle,
          });
        }
        break;

      case "patrol":
        if (npc.patrolPoints && npc.patrolPoints.length > 0) {
          const currentPatrolIndex = npc.currentPatrolIndex || 0;
          const targetPoint = npc.patrolPoints[currentPatrolIndex];

          const dx = targetPoint.x - npc.position.x;
          const dz = targetPoint.z - npc.position.z;
          const distance = Math.sqrt(dx * dx + dz * dz);

          if (distance < 0.5) {
            // Reached patrol point, move to next
            const nextIndex = (currentPatrolIndex + 1) % npc.patrolPoints.length;
            get().updateNPC(id, { currentPatrolIndex: nextIndex });
          } else {
            // Move towards patrol point
            const angle = Math.atan2(dz, dx);
            const moveDistance = Math.min(npc.speed * deltaTime, distance);
            const newX = npc.position.x + Math.cos(angle) * moveDistance;
            const newZ = npc.position.z + Math.sin(angle) * moveDistance;

            get().updateNPC(id, {
              position: { ...npc.position, x: newX, z: newZ },
              rotation: angle,
            });
          }
        }
        break;

      case "idle":
      default:
        // Do nothing
        break;
    }
  },

  getNPC: (id: string) => {
    return get().npcs.get(id);
  },
}));
