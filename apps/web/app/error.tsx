"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    void fetch("/api/telemetry/errors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        source: "client",
        severity: "critical",
        message: error.message || "Unhandled application error",
        route: typeof window !== "undefined" ? window.location.pathname : "/",
        stack: error.stack,
        fingerprint: error.digest,
      }),
    }).catch(() => undefined);
  }, [error]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
      <Card className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Something went wrong
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          We captured this incident for review. Please retry the action.
        </p>
        <Button onClick={reset}>Try again</Button>
      </Card>
    </section>
  );
}
