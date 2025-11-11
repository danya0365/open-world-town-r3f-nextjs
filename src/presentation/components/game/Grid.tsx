"use client";

import { useRef } from "react";
import { Color } from "three";

interface GridProps {
  size?: number;
  divisions?: number;
  color1?: string;
  color2?: string;
}

/**
 * Grid Component
 * Renders a tile-based grid for the game world
 */
export function Grid({
  size = 50,
  divisions = 50,
  color1 = "#444444",
  color2 = "#222222",
}: GridProps) {
  const gridRef = useRef(null);

  return (
    <group>
      {/* Main Grid Helper */}
      <gridHelper
        ref={gridRef}
        args={[size, divisions, new Color(color1), new Color(color2)]}
        position={[0, 0, 0]}
      />

      {/* Center Marker */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.5]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
    </group>
  );
}
