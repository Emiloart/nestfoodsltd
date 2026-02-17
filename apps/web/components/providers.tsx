"use client";

import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";

import { CartProvider } from "@/components/cart/cart-provider";
import { ExperienceProvider } from "@/components/customer/experience-provider";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ExperienceProvider>
        <CartProvider>{children}</CartProvider>
      </ExperienceProvider>
    </ThemeProvider>
  );
}
