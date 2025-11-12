"use client";

import { useEffect, useState } from "react";
import { usePlayerStore } from "@/src/presentation/stores/playerStore";
import { useCameraStore } from "@/src/presentation/stores/cameraStore";
import { Camera, Eye } from "lucide-react";

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
  const { cycleMode } = useCameraStore();
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
      if (key === "c") {
        cycleMode();
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
  }, [cycleMode]);

  return keys;
}

/**
 * Controls Info Panel
 * Displays keyboard controls for the player
 */
export function ControlsInfo() {
  const { enablePlayerCollision, togglePlayerCollision } = usePlayerStore();
  const { mode: cameraMode, setMode: setCameraMode, cycleMode } = useCameraStore();
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
            <div>
              <span className="text-yellow-400">C:</span> Cycle Camera
            </div>
          </div>

          {/* Camera Mode Switcher */}
          <div className="mt-3 pt-3 border-t border-white/30">
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <Camera size={14} />
              <span>Camera Mode</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCameraMode("top-down")}
                className={`flex-1 px-3 py-2 rounded text-xs transition-all ${
                  cameraMode === "top-down"
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
                title="Top-Down View"
              >
                ⬇️ Top
              </button>
              <button
                onClick={() => setCameraMode("isometric")}
                className={`flex-1 px-3 py-2 rounded text-xs transition-all ${
                  cameraMode === "isometric"
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
                title="Isometric View"
              >
                📐 Iso
              </button>
              <button
                onClick={() => setCameraMode("third-person")}
                className={`flex-1 px-3 py-2 rounded text-xs transition-all ${
                  cameraMode === "third-person"
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
                title="Third-Person View"
              >
                👤 3rd
              </button>
            </div>
            <button
              onClick={cycleMode}
              className="w-full mt-2 px-3 py-2 rounded text-xs bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <Eye size={14} />
              <span>Cycle Camera (C)</span>
            </button>
          </div>

          {/* Collision Toggle */}
          <div className="mt-3 pt-3 border-t border-white/30">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-white/10 p-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={enablePlayerCollision}
                onChange={togglePlayerCollision}
                className="w-4 h-4 cursor-pointer accent-green-500"
              />
              <span className="text-sm">
                Player Collision{" "}
                <span className="text-green-400 text-xs">
                  ({enablePlayerCollision ? "ON" : "OFF"})
                </span>
              </span>
            </label>
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
