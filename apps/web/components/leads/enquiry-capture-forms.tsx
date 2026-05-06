"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type ActiveForm = "supply" | "distributor";
type SubmitState = "idle" | "submitting" | "success" | "error";

const textareaClassName =
  "field-control min-h-28 px-3.5 py-3 text-sm resize-y";

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function EnquiryCaptureForms() {
  const [activeForm, setActiveForm] = useState<ActiveForm>("supply");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function submitForm(event: FormEvent<HTMLFormElement>, endpoint: string) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setState("submitting");
    setMessage("");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName: getFormValue(formData, "fullName"),
        phone: getFormValue(formData, "phone"),
        email: getFormValue(formData, "email"),
        location: getFormValue(formData, "location"),
        productInterest: getFormValue(formData, "productInterest"),
        quantity: getFormValue(formData, "quantity"),
        businessType: getFormValue(formData, "businessType"),
        capacity: getFormValue(formData, "capacity"),
        message: getFormValue(formData, "message"),
      }),
    });

    if (!response.ok) {
      setState("error");
      setMessage("Your enquiry could not be saved. Please use WhatsApp or try again.");
      return;
    }

    event.currentTarget.reset();
    setState("success");
    setMessage("Enquiry received. The sales context is sales@nestfoodsltd.com.");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-1">
        {[
          { id: "supply", label: "Supply Enquiry" },
          { id: "distributor", label: "Distributor Interest" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActiveForm(item.id as ActiveForm);
              setMessage("");
              setState("idle");
            }}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition",
              activeForm === item.id
                ? "bg-[color:var(--brand-1)] text-white"
                : "text-neutral-600 hover:bg-[color:var(--surface-accent)]",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {activeForm === "supply" ? (
        <form
          onSubmit={(event) => submitForm(event, "/api/enquiries/bulk")}
          className="grid gap-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="fullName" placeholder="Full name" required />
            <Input name="phone" placeholder="Phone or WhatsApp" required />
            <Input name="email" type="email" placeholder="Email address" />
            <Input name="location" placeholder="City / state" />
            <Input name="productInterest" placeholder="Product of interest" />
            <Input name="quantity" placeholder="Estimated quantity or supply need" />
          </div>
          <textarea
            name="message"
            placeholder="Additional product or supply enquiry details"
            className={textareaClassName}
          />
          <Button type="submit" disabled={state === "submitting"}>
            {state === "submitting" ? "Submitting..." : "Send Supply Enquiry"}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={(event) => submitForm(event, "/api/enquiries/distributor")}
          className="grid gap-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="fullName" placeholder="Full name" required />
            <Input name="phone" placeholder="Phone or WhatsApp" required />
            <Input name="email" type="email" placeholder="Email address" />
            <Input name="location" placeholder="City / state" />
            <Input name="businessType" placeholder="Business type" />
            <Input name="capacity" placeholder="Current capacity or outlet profile" />
            <Input name="productInterest" placeholder="Product of interest" />
          </div>
          <textarea
            name="message"
            placeholder="Tell us the nature of your interest"
            className={textareaClassName}
          />
          <Button type="submit" disabled={state === "submitting"}>
            {state === "submitting" ? "Submitting..." : "Send Interest"}
          </Button>
        </form>
      )}

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
  );
}
