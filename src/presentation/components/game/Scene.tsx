"use client";

import { usePlayerStore } from "@/src/presentation/stores/playerStore";
import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Grid } from "./Grid";
import { Player } from "./Player";
import { MultiplayerPlayers } from "./MultiplayerPlayers";

/**
 * Scene Component
 * Sets up the 3D scene with camera, lights, and game objects
 */
export function Scene() {
  const playerPosition = usePlayerStore((state) => state.position);

  // Update camera to follow player (Pure top-down view with locked angle)
  useFrame(({ camera }) => {
    // Smooth camera follow - follow player X and Z, keep Y fixed for top-down view
    const targetX = playerPosition[0];
    const targetZ = playerPosition[2];
    const cameraHeight = 10; // Fixed height for top-down view

    // Smoothly interpolate camera position
    camera.position.x += (targetX - camera.position.x) * 0.1;
    camera.position.y = cameraHeight; // Keep camera at fixed height
    camera.position.z += (targetZ - camera.position.z) * 0.1;

    // Always look straight down (top-down view) at player position
    camera.lookAt(targetX, 0, targetZ);

    // Force lock camera rotation - prevent any tilting or rolling
    // This ensures pure top-down view regardless of movement
    camera.rotation.x = -Math.PI / 2; // Look straight down
    camera.rotation.z = 0; // No roll
  });

  return (
    <>
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
