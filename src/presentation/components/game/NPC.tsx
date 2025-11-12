"use client";

import { type NPCState, NPC_TYPES } from "@/src/domain/types/npc";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Mesh } from "three";

interface NPCProps {
  npc: NPCState;
  onInteract?: (npcId: string) => void;
}

/**
 * NPC Component
 * Renders an NPC in the 3D scene
 */
export function NPC({ npc, onInteract }: NPCProps) {
  const meshRef = useRef<Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  const npcConfig = NPC_TYPES[npc.type];

  // Simple idle animation
  useFrame((state) => {
    if (meshRef.current && npc.behavior === "idle") {
      // Gentle bobbing animation
      meshRef.current.position.y =
        npc.position.y + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={[npc.position.x, npc.position.y, npc.position.z]}>
      {/* NPC Body */}
      <mesh
        ref={meshRef}
        rotation-y={npc.rotation}
        onClick={() => npc.isInteractable && onInteract?.(npc.id)}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        castShadow
      >
        <boxGeometry args={[0.6, 1.2, 0.6]} />
        <meshStandardMaterial
          color={isHovered ? "#FFFFFF" : npcConfig.color}
          emissive={isHovered ? npcConfig.color : "#000000"}
          emissiveIntensity={isHovered ? 0.3 : 0}
        />
      </mesh>

      {/* NPC Head */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={isHovered ? "#FFDDCC" : "#FFE4B5"}
          emissive={isHovered ? "#FFE4B5" : "#000000"}
          emissiveIntensity={isHovered ? 0.2 : 0}
        />
      </mesh>

      {/* Name Label */}
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.2}
        color={isHovered ? "#FFD700" : "#FFFFFF"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {npc.name}
      </Text>

      {/* Interaction Indicator */}
      {isHovered && npc.isInteractable && (
        <Text
          position={[0, 2.1, 0]}
          fontSize={0.15}
          color="#00FF00"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          [E] พูดคุย
        </Text>
      )}

      {/* Health Bar (if damaged) */}
      {npc.health < npc.maxHealth && (
        <group position={[0, 1.5, 0]}>
          {/* Background */}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.8, 0.1]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          {/* Health */}
          <mesh position={[(-0.8 / 2) * (1 - npc.health / npc.maxHealth), 0, 0.02]}>
            <planeGeometry args={[0.8 * (npc.health / npc.maxHealth), 0.08]} />
            <meshBasicMaterial color="#00FF00" />
          </mesh>
        </group>
      )}
    </group>
  );
}
