"use client";

import { useEffect } from "react";

type ErrorTelemetryPayload = {
  source: "client";
  severity: "info" | "warning" | "critical";
  message: string;
  route?: string;
  stack?: string;
  fingerprint?: string;
};

function toFingerprint(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return `client-${Math.abs(hash)}`;
}

function postErrorTelemetry(payload: ErrorTelemetryPayload) {
  void fetch("/api/telemetry/errors", {
    method: "POST",
    headers: { "content-type": "application/json" },
    keepalive: true,
    body: JSON.stringify(payload),
  }).catch(() => undefined);
}

export function ClientErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const message = event.message?.trim() || "Unknown client runtime error";
      const route = window.location.pathname;
      const stack = event.error instanceof Error ? event.error.stack : undefined;
      postErrorTelemetry({
        source: "client",
        severity: "warning",
        message,
        route,
        stack,
        fingerprint: toFingerprint(`${message}:${route}`),
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        typeof reason === "string"
          ? reason
          : reason instanceof Error
            ? reason.message
            : "Unhandled promise rejection";
      const stack = reason instanceof Error ? reason.stack : undefined;
      const route = window.location.pathname;
      postErrorTelemetry({
        source: "client",
        severity: "critical",
        message: message.trim() || "Unhandled promise rejection",
        route,
        stack,
        fingerprint: toFingerprint(`${message}:${route}:promise`),
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
