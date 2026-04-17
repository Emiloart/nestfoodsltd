import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import { type ReactNode } from "react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { resolveSiteUrl } from "@/lib/seo/site";
import { buildOrganizationStructuredData } from "@/lib/seo/structured-data";

import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
  title: {
    default: "Nest Foods Ltd",
    template: "%s | Nest Foods Ltd",
  },
  description:
    "Premium bread manufacturing, product information, and company details for communities across Africa.",
};

export const viewport: Viewport = {
  themeColor: "#5a247a",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="min-h-screen bg-[color:var(--surface)] text-[color:var(--foreground)] antialiased">
        <JsonLd id="organization-ld" data={buildOrganizationStructuredData()} />
        <a
          href="#main-content"
          className="sr-only absolute left-4 top-4 z-[100] rounded-full border border-[color:var(--border-strong)] bg-[color:var(--action-1)] px-4 py-2 text-sm font-semibold text-[color:var(--action-text)] shadow-[0_10px_22px_rgba(238,186,11,0.2)] focus:not-sr-only"
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
