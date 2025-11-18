"use client";

import { useCameraStore } from "@/src/presentation/stores/cameraStore";
import { RotateCcw, RotateCw, ZoomIn, ZoomOut } from "lucide-react";

/**
 * DragonQuestControls Component
 * On-screen controls for Dragon Quest camera mode
 */
export function DragonQuestControls() {
  const cameraMode = useCameraStore((state) => state.mode);
  const rotateDragonQuestCamera = useCameraStore((state) => state.rotateDragonQuestCamera);
  const zoomDragonQuestCamera = useCameraStore((state) => state.zoomDragonQuestCamera);

  // Only show in dragon-quest mode
  if (cameraMode !== "dragon-quest") {
    return null;
  }

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
      {/* Zoom Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => zoomDragonQuestCamera("out")}
          className="bg-black/70 hover:bg-black/90 text-white p-3 rounded-lg transition-colors shadow-lg"
          title="Zoom Out (Q)"
        >
          <ZoomOut size={24} />
        </button>
        <button
          onClick={() => zoomDragonQuestCamera("in")}
          className="bg-black/70 hover:bg-black/90 text-white p-3 rounded-lg transition-colors shadow-lg"
          title="Zoom In (E)"
        >
          <ZoomIn size={24} />
        </button>
      </div>

      {/* Rotate Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => rotateDragonQuestCamera("left")}
          className="bg-black/70 hover:bg-black/90 text-white p-3 rounded-lg transition-colors shadow-lg"
          title="Rotate Left 45° (Left Arrow)"
        >
          <RotateCcw size={24} />
        </button>
        <button
          onClick={() => rotateDragonQuestCamera("right")}
          className="bg-black/70 hover:bg-black/90 text-white p-3 rounded-lg transition-colors shadow-lg"
          title="Rotate Right 45° (Right Arrow)"
        >
          <RotateCw size={24} />
        </button>
      </div>
    </div>
  );
}
