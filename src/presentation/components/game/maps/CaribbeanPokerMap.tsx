"use client";

import { Box, Cylinder, MeshReflectorMaterial, Text } from "@react-three/drei";
import { useMemo } from "react";
import { Color } from "three";

const TABLE_RADIUS = 2.2;
const SEAT_COUNT = 5;
const SEAT_RING_RADIUS = TABLE_RADIUS + 1;
const CARD_PAD = 0.55;

export function CaribbeanPokerMap() {
  const seatConfigs = useMemo(() => {
    return Array.from({ length: SEAT_COUNT }).map((_, index) => {
      const angle = (index / SEAT_COUNT) * Math.PI * 2;
      const x = Math.cos(angle) * SEAT_RING_RADIUS;
      const z = Math.sin(angle) * SEAT_RING_RADIUS;
      const rotation = Math.atan2(z, x) + Math.PI; // face table center

      return {
        index,
        position: [x, 0.2, z] as [number, number, number],
        rotation,
      };
    });
  }, []);

  return (
    <group>
      {/* Subtle spotlight over the table */}
      <spotLight
        color={new Color("#FFE58A")}
        intensity={1.8}
        angle={0.85}
        penumbra={0.4}
        position={[0, 8, 0]}
        target-position={[0, 0, 0]}
        castShadow
      />

      {/* พื้นด้านล่างแบบ glossy */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          color="#1B1E2F"
          blur={[300, 100]}
          mixBlur={1}
          mixStrength={3}
          depthScale={1.2}
          minDepthThreshold={0.55}
          maxDepthThreshold={1.4}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* โต๊ะหลัก */}
      <group position={[0, 0, 0]}>
        <Cylinder args={[TABLE_RADIUS, TABLE_RADIUS, 0.35, 48]} position={[0, 0.35 / 2, 0]} castShadow>
          <meshStandardMaterial color="#111827" />
        </Cylinder>
        <Cylinder args={[TABLE_RADIUS + 0.15, TABLE_RADIUS + 0.15, 0.1, 48]} position={[0, 0.08, 0]} castShadow>
          <meshStandardMaterial color="#152C4A" />
        </Cylinder>
        <Cylinder args={[TABLE_RADIUS - 0.25, TABLE_RADIUS - 0.25, 0.08, 48]} position={[0, 0.18, 0]} castShadow>
          <meshStandardMaterial color="#0EA5E9" />
        </Cylinder>

        {/* ขอบโต๊ะ */}
        <Cylinder args={[TABLE_RADIUS + 0.3, TABLE_RADIUS + 0.3, 0.18, 48]} position={[0, 0.28, 0]} castShadow>
          <meshStandardMaterial color="#F59E0B" />
        </Cylinder>

        <Text
          position={[0, 0.55, 0]}
          fontSize={0.6}
          color="#FDE68A"
          anchorX="center"
          anchorY="middle"
        >
          Caribbean Poker
        </Text>
      </group>

      {/* Dealer station */}
      <group position={[0, 0, -TABLE_RADIUS + 0.4]}>
        <Box args={[1.2, 0.3, 0.6]} position={[0, 0.15, 0]} castShadow>
          <meshStandardMaterial color="#6B7280" />
        </Box>
        <Text
          position={[0, 0.48, 0]}
          fontSize={0.2}
          color="#E5E7EB"
          anchorX="center"
          anchorY="middle"
        >
          DEALER
        </Text>
        <mesh position={[0, 0.32, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.1, 0.5]} />
          <meshStandardMaterial color="#1F2937" emissive="#0EA5E9" emissiveIntensity={0.15} />
        </mesh>
        <Cylinder args={[0.18, 0.18, 0.1, 24]} position={[0.4, 0.3, 0.2]} castShadow>
          <meshStandardMaterial color="#F97316" />
        </Cylinder>
      </group>

      {/* Center community card spread */}
      <group position={[0, 0.24, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.3, 1.2]} />
          <meshStandardMaterial color="#0F172A" emissive="#1E293B" emissiveIntensity={0.2} />
        </mesh>
        {Array.from({ length: 5 }).map((_, cardIndex) => (
          <mesh
            key={`community-card-${cardIndex}`}
            position={[-1 + cardIndex * 0.5, 0.02, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.38, 0.6]} />
            <meshStandardMaterial color="#F8FAFC" />
          </mesh>
        ))}
        <Text
          position={[0, 0.1, -0.65]}
          fontSize={0.16}
          color="#E2E8F0"
          anchorX="center"
          anchorY="middle"
        >
          Community Cards
        </Text>
        <Cylinder args={[0.25, 0.25, 0.18, 32]} position={[0, 0.12, 0.45]} castShadow>
          <meshStandardMaterial color="#FBBF24" />
        </Cylinder>
      </group>

      {/* ที่นั่ง */}
      {seatConfigs.map(({ index, position, rotation }) => (
        <group key={`poker-seat-${index}`} position={position} rotation={[0, rotation, 0]}>
          <Cylinder args={[0.55, 0.55, 0.25, 24]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <meshStandardMaterial color="#0EA5E9" />
          </Cylinder>
          <Text
            position={[0, 0.45, 0]}
            fontSize={0.2}
            color="#F8FAFC"
            anchorX="center"
            anchorY="middle"
          >
            Seat {index + 1}
          </Text>
          <mesh position={[0, 0.35, CARD_PAD]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.9, 0.6]} />
            <meshStandardMaterial
              color="#111827"
              transparent
              opacity={0.85}
              emissive="#22D3EE"
              emissiveIntensity={0.12}
            />
          </mesh>
          <Cylinder args={[0.14, 0.14, 0.16, 20]} position={[0.3, 0.3, CARD_PAD - 0.2]} castShadow>
            <meshStandardMaterial color="#F97316" />
          </Cylinder>
          <Text
            position={[0, 0.28, CARD_PAD + 0.05]}
            fontSize={0.11}
            color="#E0F2FE"
            anchorX="center"
            anchorY="middle"
          >
            Ante / Bet
          </Text>
        </group>
      ))}

      {/* Ambient decor */}
      <group position={[0, 0, 0]}>
        {[-6, 6].map((x, index) => (
          <group key={`bar-${index}`} position={[x, 0, 6]}>
            <Box args={[3, 2.2, 0.6]} position={[0, 1.1, 0]} castShadow>
              <meshStandardMaterial color="#1F2937" />
            </Box>
            <Box args={[3.2, 0.15, 0.8]} position={[0, 2.2, 0]}>
              <meshStandardMaterial color="#F59E0B" />
            </Box>
          </group>
        ))}

        {[-8, 8].map((x, index) => (
          <group key={`pillar-${index}`} position={[x, 0, -6]}>
            <Cylinder args={[0.6, 0.6, 3]} position={[0, 1.5, 0]} castShadow>
              <meshStandardMaterial color="#374151" />
            </Cylinder>
            <Cylinder args={[0.8, 0.8, 0.3]} position={[0, 3.15, 0]} castShadow>
              <meshStandardMaterial color="#F59E0B" />
            </Cylinder>
          </group>
        ))}
      </group>
    </group>
  );
}
