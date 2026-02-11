"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/admin";

  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("Enter your admin token.");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("Verifying token...");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setStatus(body?.error ?? "Authentication failed.");
        setSubmitting(false);
        return;
      }

      setStatus("Authenticated. Redirecting...");
      router.push(nextPath);
      router.refresh();
    } catch {
      setStatus("Authentication failed.");
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-xl items-center px-4 py-16 md:px-6">
      <Card className="w-full space-y-5">
        <div className="space-y-2">
          <Badge>Admin Access</Badge>
          <BrandLogo href={null} compact />
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Secure Login
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Sign in with your role token to access the Nest Foods admin workspace.
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Admin Token
            </span>
            <Input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Paste your admin token"
              autoComplete="current-password"
            />
          </label>
          <Button type="submit" disabled={submitting || token.length < 8}>
            {submitting ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
        </form>
      </Card>
    </section>
  );
}
