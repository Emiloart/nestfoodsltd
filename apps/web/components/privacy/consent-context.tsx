"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "nest_privacy_consent_saved";
const UPDATED_EVENT = "nestfoods:consent-updated";
const ConsentContext = createContext({ ready: false, visible: false });

export function readSavedConsentTime() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function rememberConsentTime(time: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, time);
  } catch {
    /* The server cookie still retains the preference. */
  }
  window.dispatchEvent(new Event(UPDATED_EVENT));
}

export function useConsentVisibility() {
  return useContext(ConsentContext);
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ ready: false, visible: false });
  useEffect(() => {
    const controller = new AbortController();
    let timeout: number | undefined;
    const dismiss = () => setState({ ready: true, visible: false });
    window.addEventListener(UPDATED_EVENT, dismiss);
    async function load() {
      const saved = readSavedConsentTime();
      await Promise.resolve();
      if (controller.signal.aborted) return;
      if (saved) {
        dismiss();
        return;
      }
      try {
        timeout = window.setTimeout(() => {
          if (!controller.signal.aborted) {
            setState({ ready: true, visible: true });
            controller.abort();
          }
        }, 8000);
        const response = await fetch("/api/privacy/consent", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load preferences.");
        const data = (await response.json()) as { consent: { consentedAt: string } | null };
        if (controller.signal.aborted) return;
        if (data.consent) {
          rememberConsentTime(data.consent.consentedAt);
          dismiss();
        } else setState({ ready: true, visible: true });
      } catch {
        if (!controller.signal.aborted) setState({ ready: true, visible: true });
      } finally {
        window.clearTimeout(timeout);
      }
    }
    void load();
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
      window.removeEventListener(UPDATED_EVENT, dismiss);
    };
  }, []);
  return <ConsentContext value={state}>{children}</ConsentContext>;
}
