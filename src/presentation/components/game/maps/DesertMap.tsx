"use client";

import { Box, Cylinder, Sphere } from "@react-three/drei";

/**
 * Desert Map
 * Sandy dunes and oasis
 */
export function DesertMap() {
  return (
    <group>
      {/* Ground - Sand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>

      {/* Sand Dunes */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 12 + Math.random() * 8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const scale = 2 + Math.random() * 2;

        return (
          <Sphere
            key={`dune-${i}`}
            args={[2]}
            position={[x, -0.5, z]}
            scale={[scale, 1, scale]}
            receiveShadow
          >
            <meshStandardMaterial color="#E5C29F" />
          </Sphere>
        );
      })}

      {/* Oasis in center */}
      <group position={[0, 0, 0]}>
        {/* Water */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
          <circleGeometry args={[3.5]} />
          <meshStandardMaterial
            color="#0EA5E9"
            emissive="#0284C7"
            emissiveIntensity={0.3}
            opacity={0.9}
            transparent
          />
        </mesh>

        {/* Palm Trees around oasis */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * 3;
          const z = Math.sin(angle) * 3;

          return (
            <group key={`palm-${i}`} position={[x, 0, z]}>
              {/* Trunk */}
              <Cylinder args={[0.25, 0.3, 4]} position={[0, 2, 0]} castShadow>
                <meshStandardMaterial color="#92400E" />
              </Cylinder>
              {/* Palm Leaves */}
              {Array.from({ length: 8 }).map((_, j) => {
                const leafAngle = (j / 8) * Math.PI * 2;
                const lx = Math.cos(leafAngle) * 0.3;
                const lz = Math.sin(leafAngle) * 0.3;
                return (
                  <Box
                    key={`leaf-${j}`}
                    args={[0.2, 1.5, 0.1]}
                    position={[lx, 4.2, lz]}
                    rotation={[
                      Math.cos(leafAngle) * 0.5,
                      leafAngle,
                      Math.sin(leafAngle) * 0.5,
                    ]}
                    castShadow
                  >
                    <meshStandardMaterial color="#15803D" />
                  </Box>
                );
              })}
            </group>
          );
        })}

        {/* Grass around water */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = Math.random() * Math.PI * 2;
          const radius = 3.5 + Math.random() * 1;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          return (
            <Box
              key={`grass-${i}`}
              args={[0.1, 0.5, 0.1]}
              position={[x, 0.25, z]}
              rotation={[0, Math.random() * Math.PI, 0]}
              castShadow
            >
              <meshStandardMaterial color="#22C55E" />
            </Box>
          );
        })}
      </group>

      {/* Cacti scattered around */}
      {Array.from({ length: 15 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 8 + Math.random() * 10;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group key={`cactus-${i}`} position={[x, 0, z]}>
            {/* Main body */}
            <Cylinder args={[0.4, 0.4, 2]} position={[0, 1, 0]} castShadow>
              <meshStandardMaterial color="#16A34A" />
            </Cylinder>
            {/* Arms */}
            {Math.random() > 0.5 && (
              <>
                <Cylinder
                  args={[0.3, 0.3, 1]}
                  position={[-0.5, 1.2, 0]}
                  rotation={[0, 0, Math.PI / 2]}
                  castShadow
                >
                  <meshStandardMaterial color="#16A34A" />
                </Cylinder>
                <Cylinder
                  args={[0.3, 0.3, 0.8]}
                  position={[-0.9, 1.6, 0]}
                  castShadow
                >
                  <meshStandardMaterial color="#16A34A" />
                </Cylinder>
              </>
            )}
          </group>
        );
      })}

      {/* Rocks */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 10 + Math.random() * 8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <Box
            key={`rock-${i}`}
            args={[
              0.5 + Math.random() * 1,
              0.5 + Math.random() * 0.5,
              0.5 + Math.random() * 1,
            ]}
            position={[x, 0.3, z]}
            rotation={[
              Math.random() * 0.3,
              Math.random() * Math.PI,
              Math.random() * 0.3,
            ]}
            castShadow
          >
            <meshStandardMaterial color="#A8A29E" />
          </Box>
        );
      })}

      {/* Ancient Ruins */}
      <group position={[8, 0, 8]}>
        <Box args={[2, 2, 0.5]} position={[0, 1, 0]} castShadow>
          <meshStandardMaterial color="#78716C" />
        </Box>
        <Box args={[0.5, 3, 0.5]} position={[-1, 1.5, 0]} castShadow>
          <meshStandardMaterial color="#78716C" />
        </Box>
        <Box args={[0.5, 2.5, 0.5]} position={[1, 1.25, 0]} castShadow>
          <meshStandardMaterial color="#78716C" />
        </Box>
      </group>
    </group>
  );
}
