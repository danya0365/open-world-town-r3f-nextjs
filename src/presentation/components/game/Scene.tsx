"use client";

import { useCameraStore } from "@/src/presentation/stores/cameraStore";
import { usePlayerStore } from "@/src/presentation/stores/playerStore";
import {
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { CollisionDebug } from "./CollisionDebug";
import { DebugStats } from "./DebugStats";
import { Grid } from "./Grid";
import { MultiplayerPlayers } from "./MultiplayerPlayers";
import { NPCManager } from "./NPCManager";
import { Player } from "./Player";

/**
 * Scene Component
 * Sets up the 3D scene with camera, lights, and game objects
 */
export function Scene() {
  const playerPosition = usePlayerStore((state) => state.position);
  const playerRotation = usePlayerStore((state) => state.rotation);
  const cameraMode = useCameraStore((state) => state.mode);
  const { camera } = useThree();

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
    }
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

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
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

      {/* Ground Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </>
  );
}
