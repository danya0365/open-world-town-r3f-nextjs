"use client";

import { useFrame } from "@react-three/fiber";
import { usePlayerStore } from "@/src/presentation/stores/playerStore";
import { useControls } from "./Controls";
import { useRef } from "react";
import type { Mesh } from "three";

/**
 * Player Component
 * Renders the player character and handles movement
 */
export function Player() {
  const meshRef = useRef<Mesh>(null);
  const { position, rotation, isMoving, movePlayer } = usePlayerStore();
  const keys = useControls();

  // Update player position based on input
  useFrame(() => {
    let dx = 0;
    let dz = 0;

    // Calculate movement direction
    if (keys.w || keys.ArrowUp) dz -= 1;
    if (keys.s || keys.ArrowDown) dz += 1;
    if (keys.a || keys.ArrowLeft) dx -= 1;
    if (keys.d || keys.ArrowRight) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dz !== 0) {
      dx *= 0.707; // 1/√2
      dz *= 0.707;
    }

    // Move player
    if (dx !== 0 || dz !== 0) {
      movePlayer([dx, dz], keys.shift);
    } else {
      usePlayerStore.setState({ isMoving: false });
    }

    // Update mesh position
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.rotation.y = rotation;
    }
  });

  return (
    <group>
      {/* Player Body */}
      <mesh ref={meshRef} position={position} castShadow>
        <boxGeometry args={[0.8, 1.6, 0.8]} />
        <meshStandardMaterial color={isMoving ? "#4CAF50" : "#2196F3"} />
      </mesh>

      {/* Player Head */}
      <mesh position={[position[0], position[1] + 1.2, position[2]]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>

      {/* Direction Indicator */}
      <mesh
        position={[
          position[0] + Math.sin(rotation) * 0.6,
          position[1] + 0.8,
          position[2] + Math.cos(rotation) * 0.6,
        ]}
      >
        <coneGeometry args={[0.2, 0.4, 8]} />
        <meshStandardMaterial color="#FF5722" />
      </mesh>

      {/* Shadow Circle */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[position[0], 0.01, position[2]]}
      >
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}
