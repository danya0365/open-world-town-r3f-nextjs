"use client";

import { usePlayerStore } from "@/src/presentation/stores/playerStore";
import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";
import { useCollisionStore } from "@/src/presentation/stores/collisionStore";
import { useNPCStore } from "@/src/presentation/stores/npcStore";
import { Circle, Box } from "@react-three/drei";
import { useMemo } from "react";
import type { BoxCollider, CircleCollider } from "@/src/presentation/utils/collision";

/**
 * Collision Debug Visualizer
 * Shows collision radius around players, NPCs, and obstacles for debugging
 */
export function CollisionDebug() {
  const playerPosition = usePlayerStore((state) => state.position);
  const collisionRadius = usePlayerStore((state) => state.collisionRadius);
  const enablePlayerCollision = usePlayerStore(
    (state) => state.enablePlayerCollision
  );
  const players = useMultiplayerStore((state) => state.players);
  const obstacles = useCollisionStore((state) => state.obstacles);
  const npcs = useNPCStore((state) => state.npcs);

  const otherPlayers = useMemo(() => {
    return Array.from(players.values());
  }, [players]);
  
  const npcList = useMemo(() => {
    return Array.from(npcs.values());
  }, [npcs]);

  if (!enablePlayerCollision) {
    return null;
  }

  return (
    <group>
      {/* Local player collision circle */}
      <Circle
        args={[collisionRadius, 32]}
        position={[playerPosition[0], 0.01, playerPosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial color="#00ff00" transparent opacity={0.2} />
      </Circle>

      {/* Other players collision circles */}
      {otherPlayers.map((player) => (
        <Circle
          key={player.id}
          args={[collisionRadius, 32]}
          position={[player.x, 0.01, player.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial color="#ff0000" transparent opacity={0.2} />
        </Circle>
      ))}
      
      {/* NPC collision circles */}
      {npcList.map((npc) => (
        <Circle
          key={npc.id}
          args={[0.4, 32]}
          position={[npc.position.x, 0.01, npc.position.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial color="#00ffff" transparent opacity={0.25} />
        </Circle>
      ))}
      
      {/* Obstacles collision visualization */}
      {obstacles.map((obstacle) => {
        if (obstacle.type === "box") {
          const box = obstacle.collider as BoxCollider;
          return (
            <Box
              key={obstacle.id}
              args={[box.width, 0.1, box.depth]}
              position={[box.x, 0.05, box.z]}
            >
              <meshBasicMaterial color="#ffff00" transparent opacity={0.15} wireframe />
            </Box>
          );
        } else if (obstacle.type === "circle") {
          const circle = obstacle.collider as CircleCollider;
          return (
            <Circle
              key={obstacle.id}
              args={[circle.radius, 32]}
              position={[circle.x, 0.02, circle.z]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <meshBasicMaterial color="#ff00ff" transparent opacity={0.15} />
            </Circle>
          );
        }
        return null;
      })}
    </group>
  );
}
