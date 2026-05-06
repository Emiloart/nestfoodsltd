"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function NewsletterSignupForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState("submitting");
    setMessage("");

    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        source: "homepage",
        consentMarketing: formData.get("consentMarketing") === "on",
      }),
    });

    if (!response.ok) {
      setState("error");
      setMessage("Newsletter signup could not be saved. Please try again.");
      return;
    }

    event.currentTarget.reset();
    setState("success");
    setMessage("Signup received. Updates will be sent by Nest Foods Limited.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input name="email" type="email" placeholder="Email address" autoComplete="email" required />
      <label className="flex gap-3 text-xs leading-5 text-neutral-600">
        <input
          name="consentMarketing"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 rounded border-[color:var(--border-strong)]"
        />
        I agree to receive De-Nest Bread product and company updates from Nest Foods Limited.
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={state === "submitting"}>
          {state === "submitting" ? "Submitting..." : "Subscribe"}
        </Button>
        {message ? (
          <p
            className={
              state === "error"
                ? "text-xs font-medium text-red-700"
                : "text-xs font-medium text-[color:var(--brand-1)]"
            }
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
