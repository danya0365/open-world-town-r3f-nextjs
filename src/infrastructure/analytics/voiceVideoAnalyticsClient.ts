interface VoiceVideoAnalyticsEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface VoiceVideoAnalyticsTransport {
  send: (event: VoiceVideoAnalyticsEvent) => Promise<void> | void;
}

class ConsoleTransport implements VoiceVideoAnalyticsTransport {
  send(event: VoiceVideoAnalyticsEvent) {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[VoiceVideoAnalytics]", event);
    }
  }
}

class BatchedFetchTransport implements VoiceVideoAnalyticsTransport {
  private readonly endpoint: string;
  private readonly buffer: VoiceVideoAnalyticsEvent[] = [];
  private flushTimer: number | null = null;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  send(event: VoiceVideoAnalyticsEvent) {
    this.buffer.push(event);
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.flushTimer !== null || typeof window === "undefined") {
      return;
    }

    this.flushTimer = window.setTimeout(() => {
      this.flushTimer = null;
      void this.flush();
    }, 2500);
  }

  private async flush() {
    if (this.buffer.length === 0) {
      return;
    }

    const events = this.buffer.splice(0, this.buffer.length);

    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.warn("⚠️ VoiceVideoAnalytics failed to send events", error);
      this.buffer.unshift(...events);
      this.scheduleFlush();
    }
  }
}

class VoiceVideoAnalyticsClient {
  private transports: VoiceVideoAnalyticsTransport[] = [];
  private initialized = false;

  registerTransport(transport: VoiceVideoAnalyticsTransport) {
    this.transports.push(transport);
  }

  initializeDefaultTransports(endpoint?: string) {
    if (this.initialized) {
      return;
    }

    this.registerTransport(consoleAnalyticsTransport);

    if (endpoint) {
      this.registerTransport(createBatchedFetchTransport(endpoint));
    }

    this.initialized = true;
  }

  track(type: string, payload: Record<string, unknown>) {
    const event: VoiceVideoAnalyticsEvent = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.transports.forEach((transport) => {
      try {
        transport.send(event);
      } catch (error) {
        console.error("VoiceVideoAnalytics transport error", error);
      }
    });
  }
}

export const voiceVideoAnalytics = new VoiceVideoAnalyticsClient();
export const consoleAnalyticsTransport = new ConsoleTransport();
export const createBatchedFetchTransport = (endpoint: string) =>
  new BatchedFetchTransport(endpoint);

export const initializeVoiceVideoAnalytics = () => {
  if (typeof window === "undefined") {
    return;
  }

  const endpoint = process.env.NEXT_PUBLIC_VOICE_VIDEO_ANALYTICS_ENDPOINT;
  voiceVideoAnalytics.initializeDefaultTransports(endpoint);
};
