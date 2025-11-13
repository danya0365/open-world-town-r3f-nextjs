import { create } from "zustand";
import type { MediaConnection } from "peerjs";
import { peerClient } from "@/src/infrastructure/webrtc/PeerClient";
import {
  useNotificationStore,
  type NotificationVariant,
} from "@/src/presentation/stores/notificationStore";
import {
  voiceVideoTelemetry,
  type VoiceVideoQualityLevel,
} from "@/src/infrastructure/telemetry/voiceVideoTelemetry";
import { initializeVoiceVideoAnalytics } from "@/src/infrastructure/analytics/voiceVideoAnalyticsClient";
import { ensureVoiceVideoTelemetrySubscription } from "@/src/presentation/stores/voiceVideoTelemetryStore";

type QualityMode = "high" | "low";

const HIGH_QUALITY_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 1280, max: 1920 },
  height: { ideal: 720, max: 1080 },
  frameRate: { ideal: 30, max: 60 },
  aspectRatio: { ideal: 16 / 9 },
  facingMode: "user",
};

const HIGH_QUALITY_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  sampleRate: 48000,
  channelCount: 2,
  sampleSize: 16,
  echoCancellation: { ideal: true },
  noiseSuppression: { ideal: true },
  autoGainControl: { ideal: true },
};

const LOW_QUALITY_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 640, max: 1280 },
  height: { ideal: 360, max: 720 },
  frameRate: { ideal: 24, max: 30 },
  aspectRatio: { ideal: 16 / 9 },
  facingMode: "user",
};

const LOW_QUALITY_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  sampleRate: 24000,
  channelCount: 1,
  echoCancellation: { ideal: true },
  noiseSuppression: { ideal: true },
  autoGainControl: { ideal: true },
};

const pushNotification = (
  message: string,
  variant: NotificationVariant = "info"
) => {
  useNotificationStore.getState().addNotification(message, variant);
};

const serializeError = (error: unknown) =>
  error instanceof Error
    ? { name: error.name, message: error.message }
    : error ?? "Unknown error";

initializeVoiceVideoAnalytics();
ensureVoiceVideoTelemetrySubscription();

interface MediaAttempt {
  quality: VoiceVideoQualityLevel;
  videoConstraints: MediaTrackConstraints | boolean;
  audioConstraints: MediaTrackConstraints | boolean;
  warning?: string;
}

const enhanceTrackQuality = async (
  stream: MediaStream,
  options: { video: boolean; audio: boolean }
) => {
  const enhancementPromises: Promise<void>[] = [];

  if (options.video) {
    const [videoTrack] = stream.getVideoTracks();

    if (videoTrack) {
      enhancementPromises.push(
        videoTrack
          .applyConstraints({
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 60 },
          })
          .catch((error) => {
            console.warn("⚠️ Unable to apply high-quality video constraints:", error);
          })
      );

      if ("contentHint" in videoTrack) {
        try {
          videoTrack.contentHint = "detail";
        } catch (error) {
          console.warn("⚠️ Unable to set video contentHint:", error);
        }
      }
    }
  }

  if (options.audio) {
    const [audioTrack] = stream.getAudioTracks();

    if (audioTrack) {
      enhancementPromises.push(
        audioTrack
          .applyConstraints({
            sampleRate: 48000,
            channelCount: 2,
            sampleSize: 16,
            noiseSuppression: { ideal: true },
            echoCancellation: { ideal: true },
            autoGainControl: { ideal: true },
          })
          .catch((error) => {
            console.warn("⚠️ Unable to apply high-quality audio constraints:", error);
          })
      );

      if ("contentHint" in audioTrack) {
        try {
          audioTrack.contentHint = "speech";
        } catch (error) {
          console.warn("⚠️ Unable to set audio contentHint:", error);
        }
      }
    }
  }

  if (enhancementPromises.length > 0) {
    await Promise.all(enhancementPromises);
  }
};

interface PeerConnection {
  peerId: string;
  username: string;
  call: MediaConnection;
  stream: MediaStream | null;
  volume: number; // 0-1, for spatial audio
  distance: number; // Distance from local player
}

interface VoiceVideoStore {
  // State
  isInitialized: boolean;
  myPeerId: string | null;
  localStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  activeCalls: Map<string, PeerConnection>;
  spatialAudioEnabled: boolean;
  maxAudioDistance: number; // Max distance to hear other players
  qualityMode: QualityMode;
  
