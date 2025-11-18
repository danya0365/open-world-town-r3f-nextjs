"use client";

import { useRef } from "react";
import { useCameraStore, type CameraMode } from "@/src/presentation/stores/cameraStore";
import { usePlayerStore } from "@/src/presentation/stores/playerStore";
import { useGameStore } from "@/src/presentation/stores/gameStore";
import {
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { CollisionDebug } from "./CollisionDebug";
import { DebugStats } from "./DebugStats";
import { Grid } from "./Grid";
import { MultiplayerPlayers } from "./MultiplayerPlayers";
import { NPCManager } from "./NPCManager";
import { Player } from "./Player";
import {
  MapManager,
  getAmbientLightColor,
  getDirectionalLightColor,
} from "./MapManager";

/**
 * Scene Component
 * Sets up the 3D scene with camera, lights, and game objects
 */
export function Scene() {
  const playerPosition = usePlayerStore((state) => state.position);
  const playerRotation = usePlayerStore((state) => state.rotation);
  const cameraMode = useCameraStore((state) => state.mode);
  const dragonQuestAngle = useCameraStore((state) => state.dragonQuestAngle);
  const dragonQuestDistance = useCameraStore((state) => state.dragonQuestDistance);
  const mapName = useGameStore((state) => state.mapName);
  const { camera } = useThree();
  const dragonQuestFocusRef = useRef(new Vector3(playerPosition[0], 0.5, playerPosition[2]));
  const dragonQuestDesiredRef = useRef(new Vector3());
  const previousCameraMode = useRef<CameraMode | null>(null);

  // Update camera to follow player with different modes
  useFrame(() => {
    const targetX = playerPosition[0];
    const targetZ = playerPosition[2];
    const smoothing = 0.1;

    switch (cameraMode) {
      case "top-down": {
        // Orthographic top-down view
        const cameraHeight = 10;
        camera.position.x += (targetX - camera.position.x) * smoothing;
        camera.position.y = cameraHeight;
        camera.position.z += (targetZ - camera.position.z) * smoothing;
        camera.lookAt(targetX, 0, targetZ);

        // Force camera to look straight down
        camera.rotation.x = -Math.PI / 2;
        camera.rotation.z = 0;
        break;
      }

      case "isometric": {
        // Isometric view (45-degree angle)
        const distance = 12;
        const offsetX = Math.sin(Math.PI / 4) * distance;
        const offsetZ = Math.cos(Math.PI / 4) * distance;
        const height = distance * 0.7;

        const camX = targetX + offsetX;
        const camY = height;
        const camZ = targetZ + offsetZ;

        camera.position.x += (camX - camera.position.x) * smoothing;
        camera.position.y += (camY - camera.position.y) * smoothing;
        camera.position.z += (camZ - camera.position.z) * smoothing;
        camera.lookAt(targetX, 0, targetZ);
        break;
      }

      case "third-person": {
        // Third-person view (behind player)
        const distance = 6;
        const height = 3;

        // Calculate camera position behind player based on player rotation
        const camX = targetX - Math.sin(playerRotation) * distance;
        const camZ = targetZ - Math.cos(playerRotation) * distance;
        const camY = height;

        camera.position.x += (camX - camera.position.x) * smoothing;
        camera.position.y += (camY - camera.position.y) * smoothing;
        camera.position.z += (camZ - camera.position.z) * smoothing;

        // Look at a point slightly above the player
        camera.lookAt(targetX, 0.5, targetZ);
        break;
      }

      case "dragon-quest": {
        // Dragon Quest style view (rotatable 45-degree increments)
        const height = dragonQuestDistance * 0.6; // Height based on distance
        const focus = dragonQuestFocusRef.current;
        const desiredFocus = dragonQuestDesiredRef.current.set(
          playerPosition[0],
          0.5,
          playerPosition[2]
        );

        if (previousCameraMode.current !== "dragon-quest") {
          focus.copy(desiredFocus);
        } else {
          focus.lerp(desiredFocus, smoothing);
        }

        // Calculate camera position based on angle and distance
        const offsetX = Math.sin(dragonQuestAngle) * dragonQuestDistance;
        const offsetZ = Math.cos(dragonQuestAngle) * dragonQuestDistance;

        camera.position.set(
          focus.x + offsetX,
          height,
          focus.z + offsetZ
        );

        // Look at the smoothed focus point to keep orientation stable
        camera.lookAt(focus.x, focus.y, focus.z);
        break;
      }
    }

    previousCameraMode.current = cameraMode;
  });

  return (
    <>
      {/* Dynamic Camera based on mode */}
      {cameraMode === "top-down" ? (
        <OrthographicCamera
          makeDefault
          zoom={50}
          position={[playerPosition[0], 10, playerPosition[2]]}
          near={0.1}
          far={1000}
        />
      ) : (
        <PerspectiveCamera
          makeDefault
          fov={50}
          position={[playerPosition[0], 10, playerPosition[2]]}
          near={0.1}
          far={1000}
        />
      )}

      {/* Debug Stats - Collects performance data */}
      <DebugStats />

      {/* Dynamic Lighting based on Map */}
      <ambientLight color={getAmbientLightColor(mapName)} intensity={0.6} />
      <directionalLight
        color={getDirectionalLightColor(mapName)}
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <hemisphereLight
        args={["#87CEEB", "#228B22", 0.3]}
        position={[0, 50, 0]}
      />

      {/* Camera Controls - Disabled to prevent angle changes */}
      {/* Using manual camera control in useFrame instead */}
      <OrbitControls
        enabled={false} // Completely disable orbit controls to lock camera angle
        enableRotate={false}
        enablePan={false}
        enableZoom={false}
      />

      {/* Grid */}
      <Grid />

      {/* Player */}
      <Player />

      {/* Multiplayer Players */}
      <MultiplayerPlayers />

      {/* Collision Debug Visualization */}
      <CollisionDebug />

      {/* NPCs */}
      <NPCManager />

      {/* Dynamic Map Environment */}
      <MapManager />
    </>
  );
}
