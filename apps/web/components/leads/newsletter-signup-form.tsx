"use client";

import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { FormToast } from "@/components/ui/form-toast";
import { Input } from "@/components/ui/input";

type SubmitState = "idle" | "submitting" | "success" | "error";
type NewsletterResponse = {
  emailDelivery?: {
    confirmation?: {
      status?: string;
    };
  };
};

export function NewsletterSignupForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const inFlightSubmissionRef = useRef(false);
  const lastSubmittedSignatureRef = useRef<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlightSubmissionRef.current) {
      return;
    }

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      source: "homepage",
      consentMarketing: formData.get("consentMarketing") === "on",
    };
    const submissionSignature = JSON.stringify(payload);

    if (lastSubmittedSignatureRef.current === submissionSignature) {
      setState("success");
      setMessage("Signup already received. Please check your inbox for confirmation.");
      return;
    }

    inFlightSubmissionRef.current = true;
    setState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responsePayload = (await response.json().catch(() => null)) as NewsletterResponse | null;

      if (!response.ok) {
        setState("error");
        setMessage("Newsletter signup could not be saved. Please try again.");
        return;
      }

      formElement.reset();
      lastSubmittedSignatureRef.current = submissionSignature;
      setState("success");
      setMessage(
        responsePayload?.emailDelivery?.confirmation?.status === "sent"
          ? "Thank you for signing up for Nest Foods limited newsletter."
          : "Successful. Updates will be sent by Nest Foods Limited.",
      );
    } catch {
      setState("error");
      setMessage("Newsletter signup could not be saved. Please check your connection and try again.");
    } finally {
      inFlightSubmissionRef.current = false;
    }
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
        I agree to receive Nest Foods Ltd company and product updates.
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={state === "submitting"}>
          {state === "submitting" ? "Submitting..." : "Subscribe"}
        </Button>
      </div>
      <FormToast
        tone={state === "error" ? "error" : state === "success" ? "success" : "info"}
        message={message}
      />
    </form>
  );
}
