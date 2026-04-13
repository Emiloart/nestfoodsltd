"use client";

import { type ReactNode } from "react";

import { ChatAgentWidget } from "@/components/chat/chat-agent-widget";
import { ExperienceProvider } from "@/components/customer/experience-provider";
import { ClientErrorReporter } from "@/components/performance/client-error-reporter";
import { WebVitalsReporter } from "@/components/performance/web-vitals-reporter";
import { PrivacyConsentBanner } from "@/components/privacy/privacy-consent-banner";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ExperienceProvider>
      {children}
      <ClientErrorReporter />
      <WebVitalsReporter />
      <PrivacyConsentBanner />
      <ChatAgentWidget />
    </ExperienceProvider>
  );
}
