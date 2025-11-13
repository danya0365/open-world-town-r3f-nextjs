"use client";

import { Fragment } from "react";
import { useVoiceVideoTelemetryStore } from "@/src/presentation/stores/voiceVideoTelemetryStore";

const LABEL_MAP: Record<string, string> = {
  media_request_attempt: "Attempt",
  media_request_success: "Success",
  media_request_failure: "Failure",
  media_request_exhausted: "Exhausted",
  quality_mode_changed: "Mode",
};

const VARIANT_CLASS: Record<string, string> = {
  media_request_attempt: "border-blue-400/60 bg-blue-500/15",
  media_request_success: "border-emerald-400/60 bg-emerald-500/15",
  media_request_failure: "border-red-400/60 bg-red-500/15",
  media_request_exhausted: "border-amber-400/60 bg-amber-500/15",
  quality_mode_changed: "border-purple-400/60 bg-purple-500/15",
};

export function VoiceVideoTelemetryPanel() {
  const events = useVoiceVideoTelemetryStore((state) => state.events);
  const clear = useVoiceVideoTelemetryStore((state) => state.clear);

  return (
    <div className="absolute top-4 right-4 max-h-[60vh] w-80 overflow-hidden rounded-xl border border-white/15 bg-black/80 backdrop-blur-md text-white shadow-lg z-20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
          Voice / Video Telemetry
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-white/60 hover:text-white transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="max-h-[50vh] overflow-y-auto px-4 py-3 space-y-3 text-xs">
        {events.length === 0 ? (
          <div className="text-white/60 text-center">No events yet</div>
        ) : (
          events
            .slice()
            .reverse()
            .map((event, index) => {
              const label = LABEL_MAP[event.type] ?? event.type;
              const variantClass = VARIANT_CLASS[event.type] ?? "border-white/20 bg-white/5";
              const hasError = "error" in event && event.error != null;
              const errorMessage = hasError
                ? typeof event.error === "string"
                  ? event.error
                  : JSON.stringify(event.error, null, 2)
                : null;

              return (
                <div
                  key={`${event.type}-${index}-${event.timestamp}`}
                  className={`rounded-lg border px-3 py-2 ${variantClass}`}
                >
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-white/60 mb-1">
                    <span>{label}</span>
                    <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {"quality" in event && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Quality</span>
                      <span className="font-medium text-white">{event.quality}</span>
                    </div>
                  )}
                  {"mode" in event && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Mode</span>
                      <span className="font-medium text-white">{event.mode}</span>
                    </div>
                  )}
                  {"requested" in event && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Requested</span>
                      <span className="font-medium text-white">
                        {event.requested.video ? "Video" : ""}
                        {event.requested.video && event.requested.audio ? " + " : ""}
                        {event.requested.audio ? "Audio" : ""}
                        {!event.requested.video && !event.requested.audio ? "-" : ""}
                      </span>
                    </div>
                  )}
                  {"tracks" in event && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Tracks</span>
                      <span className="font-medium text-white">
                        {event.tracks.video}V / {event.tracks.audio}A
                      </span>
                    </div>
                  )}
                  {hasError && errorMessage && (
                    <Fragment>
                      <div className="mt-2 text-white/70">Error</div>
                      <pre className="mt-1 overflow-x-auto rounded bg-black/40 p-2 text-[11px] text-red-200">
                        {errorMessage}
                      </pre>
                    </Fragment>
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
