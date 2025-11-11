"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Scene } from "./Scene";

/**
 * Game Canvas Component
 * Main React Three Fiber canvas for the game
 * Follows Atomic Design pattern - Organism level
 */
export function GameCanvas() {
  return (
    <div className="relative w-full h-screen bg-gray-900">
      <Canvas
        camera={{
          position: [0, 10, 0],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        shadows
        gl={{
          antialias: true,
          alpha: false,
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
