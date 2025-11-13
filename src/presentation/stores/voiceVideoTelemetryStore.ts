import { create } from "zustand";
import { voiceVideoTelemetry, type VoiceVideoTelemetryEvent } from "@/src/infrastructure/telemetry/voiceVideoTelemetry";

interface VoiceVideoTelemetryState {
  events: VoiceVideoTelemetryEvent[];
}

interface VoiceVideoTelemetryActions {
  addEvent: (event: VoiceVideoTelemetryEvent) => void;
  clear: () => void;
}

type VoiceVideoTelemetryStore = VoiceVideoTelemetryState & VoiceVideoTelemetryActions;

const MAX_EVENTS = 50;

export const useVoiceVideoTelemetryStore = create<VoiceVideoTelemetryStore>((set) => ({
  events: [],
  addEvent: (event) =>
    set((state) => {
      const next = [...state.events, event];
      if (next.length > MAX_EVENTS) {
        next.splice(0, next.length - MAX_EVENTS);
      }
      return { events: next };
    }),
  clear: () => set({ events: [] }),
}));

let telemetrySubscribed = false;

export const ensureVoiceVideoTelemetrySubscription = () => {
  if (telemetrySubscribed) {
    return;
  }

  voiceVideoTelemetry.subscribe((event) => {
    useVoiceVideoTelemetryStore.getState().addEvent(event);
  });

  telemetrySubscribed = true;
};
