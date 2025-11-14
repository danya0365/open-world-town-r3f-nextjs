"use client";

import { Box, Cylinder, Sphere, Text } from "@react-three/drei";
import { usePlayerStore } from "@/src/presentation/stores/playerStore";
import { useTableStore } from "@/src/presentation/stores/tableStore";
import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

/**
 * Town Square Map
 * A bustling town center with buildings and decorations
 */
export function TownSquareMap() {
  const playerPosition = usePlayerStore((state) => state.position);
  const seats = useTableStore((state) => state.seats);
  const leaveSeat = useTableStore((state) => state.leaveSeat);
  const setFocusedSeat = useTableStore((state) => state.setFocusedSeat);
  const focusedSeatIndex = useTableStore((state) => state.focusedSeatIndex);
  const myPlayerId = useMultiplayerStore((state) => state.myPlayerId);
  const players = useMultiplayerStore((state) => state.players);

  const tablePosition = useMemo(() => new Vector3(-2, 0, 2), []);
  const seatOffsets = useMemo<readonly Vector3[]>(
    () => [
      new Vector3(-1.2, 0, 0),
      new Vector3(-0.4, 0, 1.1),
      new Vector3(0.8, 0, 1.1),
      new Vector3(1.6, 0, 0),
      new Vector3(0.2, 0, -1.2),
    ],
    []
  );

  useFrame(() => {
    const playerVec = new Vector3(playerPosition[0], playerPosition[1], playerPosition[2]);
    const interactionRadius = 0.85;
    let nearestIndex: number | null = null;
    let nearestDistance = interactionRadius;

    seatOffsets.forEach((offset, index) => {
      const seatPosition = tablePosition.clone().add(offset);
      const distance = seatPosition.distanceTo(playerVec);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    const currentFocus = useTableStore.getState().focusedSeatIndex;
    if (nearestIndex !== currentFocus) {
      setFocusedSeat(nearestIndex);
    }
  });

  useEffect(() => {
    return () => {
      setFocusedSeat(null);
    };
  });

  useEffect(() => {
    // ออกจากที่นั่งเมื่อผู้เล่นไม่มี session แล้ว (เช่น disconnect)
    if (!myPlayerId) {
      leaveSeat();
    }
  }, [myPlayerId, leaveSeat]);

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

      {/* Caribbean Poker Table */}
      <group position={tablePosition.toArray() as [number, number, number]}>
        {/* โต๊ะหลัก */}
        <Cylinder args={[2.5, 2.5, 0.3, 32]} position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <meshStandardMaterial color="#1F2937" />
        </Cylinder>
        <Cylinder args={[2.7, 2.7, 0.1, 32]} position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
          <meshStandardMaterial color="#10B981" />
        </Cylinder>

        {/* ป้ายชื่อโต๊ะ */}
        <Text position={[0, 0.6, 0]} fontSize={0.4} color="#FBBF24" anchorX="center" anchorY="middle">
          Caribbean Poker
        </Text>

        {/* พื้นที่รอบโต๊ะ */}
        <Cylinder args={[3.2, 3.2, 0.05, 32]} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
          <meshStandardMaterial color="#374151" />
        </Cylinder>

        {/* ที่นั่ง */}
        {seatOffsets.map((offset, index) => {
          const seatPosition = offset.clone().setY(0.2);
          const occupant = seats[index]?.playerId ?? null;
          const isOccupied = Boolean(occupant);
          const isFocused = index === focusedSeatIndex;
          const occupantName =
            occupant && players.get(occupant)
              ? players.get(occupant)?.username
              : undefined;
          const seatLabel = `Seat ${index + 1}`;

          return (
            <group key={`seat-${index}`} position={seatPosition.toArray() as [number, number, number]}>
              <Cylinder args={[0.4, 0.4, 0.2, 16]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <meshStandardMaterial
                  color={isOccupied ? "#EF4444" : "#38BDF8"}
                  emissive={isFocused ? "#22D3EE" : "#000000"}
                  emissiveIntensity={isFocused ? 0.4 : 0}
                />
              </Cylinder>
              <Text
                position={[0, 0.42, 0]}
                fontSize={0.16}
                color="#F8FAFC"
                anchorX="center"
                anchorY="middle"
              >
                {seatLabel}
              </Text>
              <Text
                position={[0, 0.18, 0]}
                fontSize={0.13}
                color={isOccupied ? "#FCA5A5" : "#A5F3FC"}
                anchorX="center"
                anchorY="middle"
              >
                {isOccupied
                  ? occupant === myPlayerId
                    ? "คุณกำลังนั่ง"
                    : occupantName ?? "มีผู้เล่น"
                  : "ว่าง"}
              </Text>
            </group>
          );
        })}
      </group>
    </group>
  );
}
