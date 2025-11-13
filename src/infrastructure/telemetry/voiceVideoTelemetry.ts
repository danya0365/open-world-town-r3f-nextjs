import { voiceVideoAnalytics } from "@/src/infrastructure/analytics/voiceVideoAnalyticsClient";

export type VoiceVideoQualityLevel = "high" | "low" | "audio-only" | "video-only";

export type VoiceVideoTelemetryEvent =
  | {
      type: "media_request_attempt";
      quality: VoiceVideoQualityLevel;
      requested: { audio: boolean; video: boolean };
      timestamp: string;
    }
  | {
      type: "media_request_success";
      quality: VoiceVideoQualityLevel;
      tracks: { audio: number; video: number };
      timestamp: string;
    }
  | {
      type: "media_request_failure";
      quality: VoiceVideoQualityLevel;
      error: unknown;
      timestamp: string;
    }
  | {
      type: "media_request_exhausted";
      requested: { audio: boolean; video: boolean };
      timestamp: string;
    }
  | {
      type: "quality_mode_changed";
      mode: "high" | "low";
      timestamp: string;
    };

type VoiceVideoTelemetryListener = (event: VoiceVideoTelemetryEvent) => void;

class VoiceVideoTelemetry {
  private listeners = new Set<VoiceVideoTelemetryListener>();

  subscribe(listener: VoiceVideoTelemetryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  log(event: VoiceVideoTelemetryEvent): void {
    if (process.env.NODE_ENV !== "production") {
      console.info("[VoiceVideoTelemetry]", event);
    }

    const { type, ...payload } = event;
    voiceVideoAnalytics.track(type, payload);

    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("VoiceVideoTelemetry listener error", error);
      }
    });
  }
}

export const voiceVideoTelemetry = new VoiceVideoTelemetry();
