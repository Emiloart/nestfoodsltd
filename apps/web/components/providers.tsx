"use client";

import { type ReactNode } from "react";

import { FloatingContactActions } from "@/components/contact/floating-contact-actions";
import { ClientErrorReporter } from "@/components/performance/client-error-reporter";
import { WebVitalsReporter } from "@/components/performance/web-vitals-reporter";
import { PrivacyConsentBanner } from "@/components/privacy/privacy-consent-banner";
import { type CompanyContent } from "@/lib/company/types";

type ProvidersProps = {
  children: ReactNode;
  company: CompanyContent;
};

export function Providers({ children, company }: ProvidersProps) {
  return (
    <>
      {children}
      <ClientErrorReporter />
      <WebVitalsReporter />
      <PrivacyConsentBanner />
      <FloatingContactActions
        contactChannels={company.contactChannels}
        whatsappContacts={company.whatsappContacts}
      />
    </>
  );
}
