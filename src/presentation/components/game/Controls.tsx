"use client";

import { useEffect, useState } from "react";

interface KeyState {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  ArrowUp: boolean;
  ArrowDown: boolean;
  ArrowLeft: boolean;
  ArrowRight: boolean;
  shift: boolean;
  space: boolean;
}

/**
 * Controls Hook
 * Manages keyboard input for player movement
 */
export function useControls() {
  const [keys, setKeys] = useState<KeyState>({
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    shift: false,
    space: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "a" || key === "s" || key === "d") {
        setKeys((prev) => ({ ...prev, [key]: true }));
      }
      if (key.startsWith("arrow")) {
        setKeys((prev) => ({ ...prev, [e.key]: true }));
      }
      if (key === "shift") {
        setKeys((prev) => ({ ...prev, shift: true }));
      }
      if (key === " ") {
        setKeys((prev) => ({ ...prev, space: true }));
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "a" || key === "s" || key === "d") {
        setKeys((prev) => ({ ...prev, [key]: false }));
      }
      if (key.startsWith("arrow")) {
        setKeys((prev) => ({ ...prev, [e.key]: false }));
      }
      if (key === "shift") {
        setKeys((prev) => ({ ...prev, shift: false }));
      }
      if (key === " ") {
        setKeys((prev) => ({ ...prev, space: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keys;
}

/**
 * Controls Info Panel
 * Displays keyboard controls for the player
 */
export function ControlsInfo() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      {isVisible && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg text-sm space-y-2 z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="text-green-400 font-bold">Controls</div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1">
            <div>
              <span className="text-yellow-400">WASD / Arrow Keys:</span> Move
            </div>
            <div>
              <span className="text-yellow-400">Left Click + Drag:</span> Pan Camera
            </div>
            <div>
              <span className="text-yellow-400">Scroll Wheel:</span> Zoom
            </div>
            <div>
              <span className="text-yellow-400">Shift:</span> Sprint
            </div>
            <div>
              <span className="text-yellow-400">Space:</span> Action
            </div>
          </div>
        </div>
      )}

      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm hover:bg-black/80 transition-colors z-10"
        >
          ? Controls
        </button>
      )}
    </>
  );
}
