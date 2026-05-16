import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import { type ReactNode } from "react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { getCompanyContent } from "@/lib/company/service";
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
    default: "De-Nest Bread",
    template: "%s | De-Nest Bread",
  },
  description:
    "Premium bread manufacturing, product information, and company details from Nest Foods Limited.",
  icons: {
    icon: "/brand/logos/logo-primary.png",
    shortcut: "/brand/logos/logo-primary.png",
    apple: "/brand/logos/logo-primary.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#5a247a",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const company = await getCompanyContent();

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
        <Providers company={company}>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer company={company} />
          </div>
        </Providers>
      </body>
    </html>
  );
}
