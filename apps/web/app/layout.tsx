import type { Metadata, Viewport } from "next";
import { type ReactNode } from "react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { resolveSiteUrl } from "@/lib/seo/site";
import { buildOrganizationStructuredData } from "@/lib/seo/structured-data";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
  title: {
    default: "Nest Foods Ltd",
    template: "%s | Nest Foods Ltd",
  },
  description:
    "Premium bread manufacturing, quality traceability, and product information for communities and partners across Africa.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff8f0" },
    { media: "(prefers-color-scheme: dark)", color: "#121315" },
  ],
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[color:var(--surface)] text-[color:var(--foreground)] antialiased">
        <JsonLd id="organization-ld" data={buildOrganizationStructuredData()} />
        <a
          href="#main-content"
          className="sr-only absolute left-4 top-4 z-[100] rounded-md bg-neutral-950 px-3 py-2 text-sm font-medium text-white focus:not-sr-only dark:bg-white dark:text-neutral-900"
        >
          Skip to main content
        </a>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
