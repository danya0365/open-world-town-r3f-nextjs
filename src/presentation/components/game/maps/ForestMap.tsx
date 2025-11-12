"use client";

import { Box, Cylinder, Sphere } from "@react-three/drei";

/**
 * Forest Map
 * Dense woodland area with trees and nature
 */
export function ForestMap() {
  return (
    <group>
      {/* Ground - Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2D5016" />
      </mesh>

      {/* Dense Trees */}
      {Array.from({ length: 30 }).map((_, i) => {
        const angle = (i / 30) * Math.PI * 2;
        const radius = 8 + Math.random() * 10;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const scale = 0.8 + Math.random() * 0.6;

        return (
          <group key={`tree-${i}`} position={[x, 0, z]} scale={scale}>
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
        );
      })}

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
