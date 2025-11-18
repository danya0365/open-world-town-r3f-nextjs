"use client";

import { useFrame } from "@react-three/fiber";
import { usePlayerStore } from "@/src/presentation/stores/playerStore";
import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";
import { useCameraStore } from "@/src/presentation/stores/cameraStore";
import { useControls } from "./Controls";
import { CharacterModel } from "./CharacterModel";
import { useRef, useMemo } from "react";
import type { Mesh } from "three";
import * as THREE from "three";
import type { CharacterType } from "./CharacterSelection";

/**
 * Player Component
 * Renders the player character and handles movement
 */
export function Player() {
  const meshRef = useRef<Mesh>(null);
  const headRef = useRef<Mesh>(null);
  const { position, rotation, isMoving, movePlayer } = usePlayerStore();
  const { sendMove, isConnected, room } = useMultiplayerStore();
  const cameraMode = useCameraStore((state) => state.mode);
  const dragonQuestAngle = useCameraStore((state) => state.dragonQuestAngle);
  const thirdPersonAngle = useCameraStore((state) => state.thirdPersonAngle);
  const rotateThirdPersonCamera = useCameraStore((state) => state.rotateThirdPersonCamera);
  const keys = useControls();
  
  // Get player's character type from room state
  const characterType = useMemo<CharacterType>(() => {
    if (isConnected && room?.state?.players) {
      const myPlayer = Array.from(room.state.players.values()).find(
        (p: any) => p.id === room.sessionId
      );
      return (myPlayer?.characterType as CharacterType) || "warrior";
    }
    return "warrior";
  }, [isConnected, room]);
  
  // Animation state
  const animTime = useRef(0);
  
  // Color lerp for smooth transitions
  const bodyColor = useMemo(() => new THREE.Color(), []);
  const targetColor = isMoving ? "#4CAF50" : "#2196F3";

  // Update player position based on input
  useFrame((_, delta) => {
    animTime.current += delta;
    let dx = 0;
    let dz = 0;

    // Third-Person Mode: Camera-relative controls with smooth rotation
    if (cameraMode === "third-person") {
      // Arrow left/right: Rotate camera smoothly
      const rotationSpeed = 2.5; // radians per second
      if (keys.ArrowLeft) {
        rotateThirdPersonCamera(rotationSpeed * delta);
      } else if (keys.ArrowRight) {
        rotateThirdPersonCamera(-rotationSpeed * delta);
      }
      
      // Arrow up/down: Move forward/backward relative to camera angle
      if (keys.ArrowUp) {
        dx = -Math.sin(thirdPersonAngle);
        dz = -Math.cos(thirdPersonAngle);
      } else if (keys.ArrowDown) {
        dx = Math.sin(thirdPersonAngle);
        dz = Math.cos(thirdPersonAngle);
      }
      
      // WASD still works normally in third-person mode
      if (keys.w) dz -= 1;
      if (keys.s) dz += 1;
      if (keys.a) dx -= 1;
      if (keys.d) dx += 1;
    } 
    // Dragon Quest Mode: Different controls
    else if (cameraMode === "dragon-quest") {
      // In Dragon Quest mode:
      // - Arrow Up: Move forward (in the direction camera is facing)
      // - Arrow Down: Turn around and move backward
      // - Arrow Left/Right: Rotate camera (handled in Controls.tsx)
      
      if (keys.ArrowUp) {
        // Move forward relative to camera angle
        dx = -Math.sin(dragonQuestAngle);
        dz = -Math.cos(dragonQuestAngle);
      } else if (keys.ArrowDown) {
        // Move backward (turn around)
        dx = Math.sin(dragonQuestAngle);
        dz = Math.cos(dragonQuestAngle);
      }
      
      // WASD still works normally in dragon-quest mode
      if (keys.w) dz -= 1;
      if (keys.s) dz += 1;
      if (keys.a) dx -= 1;
      if (keys.d) dx += 1;
    } else {
      // Standard controls for other camera modes
      // Calculate movement direction
      if (keys.w || keys.ArrowUp) dz -= 1;
      if (keys.s || keys.ArrowDown) dz += 1;
      if (keys.a || keys.ArrowLeft) dx -= 1;
      if (keys.d || keys.ArrowRight) dx += 1;
    }

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
      
      // Body color animation
      bodyColor.lerp(new THREE.Color(targetColor), 0.1);
      if (meshRef.current.material) {
        (meshRef.current.material as THREE.MeshStandardMaterial).color = bodyColor;
      }
    }
    
    // Head bobbing animation when moving
    if (headRef.current && isMoving) {
      const bobAmount = Math.sin(animTime.current * 10) * 0.05;
      headRef.current.position.y = 1.2 + bobAmount;
    } else if (headRef.current) {
      // Return to original position
      headRef.current.position.y = 1.2;
    }

    // Send position to server (throttled by frame rate)
    if (isConnected) {
      sendMove(position, rotation, isMoving);
    }
  });

  return (
    <group ref={meshRef} position={position} rotation-y={rotation}>
      {/* Character Model */}
      <CharacterModel 
        characterType={characterType} 
        isMoving={isMoving}
        headYOffset={headRef.current ? headRef.current.position.y : 1.2}
      />

      {/* Direction Indicator */}
      <mesh position={[0, 0.8, 0.6]}>
        <coneGeometry args={[0.2, 0.4, 8]} />
        <meshStandardMaterial color="#FF5722" />
      </mesh>

      {/* Shadow Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}
