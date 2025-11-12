"use client";

import { Box, Cylinder, Sphere } from "@react-three/drei";

/**
 * Snow Land Map
 * Frozen tundra with ice and snow
 */
export function SnowLandMap() {
  return (
    <group>
      {/* Ground - Snow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#E0F2FE" />
      </mesh>

      {/* Snow Mounds */}
      {Array.from({ length: 15 }).map((_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const radius = 10 + Math.random() * 8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const scale = 1.5 + Math.random() * 1.5;

        return (
          <Sphere
            key={`mound-${i}`}
            args={[1.5]}
            position={[x, 0, z]}
            scale={[scale, 0.6, scale]}
            receiveShadow
          >
            <meshStandardMaterial color="#F0F9FF" />
          </Sphere>
        );
      })}

      {/* Frozen Lake in center */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <circleGeometry args={[4]} />
          <meshStandardMaterial
            color="#BAE6FD"
            emissive="#0EA5E9"
            emissiveIntensity={0.2}
            opacity={0.8}
            transparent
          />
        </mesh>
      </group>

      {/* Pine Trees */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 8 + Math.random() * 10;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const scale = 0.7 + Math.random() * 0.5;

        return (
          <group key={`tree-${i}`} position={[x, 0, z]} scale={scale}>
            {/* Trunk */}
            <Cylinder args={[0.3, 0.4, 2.5]} position={[0, 1.25, 0]} castShadow>
              <meshStandardMaterial color="#4C3228" />
            </Cylinder>
            {/* Pine Layers */}
            <Cylinder
              args={[0, 1.2, 2]}
              position={[0, 2.5, 0]}
              castShadow
            >
              <meshStandardMaterial color="#0F4C3A" />
            </Cylinder>
            <Cylinder
              args={[0, 1, 1.5]}
              position={[0, 3.2, 0]}
              castShadow
            >
              <meshStandardMaterial color="#115E4B" />
            </Cylinder>
            <Cylinder
              args={[0, 0.7, 1]}
              position={[0, 3.8, 0]}
              castShadow
            >
              <meshStandardMaterial color="#14735D" />
            </Cylinder>
            {/* Snow on top */}
            <Sphere args={[0.4]} position={[0, 4.3, 0]} castShadow>
              <meshStandardMaterial color="#FFFFFF" />
            </Sphere>
          </group>
        );
      })}

      {/* Snowmen */}
      {[
        [5, 0, 5],
        [-5, 0, 5],
        [5, 0, -5],
      ].map((pos, i) => (
        <group key={`snowman-${i}`} position={pos as [number, number, number]}>
          {/* Bottom sphere */}
          <Sphere args={[0.8]} position={[0, 0.8, 0]} castShadow>
            <meshStandardMaterial color="#FAFAFA" />
          </Sphere>
          {/* Middle sphere */}
          <Sphere args={[0.6]} position={[0, 1.8, 0]} castShadow>
            <meshStandardMaterial color="#FAFAFA" />
          </Sphere>
          {/* Head */}
          <Sphere args={[0.4]} position={[0, 2.6, 0]} castShadow>
            <meshStandardMaterial color="#FAFAFA" />
          </Sphere>
          {/* Eyes */}
          <Sphere args={[0.08]} position={[-0.15, 2.7, 0.35]} castShadow>
            <meshStandardMaterial color="#000000" />
          </Sphere>
          <Sphere args={[0.08]} position={[0.15, 2.7, 0.35]} castShadow>
            <meshStandardMaterial color="#000000" />
          </Sphere>
          {/* Nose - Carrot */}
          <Cylinder
            args={[0.05, 0.15, 0.5]}
            position={[0, 2.6, 0.45]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <meshStandardMaterial color="#F97316" />
          </Cylinder>
          {/* Arms */}
          <Cylinder
            args={[0.05, 0.05, 1.2]}
            position={[-0.7, 1.8, 0]}
            rotation={[0, 0, -Math.PI / 4]}
            castShadow
          >
            <meshStandardMaterial color="#78350F" />
          </Cylinder>
          <Cylinder
            args={[0.05, 0.05, 1.2]}
            position={[0.7, 1.8, 0]}
            rotation={[0, 0, Math.PI / 4]}
            castShadow
          >
            <meshStandardMaterial color="#78350F" />
          </Cylinder>
        </group>
      ))}

      {/* Ice Crystals */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 6 + Math.random() * 8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <Box
            key={`crystal-${i}`}
            args={[0.3, 1 + Math.random() * 0.5, 0.3]}
            position={[x, 0.6, z]}
            rotation={[0, Math.random() * Math.PI, 0]}
            castShadow
          >
            <meshStandardMaterial
              color="#7DD3FC"
              emissive="#0EA5E9"
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </Box>
        );
      })}

      {/* Ice Blocks */}
      {[
        [8, 0, -8],
        [-8, 0, -8],
        [-8, 0, 8],
      ].map((pos, i) => (
        <Box
          key={`iceblock-${i}`}
          args={[2, 1.5, 2]}
          position={pos as [number, number, number]}
          rotation={[0, Math.random() * 0.5, 0]}
          castShadow
        >
          <meshStandardMaterial
            color="#BAE6FD"
            transparent
            opacity={0.7}
            emissive="#0EA5E9"
            emissiveIntensity={0.1}
          />
        </Box>
      ))}

      {/* Igloos */}
      <group position={[-10, 0, 0]}>
        <Sphere args={[1.5]} position={[0, 1, 0]} scale={[1, 0.8, 1]} castShadow>
          <meshStandardMaterial color="#E0F2FE" />
        </Sphere>
        <Box args={[0.8, 1.2, 0.3]} position={[0, 0.6, 1.4]} castShadow>
          <meshStandardMaterial color="#000000" />
        </Box>
      </group>
    </group>
  );
}
