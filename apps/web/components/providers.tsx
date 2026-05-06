"use client";

import { type ReactNode } from "react";

import { ChatAgentWidget } from "@/components/chat/chat-agent-widget";
import { ClientErrorReporter } from "@/components/performance/client-error-reporter";
import { WebVitalsReporter } from "@/components/performance/web-vitals-reporter";
import { PrivacyConsentBanner } from "@/components/privacy/privacy-consent-banner";
import { FloatingWhatsAppCta } from "@/components/whatsapp/floating-whatsapp-cta";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <ClientErrorReporter />
      <WebVitalsReporter />
      <PrivacyConsentBanner />
      <FloatingWhatsAppCta />
      <ChatAgentWidget />
    </>
  );
}
