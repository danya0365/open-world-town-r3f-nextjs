"use client";

import { Box, Cylinder, Sphere } from "@react-three/drei";
import { useEffect } from "react";
import { useCollisionStore } from "@/src/presentation/stores/collisionStore";

/**
 * Town Square Map
 * A bustling town center with buildings and decorations
 */
export function TownSquareMap() {
  // Register obstacles on mount
  useEffect(() => {
    const addObstacle = useCollisionStore.getState().addObstacle;
    const clearObstacles = useCollisionStore.getState().clearObstacles;
    
    // Clear previous obstacles
    clearObstacles();
    
    // Register fountain (center)
    addObstacle({
      id: "fountain",
      type: "circle",
      collider: { x: 0, z: 0, radius: 1.8 },
      name: "Fountain",
    });
    
    // Register buildings
    addObstacle({
      id: "building-north",
      type: "box",
      collider: { x: 0, z: -8, width: 4, depth: 3 },
      name: "Building North",
    });
    
    addObstacle({
      id: "building-south",
      type: "box",
      collider: { x: 0, z: 8, width: 5, depth: 3 },
      name: "Building South",
    });
    
    addObstacle({
      id: "building-east",
      type: "box",
      collider: { x: 8, z: 0, width: 3, depth: 4 },
      name: "Building East",
    });
    
    addObstacle({
      id: "building-west",
      type: "box",
      collider: { x: -8, z: 0, width: 3, depth: 3.5 },
      name: "Building West",
    });
    
    // Register market stalls
    addObstacle({
      id: "stall-1",
      type: "box",
      collider: { x: 5, z: 5, width: 1.5, depth: 1.5 },
      name: "Market Stall 1",
    });
    
    addObstacle({
      id: "stall-2",
      type: "box",
      collider: { x: -5, z: 5, width: 1.5, depth: 1.5 },
      name: "Market Stall 2",
    });
    
    // Register trees
    const treePositions = [
      [-10, -10],
      [10, -10],
      [-10, 10],
      [10, 10],
    ];
    
    treePositions.forEach((pos, i) => {
      addObstacle({
        id: `tree-${i}`,
        type: "circle",
        collider: { x: pos[0], z: pos[1], radius: 1.3 },
        name: `Tree ${i + 1}`,
      });
    });
    
    // Register street lamps
    const lampPositions = [
      [4, -4],
      [-4, -4],
      [4, 4],
      [-4, 4],
    ];
    
    lampPositions.forEach((pos, i) => {
      addObstacle({
        id: `lamp-${i}`,
        type: "circle",
        collider: { x: pos[0], z: pos[1], radius: 0.3 },
        name: `Street Lamp ${i + 1}`,
      });
    });
    
    // Cleanup on unmount
    return () => {
      clearObstacles();
    };
  }, []);
  
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* Town Square Center - Fountain */}
      <group position={[0, 0, 0]}>
        <Cylinder args={[1.5, 1.5, 0.5]} position={[0, 0.25, 0]} castShadow>
          <meshStandardMaterial color="#6B7280" />
        </Cylinder>
        <Cylinder args={[0.8, 0.8, 1.5]} position={[0, 1, 0]} castShadow>
          <meshStandardMaterial color="#9CA3AF" />
        </Cylinder>
        <Sphere args={[0.3]} position={[0, 1.8, 0]} castShadow>
          <meshStandardMaterial color="#60A5FA" emissive="#3B82F6" emissiveIntensity={0.5} />
        </Sphere>
      </group>

      {/* Buildings */}
      {/* Building 1 - North */}
      <Box args={[4, 3, 3]} position={[0, 1.5, -8]} castShadow>
        <meshStandardMaterial color="#DC2626" />
      </Box>
      <Box args={[4, 0.3, 3.2]} position={[0, 3.2, -8]} castShadow>
        <meshStandardMaterial color="#7C2D12" />
      </Box>

      {/* Building 2 - South */}
      <Box args={[5, 2.5, 3]} position={[0, 1.25, 8]} castShadow>
        <meshStandardMaterial color="#2563EB" />
      </Box>
      <Box args={[5, 0.3, 3.2]} position={[0, 2.75, 8]} castShadow>
        <meshStandardMaterial color="#1E3A8A" />
      </Box>

      {/* Building 3 - East */}
      <Box args={[3, 4, 4]} position={[8, 2, 0]} castShadow>
        <meshStandardMaterial color="#059669" />
      </Box>
      <Box args={[3.2, 0.3, 4.2]} position={[8, 4.2, 0]} castShadow>
        <meshStandardMaterial color="#064E3B" />
      </Box>

      {/* Building 4 - West */}
      <Box args={[3, 3.5, 3.5]} position={[-8, 1.75, 0]} castShadow>
        <meshStandardMaterial color="#7C3AED" />
      </Box>
      <Box args={[3.2, 0.3, 3.7]} position={[-8, 3.65, 0]} castShadow>
        <meshStandardMaterial color="#4C1D95" />
      </Box>

      {/* Market Stalls */}
      <group position={[5, 0, 5]}>
        <Box args={[1.5, 1.5, 1.5]} position={[0, 0.75, 0]} castShadow>
          <meshStandardMaterial color="#92400E" />
        </Box>
        <Box args={[2, 0.1, 2]} position={[0, 1.6, 0]} castShadow>
          <meshStandardMaterial color="#F59E0B" />
        </Box>
      </group>

      <group position={[-5, 0, 5]}>
        <Box args={[1.5, 1.5, 1.5]} position={[0, 0.75, 0]} castShadow>
          <meshStandardMaterial color="#92400E" />
        </Box>
        <Box args={[2, 0.1, 2]} position={[0, 1.6, 0]} castShadow>
          <meshStandardMaterial color="#EF4444" />
        </Box>
      </group>

      {/* Street Lamps */}
      {[
        [4, 0, -4],
        [-4, 0, -4],
        [4, 0, 4],
        [-4, 0, 4],
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <Cylinder args={[0.1, 0.1, 3]} position={[0, 1.5, 0]} castShadow>
            <meshStandardMaterial color="#4B5563" />
          </Cylinder>
          <Sphere args={[0.3]} position={[0, 3.2, 0]} castShadow>
            <meshStandardMaterial color="#FCD34D" emissive="#F59E0B" emissiveIntensity={0.8} />
          </Sphere>
        </group>
      ))}

      {/* Trees */}
      {[
        [-10, 0, -10],
        [10, 0, -10],
        [-10, 0, 10],
        [10, 0, 10],
      ].map((pos, i) => (
        <group key={`tree-${i}`} position={pos as [number, number, number]}>
          <Cylinder args={[0.3, 0.3, 2]} position={[0, 1, 0]} castShadow>
            <meshStandardMaterial color="#78350F" />
          </Cylinder>
          <Sphere args={[1.2]} position={[0, 2.5, 0]} castShadow>
            <meshStandardMaterial color="#16A34A" />
          </Sphere>
        </group>
      ))}
    </group>
  );
}
