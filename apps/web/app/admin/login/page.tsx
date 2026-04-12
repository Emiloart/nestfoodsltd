"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LoginMode = "account" | "token" | "activate";

type LoginSuccessResponse = {
  authenticated: boolean;
  role: string;
};

type ActivateInviteResponse = {
  activated: boolean;
  user: {
    email: string;
    role: string;
  };
};

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/admin";

  const [mode, setMode] = useState<LoginMode>("account");
  const [token, setToken] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [fullName, setFullName] = useState("");
  const [activationPassword, setActivationPassword] = useState("");
  const [activationMfaCode, setActivationMfaCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("Sign in to access the admin workspace.");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("Verifying credentials...");

    const payload =
      mode === "token"
        ? { token: token.trim() }
        : {
            email: email.trim().toLowerCase(),
            password,
            mfaCode: mfaCode.trim() || undefined,
          };

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setStatus(body?.error ?? "Authentication failed.");
        setSubmitting(false);
        return;
      }

      const responseData = (await response.json()) as LoginSuccessResponse;
      setStatus("Authenticated. Redirecting...");
      setMfaCode("");
      if (responseData.authenticated && responseData.role === "SUPER_ADMIN") {
        setMode("account");
      }
      router.push(nextPath);
      router.refresh();
    } catch {
      setStatus("Authentication failed.");
      setSubmitting(false);
    }
  }

  async function handleActivation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("Activating invite...");

    try {
      const response = await fetch("/api/admin/users/invites/activate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          inviteToken: inviteToken.trim(),
          fullName: fullName.trim(),
          password: activationPassword,
          mfaCode: activationMfaCode.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setStatus(body?.error ?? "Activation failed.");
        setSubmitting(false);
        return;
      }

      const body = (await response.json()) as ActivateInviteResponse;
      setEmail(body.user.email);
      setPassword("");
      setMfaCode("");
      setInviteToken("");
      setFullName("");
      setActivationPassword("");
      setActivationMfaCode("");
      setMode("account");
      setStatus("Invite activated. Sign in with your email and password.");
      setSubmitting(false);
    } catch {
      setStatus("Activation failed.");
      setSubmitting(false);
    }
  }

  function modeButtonStyle(target: LoginMode): "primary" | "secondary" {
    return mode === target ? "primary" : "secondary";
  }

  const isTokenMode = mode === "token";
  const isActivateMode = mode === "activate";

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
            Managed admin accounts are preferred. Role token login remains available as break-glass.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            variant={modeButtonStyle("account")}
            size="sm"
            onClick={() => setMode("account")}
            disabled={submitting}
          >
            Account Login
          </Button>
          <Button
            variant={modeButtonStyle("activate")}
            size="sm"
            onClick={() => setMode("activate")}
            disabled={submitting}
          >
            Activate Invite
          </Button>
          <Button
            variant={modeButtonStyle("token")}
            size="sm"
            onClick={() => setMode("token")}
            disabled={submitting}
          >
            Token Login
          </Button>
        </div>

        {!isActivateMode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            {isTokenMode ? (
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
            ) : (
              <>
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    Email
                  </span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@nestfoodsltd.com"
                    autoComplete="email"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    Password
                  </span>
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your admin password"
                    autoComplete="current-password"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    MFA Code (if required)
                  </span>
                  <Input
                    type="password"
                    value={mfaCode}
                    onChange={(event) => setMfaCode(event.target.value)}
                    placeholder="6-digit code"
                    autoComplete="one-time-code"
                    maxLength={6}
                  />
                </label>
              </>
            )}
            <Button
              type="submit"
              disabled={
                submitting ||
                (isTokenMode
                  ? token.trim().length < 8
                  : email.trim().length < 5 || password.length < 12)
              }
            >
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
          </form>
        ) : (
          <form onSubmit={handleActivation} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Invite Token
              </span>
              <Input
                value={inviteToken}
                onChange={(event) => setInviteToken(event.target.value)}
                placeholder="Paste invite token"
                autoComplete="off"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Full Name
              </span>
              <Input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Admin full name"
                autoComplete="name"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Password
              </span>
              <Input
                type="password"
                value={activationPassword}
                onChange={(event) => setActivationPassword(event.target.value)}
                placeholder="Min 12 chars, upper/lower/number"
                autoComplete="new-password"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                MFA Code (6 digits if required)
              </span>
              <Input
                type="password"
                value={activationMfaCode}
                onChange={(event) => setActivationMfaCode(event.target.value)}
                placeholder="6-digit MFA code"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </label>
            <Button
              type="submit"
              disabled={
                submitting ||
                inviteToken.trim().length < 20 ||
                fullName.trim().length < 2 ||
                activationPassword.length < 12
              }
            >
              {submitting ? "Activating..." : "Activate Invite"}
            </Button>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
          </form>
        )}
      </Card>
    </section>
  );
}
