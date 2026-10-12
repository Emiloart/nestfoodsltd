"use client";

import { useEffect, useEffectEvent } from "react";

// Initial requests are cancelled on unmount; state changes happen after the response.
export function useInitialJsonRequest<T>(
  url: string,
  onSuccess: (data: T) => void,
  onError: (message: string) => void,
) {
  const receive = useEffectEvent(onSuccess);
  const fail = useEffectEvent(onError);
  useEffect(() => {
    const controller = new AbortController();
    void fetch(url, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? "Unable to load this page. Please try again.");
        }
        return response.json() as Promise<T>;
      })
      .then((data) => {
        if (!controller.signal.aborted) receive(data);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          fail(error instanceof Error ? error.message : "Unable to load this page.");
      });
    return () => controller.abort();
  }, [url]);
}
