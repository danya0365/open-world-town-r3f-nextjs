"use client";

import { Box, Cylinder, Sphere } from "@react-three/drei";

/**
 * Town Square Map
 * A bustling town center with buildings and decorations
 */
export function TownSquareMap() {
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
