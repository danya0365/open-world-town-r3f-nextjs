import { create } from "zustand";
import type { MediaConnection } from "peerjs";
import { peerClient } from "@/src/infrastructure/webrtc/PeerClient";

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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 640, height: 480 } : false,
        audio: audio
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false,
      });

      set({
        localStream: stream,
        isAudioEnabled: audio,
        isVideoEnabled: video,
        isMuted: !audio,
        isCameraOn: video,
      });

      console.log("✅ Local stream started");
      return stream;
    } catch (error) {
      console.error("❌ Failed to get user media:", error);
      return null;
    }
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
}));
