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
  q: boolean; // Zoom out in dragon-quest mode
  e: boolean; // Zoom in in dragon-quest mode
}

/**
 * Controls Hook
 * Manages keyboard input for player movement
 */
export function useControls() {
  const { cycleMode, mode, rotateDragonQuestCamera, zoomDragonQuestCamera } = useCameraStore();
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
    q: false,
    e: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "a" || key === "s" || key === "d") {
        setKeys((prev) => ({ ...prev, [key]: true }));
      }
      if (key.startsWith("arrow")) {
        // In dragon-quest mode, arrow left/right rotate camera
        if (mode === "dragon-quest" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
          if (e.key === "ArrowLeft") {
            rotateDragonQuestCamera("left");
          } else {
            rotateDragonQuestCamera("right");
          }
          e.preventDefault();
        } else {
          setKeys((prev) => ({ ...prev, [e.key]: true }));
        }
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
      // Zoom controls for dragon-quest mode
      if (key === "q") {
        if (mode === "dragon-quest") {
          zoomDragonQuestCamera("out");
        }
        setKeys((prev) => ({ ...prev, q: true }));
      }
      if (key === "e") {
        if (mode === "dragon-quest") {
          zoomDragonQuestCamera("in");
        }
        setKeys((prev) => ({ ...prev, e: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "a" || key === "s" || key === "d") {
        setKeys((prev) => ({ ...prev, [key]: false }));
      }
      if (key.startsWith("arrow")) {
        // Don't track arrow keys in dragon-quest mode for left/right
        if (!(mode === "dragon-quest" && (e.key === "ArrowLeft" || e.key === "ArrowRight"))) {
          setKeys((prev) => ({ ...prev, [e.key]: false }));
        }
      }
      if (key === "shift") {
        setKeys((prev) => ({ ...prev, shift: false }));
      }
      if (key === " ") {
        setKeys((prev) => ({ ...prev, space: false }));
      }
      if (key === "q") {
        setKeys((prev) => ({ ...prev, q: false }));
      }
      if (key === "e") {
        setKeys((prev) => ({ ...prev, e: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [cycleMode, mode, rotateDragonQuestCamera, zoomDragonQuestCamera]);

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
            {cameraMode === "dragon-quest" ? (
              <>
                <div>
                  <span className="text-yellow-400">↑ Arrow:</span> Move Forward
                </div>
                <div>
                  <span className="text-yellow-400">↓ Arrow:</span> Move Backward
                </div>
                <div>
                  <span className="text-yellow-400">← → Arrows:</span> Rotate Camera (45°)
                </div>
                <div>
                  <span className="text-yellow-400">Q / E:</span> Zoom Out / In
                </div>
                <div>
                  <span className="text-yellow-400">WASD:</span> Move
                </div>
                <div>
                  <span className="text-yellow-400">Shift:</span> Sprint
                </div>
                <div>
                  <span className="text-yellow-400">C:</span> Cycle Camera
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-yellow-400">WASD / Arrow Keys:</span> Move
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
              </>
            )}
          </div>

          {/* Camera Mode Switcher */}
          <div className="mt-3 pt-3 border-t border-white/30">
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <Camera size={14} />
              <span>Camera Mode</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCameraMode("top-down")}
                className={`px-3 py-2 rounded text-xs transition-all ${
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
                className={`px-3 py-2 rounded text-xs transition-all ${
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
                className={`px-3 py-2 rounded text-xs transition-all ${
                  cameraMode === "third-person"
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
                title="Third-Person View"
              >
                👤 3rd
              </button>
              <button
                onClick={() => setCameraMode("dragon-quest")}
                className={`px-3 py-2 rounded text-xs transition-all ${
                  cameraMode === "dragon-quest"
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
                title="Dragon Quest View (Rotatable)"
              >
                🐉 DQ
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
