"use client";

import { useVoiceVideoStore } from "@/src/presentation/stores/voiceVideoStore";
import { useEffect, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";

/**
 * Video Grid
 * Displays video feeds from active calls
 */
export function VideoGrid() {
  const { activeCalls, localStream, isVideoEnabled, isCameraOn } = useVoiceVideoStore();
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Setup local video
  useEffect(() => {
    if (localVideoRef.current && localStream && isVideoEnabled) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoEnabled]);

  // Don't show if no video streams
  const hasVideo = (isVideoEnabled && isCameraOn) || 
    Array.from(activeCalls.values()).some(conn => 
      conn.stream?.getVideoTracks().some(track => track.enabled)
    );

  if (!hasVideo) {
    return null;
  }

  return (
    <div className="fixed top-24 right-4 z-10 flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Local Video */}
      {isVideoEnabled && isCameraOn && localStream && (
        <div className="relative bg-black rounded-lg overflow-hidden border-2 border-blue-500 w-48 h-36">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover mirror"
            style={{ transform: "scaleX(-1)" }}
          />
          <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white font-medium">
            คุณ
          </div>
        </div>
      )}

      {/* Remote Videos */}
      {Array.from(activeCalls.values()).map((connection) => (
        <RemoteVideo key={connection.peerId} connection={connection} />
      ))}
    </div>
  );
}

/**
 * Remote Video Component
 */
function RemoteVideo({
  connection,
}: {
  connection: {
    peerId: string;
    username: string;
    stream: MediaStream | null;
    volume: number;
    distance: number;
  };
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = connection.stream?.getVideoTracks().some(track => track.enabled);

  useEffect(() => {
    if (videoRef.current && connection.stream) {
      videoRef.current.srcObject = connection.stream;
    }
  }, [connection.stream]);

  if (!hasVideo) {
    return null;
  }

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700 w-48 h-36">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Username overlay */}
      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white font-medium flex items-center gap-1">
        <span>{connection.username}</span>
        
        {/* Volume indicator */}
        {connection.volume > 0 ? (
          <Mic className="w-3 h-3 text-green-400" />
        ) : (
          <MicOff className="w-3 h-3 text-red-400" />
        )}
      </div>

      {/* Spatial audio indicator */}
      {connection.distance > 0 && (
        <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white font-medium flex items-center gap-1">
          <Volume2 className="w-3 h-3" />
          <span>{Math.round(connection.distance)}m</span>
        </div>
      )}
    </div>
  );
}
