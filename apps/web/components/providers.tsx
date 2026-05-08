"use client";

import { type ReactNode } from "react";

import { FloatingContactActions } from "@/components/contact/floating-contact-actions";
import { ClientErrorReporter } from "@/components/performance/client-error-reporter";
import { WebVitalsReporter } from "@/components/performance/web-vitals-reporter";
import { PrivacyConsentBanner } from "@/components/privacy/privacy-consent-banner";

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
      <FloatingContactActions />
    </>
  );
}