  // Actions
  initialize: (userId: string) => Promise<void>;
  cleanup: () => void;
  startLocalStream: (video: boolean, audio: boolean) => Promise<MediaStream | null>;
  stopLocalStream: () => void;
  callPeer: (peerId: string, username: string) => void;
  answerCall: (call: MediaConnection) => void;
  hangupCall: (peerId: string) => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleSpatialAudio: () => void;
  updatePeerDistance: (peerId: string, distance: number) => void;
  setMaxAudioDistance: (distance: number) => void;
  setQualityMode: (mode: QualityMode) => void;
}

/**
 * Voice & Video Store
 * Manages WebRTC connections and spatial audio
 */
export const useVoiceVideoStore = create<VoiceVideoStore>((set, get) => ({
  // Initial State
  isInitialized: false,
  myPeerId: null,
  localStream: null,
  isAudioEnabled: false,
  isVideoEnabled: false,
  isMuted: false,
  isCameraOn: false,
  activeCalls: new Map(),
  spatialAudioEnabled: true,
  maxAudioDistance: 15, // Units in game world
  qualityMode: "high",

  // Initialize PeerJS
  initialize: async (userId: string) => {
    try {
      const peer = await peerClient.initialize(userId);
      
      // Setup incoming call handler
      peer.on("call", (call) => {
        console.log("📞 Incoming call from:", call.peer);
        get().answerCall(call);
      });

      set({
        isInitialized: true,
        myPeerId: peer.id,
      });

      console.log("✅ Voice/Video initialized");
    } catch (error) {
      console.error("❌ Failed to initialize Voice/Video:", error);
    }
  },

  // Cleanup
  cleanup: () => {
    const state = get();
    
    // Stop local stream
    state.stopLocalStream();
    
    // Hangup all calls
    state.activeCalls.forEach((conn) => {
      conn.call.close();
      if (conn.stream) {
        conn.stream.getTracks().forEach((track) => track.stop());
      }
    });
    
    // Disconnect peer
    peerClient.disconnect();
    
    set({
      isInitialized: false,
      myPeerId: null,
      activeCalls: new Map(),
    });
  },

  // Start local media stream
  startLocalStream: async (video: boolean, audio: boolean) => {
    const state = get();
    const warnings: string[] = [];
    const requested = { video, audio };

    const addWarning = (message: string) => {
      if (!warnings.includes(message)) {
        warnings.push(message);
      }
    };

    if (state.localStream) {
      state.localStream.getTracks().forEach((track) => track.stop());
    }

    const requestStream = async (
      videoConstraints: MediaTrackConstraints | boolean,
      audioConstraints: MediaTrackConstraints | boolean
    ) =>
      navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: audioConstraints,
      });

    const attempts: MediaAttempt[] = [];

    if (video || audio) {
      if (state.qualityMode === "high") {
        attempts.push({
          quality: "high",
          videoConstraints: video ? HIGH_QUALITY_VIDEO_CONSTRAINTS : false,
          audioConstraints: audio ? HIGH_QUALITY_AUDIO_CONSTRAINTS : false,
        });
      }

      const lowWarning = state.qualityMode === "high"
        ? video && audio
          ? "ไม่สามารถเปิดกล้องและไมค์คุณภาพสูงได้ ระบบจะลดคุณภาพเพื่อรักษาประสิทธิภาพเกม"
          : video
            ? "ไม่สามารถเปิดกล้องคุณภาพสูงได้ ระบบจะลดคุณภาพวิดีโอเพื่อรักษาประสิทธิภาพเกม"
            : audio
              ? "ไม่สามารถเปิดไมค์คุณภาพสูงได้ ระบบจะลดคุณภาพเสียงเพื่อรักษาประสิทธิภาพเกม"
              : undefined
        : undefined;

      attempts.push({
        quality: "low",
        videoConstraints: video ? LOW_QUALITY_VIDEO_CONSTRAINTS : false,
        audioConstraints: audio ? LOW_QUALITY_AUDIO_CONSTRAINTS : false,
        warning: lowWarning,
      });
    }

    if (video && audio) {
      attempts.push({
        quality: "audio-only",
        videoConstraints: false,
        audioConstraints: LOW_QUALITY_AUDIO_CONSTRAINTS,
        warning: "ไม่สามารถเปิดกล้องได้ ระบบจะใช้เฉพาะเสียง",
      });

      attempts.push({
        quality: "video-only",
        videoConstraints: LOW_QUALITY_VIDEO_CONSTRAINTS,
        audioConstraints: false,
        warning: "ไม่สามารถเปิดไมค์ได้ ระบบจะเปิดเฉพาะวิดีโอ",
      });
    }

    let stream: MediaStream | null = null;
    let appliedQuality: VoiceVideoQualityLevel | null = null;

    for (const attempt of attempts) {
      voiceVideoTelemetry.log({
        type: "media_request_attempt",
        quality: attempt.quality,
        requested,
        timestamp: new Date().toISOString(),
      });

      try {
        const result = await requestStream(
          attempt.videoConstraints,
          attempt.audioConstraints
        );

        stream = result;
        appliedQuality = attempt.quality;

        voiceVideoTelemetry.log({
          type: "media_request_success",
          quality: attempt.quality,
          tracks: {
            audio: result.getAudioTracks().length,
            video: result.getVideoTracks().length,
          },
          timestamp: new Date().toISOString(),
        });

        if (attempt.warning) {
          addWarning(attempt.warning);
        }

        break;
      } catch (error) {
        voiceVideoTelemetry.log({
          type: "media_request_failure",
          quality: attempt.quality,
          error: serializeError(error),
          timestamp: new Date().toISOString(),
        });

        console.warn("⚠️ Media attempt failed:", attempt.quality, error);
      }
    }

    if (!stream) {
      voiceVideoTelemetry.log({
        type: "media_request_exhausted",
        requested,
        timestamp: new Date().toISOString(),
      });

      pushNotification(
        "ไม่สามารถเปิดเสียงหรือวิดีโอได้ กรุณาตรวจสอบอุปกรณ์ สิทธิ์การเข้าถึง และลองใหม่อีกครั้ง",
        "error"
      );

      set({
        localStream: null,
        isAudioEnabled: false,
        isVideoEnabled: false,
        isMuted: true,
        isCameraOn: false,
      });

      return null;
    }

    const hasAudio = stream.getAudioTracks().length > 0;
    const hasVideo = stream.getVideoTracks().length > 0;

    if (video && !hasVideo) {
      addWarning("ไม่สามารถเปิดกล้องได้ ระบบจะปิดวิดีโอเพื่อรักษาประสิทธิภาพเกม");
    }

    if (audio && !hasAudio) {
      addWarning("ไม่สามารถเปิดไมค์ได้ ระบบจะปิดเสียงเพื่อรักษาประสิทธิภาพเกม");
    }

    if (appliedQuality === "high") {
      await enhanceTrackQuality(stream, { video: hasVideo, audio: hasAudio });
    }

    set({
      localStream: stream,
      isAudioEnabled: hasAudio,
      isVideoEnabled: hasVideo,
      isMuted: !hasAudio,
      isCameraOn: hasVideo,
    });

    warnings.forEach((message) => pushNotification(message, "warning"));

    console.log("✅ Local stream started");
    return stream;
  },

  // Stop local stream
  stopLocalStream: () => {
    const state = get();
    
    if (state.localStream) {
      state.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      
      set({
        localStream: null,
        isAudioEnabled: false,
        isVideoEnabled: false,
      });
    }
  },

  // Call a peer
  callPeer: (peerId: string, username: string) => {
    const state = get();
    
    if (!state.localStream) {
      console.error("No local stream available");
      return;
    }

    const call = peerClient.call(peerId, state.localStream);
    
    if (!call) {
      console.error("Failed to create call");
      return;
    }

    // Handle incoming stream
    call.on("stream", (remoteStream) => {
      console.log(`📹 Received stream from ${peerId}`);
      
      const newCalls = new Map(state.activeCalls);
      newCalls.set(peerId, {
        peerId,
        username,
        call,
        stream: remoteStream,
        volume: 1,
        distance: 0,
      });
      
      set({ activeCalls: newCalls });
      
      // Apply spatial audio
      if (state.spatialAudioEnabled) {
        get().updatePeerDistance(peerId, 0);
      }
    });

    call.on("close", () => {
      console.log(`📴 Call with ${peerId} closed`);
      get().hangupCall(peerId);
    });

    call.on("error", (error) => {
      console.error(`❌ Call error with ${peerId}:`, error);
      get().hangupCall(peerId);
    });
  },

  // Answer incoming call
  answerCall: (call: MediaConnection) => {
    const state = get();
    
    if (!state.localStream) {
      // Start stream if not available
      state.startLocalStream(false, true).then((stream) => {
        if (stream) {
          call.answer(stream);
        }
      });
      return;
    }

    // Answer with local stream
    call.answer(state.localStream);

    // Handle incoming stream
    call.on("stream", (remoteStream) => {
      console.log(`📹 Received stream from ${call.peer}`);
      
      const newCalls = new Map(state.activeCalls);
      newCalls.set(call.peer, {
        peerId: call.peer,
        username: "Unknown", // Will be updated from multiplayer store
        call,
        stream: remoteStream,
        volume: 1,
        distance: 0,
      });
      
      set({ activeCalls: newCalls });
    });

    call.on("close", () => {
      console.log(`📴 Call with ${call.peer} closed`);
      get().hangupCall(call.peer);
    });
  },

  // Hangup call
  hangupCall: (peerId: string) => {
    const state = get();
    const connection = state.activeCalls.get(peerId);
    
    if (connection) {
      connection.call.close();
      
      if (connection.stream) {
        connection.stream.getTracks().forEach((track) => track.stop());
      }
      
      const newCalls = new Map(state.activeCalls);
      newCalls.delete(peerId);
      set({ activeCalls: newCalls });
    }
  },

  // Toggle mute
  toggleMute: () => {
    const state = get();
    
    if (state.localStream) {
      const audioTracks = state.localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = state.isMuted;
      });
      
      set({ isMuted: !state.isMuted });
    }
  },

  // Toggle camera
  toggleCamera: () => {
    const state = get();
    
    if (state.localStream) {
      const videoTracks = state.localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = state.isCameraOn;
      });
      
      set({ isCameraOn: !state.isCameraOn });
    }
  },

  // Toggle spatial audio
  toggleSpatialAudio: () => {
    const state = get();
    set({ spatialAudioEnabled: !state.spatialAudioEnabled });
    
    // Reset volumes if disabling
    if (!state.spatialAudioEnabled) {
      const newCalls = new Map(state.activeCalls);
      newCalls.forEach((conn) => {
        conn.volume = 1;
      });
      set({ activeCalls: newCalls });
    }
  },

  // Update peer distance for spatial audio
  updatePeerDistance: (peerId: string, distance: number) => {
    const state = get();
    const connection = state.activeCalls.get(peerId);
    
    if (!connection || !connection.stream || !state.spatialAudioEnabled) {
      return;
    }

    // Calculate volume based on distance
    const maxDistance = state.maxAudioDistance;
    let volume = 1;
    
    if (distance > maxDistance) {
      volume = 0; // Too far, mute
    } else if (distance > 0) {
      // Linear falloff
      volume = 1 - (distance / maxDistance);
      // Apply curve for more natural sound
      volume = Math.pow(volume, 2);
    }

    // Apply volume to audio track
    const audioTracks = connection.stream.getAudioTracks();
    if (audioTracks.length > 0 && (audioTracks[0] as any).volume !== undefined) {
      (audioTracks[0] as any).volume = volume;
    }

    // Update state
    const newCalls = new Map(state.activeCalls);
    const updatedConn = newCalls.get(peerId);
    if (updatedConn) {
      updatedConn.volume = volume;
      updatedConn.distance = distance;
      set({ activeCalls: newCalls });
    }
  },

  // Set max audio distance
  setMaxAudioDistance: (distance: number) => {
    set({ maxAudioDistance: distance });
  },

  setQualityMode: (mode: QualityMode) => {
    const state = get();

    if (state.qualityMode === mode) {
      return;
    }

    const hadStream = Boolean(state.localStream);
    const prevVideoEnabled = state.isVideoEnabled;
    const prevAudioEnabled = state.isAudioEnabled;

    set({ qualityMode: mode });

    voiceVideoTelemetry.log({
      type: "quality_mode_changed",
      mode,
      timestamp: new Date().toISOString(),
    });

    pushNotification(
      mode === "high"
        ? "ตั้งค่าโหมดคุณภาพเป็น สูง (ภาพและเสียงจะคมชัดมากขึ้น)"
        : "ตั้งค่าโหมดคุณภาพเป็น ต่ำ (ช่วยประหยัดแบนด์วิดท์และรักษาเฟรมเรตเกม)",
      "info"
    );

    if (hadStream) {
      void get()
        .startLocalStream(prevVideoEnabled, prevAudioEnabled)
        .catch((error) => {
          console.error("❌ Failed to restart stream after quality change:", error);
          pushNotification(
            "ไม่สามารถรีสตาร์ทสตรีมหลังเปลี่ยนโหมดคุณภาพได้",
            "error"
          );
        });
    }
  },
}));
