"use client";

import { Box, Cylinder, Sphere } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { useCollisionStore } from "@/src/presentation/stores/collisionStore";

/**
 * Forest Map
 * Dense woodland area with trees and nature
 */
export function ForestMap() {
  // Generate consistent tree positions
  const treePositions = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const angle = (i / 30) * Math.PI * 2;
      const radius = 8 + (i % 5) * 2; // More consistent radius
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.8 + (i % 3) * 0.2;
      return { x, z, scale, id: `tree-${i}` };
    });
  }, []);
  
  // Register obstacles on mount
  useEffect(() => {
    const addObstacle = useCollisionStore.getState().addObstacle;
    const clearObstacles = useCollisionStore.getState().clearObstacles;
    
    // Clear previous obstacles
    clearObstacles();
    
    // Register campfire area (center)
    addObstacle({
      id: "campfire",
      type: "circle",
      collider: { x: 0, z: 0, radius: 1.2 },
      name: "Campfire",
    });
    
    // Register large rocks
    const rockPositions = [
      [3, 3],
      [-4, 2],
      [2, -3],
      [-3, -4],
    ];
    
    rockPositions.forEach((pos, i) => {
      addObstacle({
        id: `rock-${i}`,
        type: "box",
        collider: { x: pos[0], z: pos[1], width: 1.5, depth: 1.5 },
        name: `Rock ${i + 1}`,
      });
    });
    
    // Register trees as circular obstacles
    treePositions.forEach((tree) => {
      addObstacle({
        id: tree.id,
        type: "circle",
        collider: { x: tree.x, z: tree.z, radius: 0.6 * tree.scale },
        name: tree.id,
      });
    });
    
    // Cleanup on unmount
    return () => {
      clearObstacles();
    };
  }, [treePositions]);
  
  return (
    <group>
      {/* Ground - Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2D5016" />
      </mesh>

      {/* Dense Trees */}
      {treePositions.map((tree) => (
          <group key={tree.id} position={[tree.x, 0, tree.z]} scale={tree.scale}>
            {/* Trunk */}
            <Cylinder args={[0.4, 0.5, 3]} position={[0, 1.5, 0]} castShadow>
              <meshStandardMaterial color="#5A3825" />
            </Cylinder>
            {/* Foliage - multiple spheres */}
            <Sphere args={[1.5]} position={[0, 3.5, 0]} castShadow>
              <meshStandardMaterial color="#1C5917" />
            </Sphere>
            <Sphere args={[1.2]} position={[0.8, 3.8, 0]} castShadow>
              <meshStandardMaterial color="#1F7A1F" />
            </Sphere>
            <Sphere args={[1]} position={[-0.6, 4, 0.5]} castShadow>
              <meshStandardMaterial color="#15803D" />
            </Sphere>
          </group>
      ))}

      {/* Bushes */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2 + Math.random();
        const radius = 5 + Math.random() * 6;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <Sphere
            key={`bush-${i}`}
            args={[0.6 + Math.random() * 0.3]}
            position={[x, 0.5, z]}
            castShadow
          >
            <meshStandardMaterial color="#166534" />
          </Sphere>
        );
      })}

      {/* Large Rocks */}
      {[
        [3, 0, 3],
        [-4, 0, 2],
        [2, 0, -3],
        [-3, 0, -4],
      ].map((pos, i) => (
        <Box
          key={`rock-${i}`}
          args={[1 + Math.random(), 0.8 + Math.random() * 0.5, 1 + Math.random()]}
          position={pos as [number, number, number]}
          rotation={[0, Math.random() * Math.PI, 0]}
          castShadow
        >
          <meshStandardMaterial color="#6B7280" />
        </Box>
      ))}

      {/* Clearing in the center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[4]} />
        <meshStandardMaterial color="#4D7C0F" />
      </mesh>

      {/* Campfire in center */}
      <group position={[0, 0, 0]}>
        {/* Stones around fire */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 0.8;
          const z = Math.sin(angle) * 0.8;
          return (
            <Box
              key={`stone-${i}`}
              args={[0.3, 0.3, 0.3]}
              position={[x, 0.15, z]}
              rotation={[Math.random(), Math.random(), Math.random()]}
              castShadow
            >
              <meshStandardMaterial color="#78716C" />
            </Box>
          );
        })}
        {/* Fire */}
        <Sphere args={[0.3]} position={[0, 0.3, 0]}>
          <meshStandardMaterial
            color="#F97316"
            emissive="#DC2626"
            emissiveIntensity={1.5}
          />
        </Sphere>
      </group>

      {/* Mushrooms */}
      {Array.from({ length: 15 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 6 + Math.random() * 8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group key={`mushroom-${i}`} position={[x, 0, z]} scale={0.3}>
            <Cylinder args={[0.2, 0.15, 0.8]} position={[0, 0.4, 0]}>
              <meshStandardMaterial color="#F5F5DC" />
            </Cylinder>
            <Sphere args={[0.4]} position={[0, 0.9, 0]} scale={[1, 0.6, 1]}>
              <meshStandardMaterial color="#DC2626" />
            </Sphere>
          </group>
        );
      })}
    </group>
  );
}
