"use client";

import { useState } from "react";
import { useVoiceVideoStore } from "@/src/presentation/stores/voiceVideoStore";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useMultiplayerStore } from "@/src/presentation/stores/multiplayerStore";

/**
 * Voice & Video Controls
 * UI for managing voice/video chat
 */
export function VoiceVideoControls() {
  const [isOpen, setIsOpen] = useState(true);
  const {
    isInitialized,
    isMuted,
    isCameraOn,
    isAudioEnabled,
    isVideoEnabled,
    spatialAudioEnabled,
    activeCalls,
    toggleMute,
    toggleCamera,
    toggleSpatialAudio,
    startLocalStream,
    stopLocalStream,
    qualityMode,
    setQualityMode,
  } = useVoiceVideoStore();

  const isConnected = useMultiplayerStore((state) => state.isConnected);
  const activeCallCount = activeCalls.size;

  // Don't show if not connected to multiplayer
  if (!isConnected || !isInitialized) {
    return null;
  }

  const handleToggleVoice = async () => {
    if (isAudioEnabled) {
      stopLocalStream();
    } else {
      await startLocalStream(false, true);
    }
  };

  const handleToggleVideo = async () => {
    if (isVideoEnabled) {
      // If only video is on, turn it off
      if (!isAudioEnabled) {
        stopLocalStream();
      } else {
        toggleCamera();
      }
    } else {
      // Start stream with video
      await startLocalStream(true, isAudioEnabled);
    }
  };

  const handleQualityChange = async (mode: "high" | "low") => {
    if (mode === qualityMode) {
      return;
    }

    setQualityMode(mode);
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 flex justify-center">
      {isOpen ? (
        <div className="bg-black/80 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-3 border border-white/20">
          {/* Voice Toggle */}
          <button
            onClick={handleToggleVoice}
            className={`p-3 rounded-full transition-all ${
              isAudioEnabled
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            title={isAudioEnabled ? "ปิดเสียง" : "เปิดเสียง"}
          >
            {isAudioEnabled ? (
              <Phone className="w-5 h-5 text-white" />
            ) : (
              <PhoneOff className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Mute Toggle (only show when audio is on) */}
          {isAudioEnabled && (
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-all ${
                !isMuted
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
              title={isMuted ? "เปิดไมค์" : "ปิดไมค์"}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </button>
          )}

          {/* Video Toggle */}
          <button
            onClick={handleToggleVideo}
            className={`p-3 rounded-full transition-all ${
              isVideoEnabled && isCameraOn
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            title={isVideoEnabled && isCameraOn ? "ปิดกล้อง" : "เปิดกล้อง"}
          >
            {isVideoEnabled && isCameraOn ? (
              <Video className="w-5 h-5 text-white" />
            ) : (
              <VideoOff className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Spatial Audio Toggle */}
          <button
            onClick={toggleSpatialAudio}
            className={`p-3 rounded-full transition-all ${
              spatialAudioEnabled
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            title={spatialAudioEnabled ? "ปิด Spatial Audio" : "เปิด Spatial Audio"}
          >
            {spatialAudioEnabled ? (
              <Volume2 className="w-5 h-5 text-white" />
            ) : (
              <VolumeX className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Active Calls Count */}
          {activeCalls.size > 0 && (
            <div className="ml-2 px-3 py-1 bg-green-600/30 rounded-full text-white text-sm font-medium">
              {activeCalls.size} {activeCalls.size === 1 ? "คน" : "คน"}
            </div>
          )}

          {/* Quality Mode Selector */}
          <div className="ml-4 flex items-center gap-2">
            <span className="text-xs text-white/70">โหมดคุณภาพ</span>
            <div className="flex rounded-full overflow-hidden border border-white/20">
              <button
                type="button"
                onClick={() => handleQualityChange("high")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  qualityMode === "high"
                    ? "bg-blue-600 text-white"
                    : "bg-transparent text-white/70 hover:bg-white/10"
                }`}
              >
                สูง
              </button>
              <button
                type="button"
                onClick={() => handleQualityChange("low")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  qualityMode === "low"
                    ? "bg-blue-600 text-white"
                    : "bg-transparent text-white/70 hover:bg-white/10"
                }`}
              >
                ต่ำ
              </button>
            </div>
          </div>

          {/* Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="ml-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            title="ซ่อนการควบคุม"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-black/80 backdrop-blur-sm border border-white/20 text-white/80 hover:text-white hover:bg-black/70 px-4 py-2 rounded-full flex items-center gap-2 transition-colors"
          title="แสดงการควบคุมเสียง/วิดีโอ"
        >
          <Phone className="w-5 h-5" />
          <span className="text-sm font-medium">การโทร</span>
          {activeCallCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-green-600/60 text-white rounded-full">
              {activeCallCount}
            </span>
          )}
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
