"use client";

import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";

import { CartProvider } from "@/components/cart/cart-provider";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  );
}
