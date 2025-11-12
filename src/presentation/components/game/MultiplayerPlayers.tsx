"use client";

import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";
import { Billboard, Text } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

/**
 * Linear interpolation helper
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Angle interpolation (handles wrapping around 2π)
 */
function lerpAngle(start: number, end: number, t: number): number {
  // Normalize angles to 0-2π
  start = ((start % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  end = ((end % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

  // Find shortest path
  let diff = end - start;
  if (diff > Math.PI) {
    diff -= Math.PI * 2;
  } else if (diff < -Math.PI) {
    diff += Math.PI * 2;
  }

  return start + diff * t;
}

/**
 * Single Multiplayer Player Component with Network Interpolation
 * Renders other players in the game with smooth movement
 */
function MultiplayerPlayer({
  username,
  x,
  y,
  z,
  rotation,
  isMoving,
}: {
  username: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  isMoving: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<any>(null);
  
  // Current interpolated position
  const currentPos = useRef({ x, y, z, rotation });
  
  // Target position from network
  const targetPos = useRef({ x, y, z, rotation });
  
  // Animation state
  const animTime = useRef(0);

  // Update target when props change
  targetPos.current = { x, y, z, rotation };

  // Smooth interpolation every frame
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    animTime.current += delta;

    const lerpSpeed = 0.2; // Higher = faster, more responsive
    const rotLerpSpeed = 0.25;

    // Interpolate position
    currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, lerpSpeed);
    currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, lerpSpeed);
    currentPos.current.z = lerp(currentPos.current.z, targetPos.current.z, lerpSpeed);
    
    // Interpolate rotation
    currentPos.current.rotation = lerpAngle(
      currentPos.current.rotation,
      targetPos.current.rotation,
      rotLerpSpeed
    );

    // Apply to group
    groupRef.current.position.set(
      currentPos.current.x,
      currentPos.current.y,
      currentPos.current.z
    );
    
    // Head bobbing animation when moving
    if (headRef.current && isMoving) {
      const bobAmount = Math.sin(animTime.current * 10) * 0.05;
      headRef.current.position.y = 1.2 + bobAmount;
    } else if (headRef.current) {
      headRef.current.position.y = 1.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Player Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 1.6, 0.8]} />
        <meshStandardMaterial color={isMoving ? "#FF9800" : "#9C27B0"} />
      </mesh>

      {/* Player Head */}
      <mesh ref={headRef} position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#E91E63" />
      </mesh>

      {/* Direction Indicator */}
      <mesh
        position={[
          Math.sin(currentPos.current.rotation) * 0.6,
          0.8,
          Math.cos(currentPos.current.rotation) * 0.6,
        ]}
      >
        <coneGeometry args={[0.2, 0.4, 8]} />
        <meshStandardMaterial color="#FF5722" />
      </mesh>

      {/* Shadow Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>

      {/* Username Label Billboard */}
      <Billboard position={[0, 2.5, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
        <mesh>
          <planeGeometry args={[username.length * 0.2 + 0.8, 0.4]} />
          <meshBasicMaterial color="#000000" opacity={0.7} transparent />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.25}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {username}
        </Text>
      </Billboard>
    </group>
  );
}

/**
 * Multiplayer Players Component
 * Renders all other players in the game
 */
export function MultiplayerPlayers() {
  const { players, myPlayerId, isConnected } = useMultiplayerStore();

  // Filter out own player and convert to array
  const otherPlayers = useMemo(() => {
    if (!isConnected || !myPlayerId) return [];

    return Array.from(players.entries())
      .filter(([id]) => id !== myPlayerId)
      .map(([sessionId, player]) => ({
        sessionId,
        username: player.username,
        x: player.x,
        y: player.y,
        z: player.z,
        rotation: player.rotation,
        isMoving: player.isMoving,
      }));
  }, [players, myPlayerId, isConnected]);

  if (!isConnected || otherPlayers.length === 0) {
    return null;
  }

  return (
    <group name="multiplayer-players">
      {otherPlayers.map((player) => (
        <MultiplayerPlayer
          key={player.sessionId}
          username={player.username}
          x={player.x}
          y={player.y}
          z={player.z}
          rotation={player.rotation}
          isMoving={player.isMoving}
        />
      ))}
    </group>
  );
}
