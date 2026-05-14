"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { FormToast } from "@/components/ui/form-toast";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type ActiveForm = "supply" | "distributor";
type SubmitState = "idle" | "submitting" | "success" | "error";
type SubmitResponse = {
  emailDelivery?: {
    confirmation?: {
      status?: string;
    };
  };
};

type DistributorFormState = {
  fullName: string;
  phone: string;
  email: string;
  location: string;
  businessType: string;
  capacity: string;
  productInterest: string;
  message: string;
};

const initialDistributorState: DistributorFormState = {
  fullName: "",
  phone: "",
  email: "",
  location: "",
  businessType: "",
  capacity: "",
  productInterest: "",
  message: "",
};

const textareaClassName = "field-control min-h-28 resize-y px-3.5 py-3 text-sm";

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function stepIsComplete(step: number, form: DistributorFormState) {
  if (step === 0) {
    return Boolean(form.fullName.trim() && form.phone.trim());
  }
  if (step === 1) {
    return Boolean(form.location.trim() && form.businessType.trim());
  }
  return Boolean(form.productInterest.trim() || form.message.trim());
}

export function EnquiryCaptureForms() {
  const [activeForm, setActiveForm] = useState<ActiveForm>("supply");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [distributorStep, setDistributorStep] = useState(0);
  const [distributorForm, setDistributorForm] = useState(initialDistributorState);

  function updateDistributorForm(partial: Partial<DistributorFormState>) {
    setDistributorForm((current) => ({ ...current, ...partial }));
  }

  async function submitPayload(endpoint: string, payload: Record<string, string>) {
    setState("submitting");
    setMessage("");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responsePayload = (await response.json().catch(() => null)) as SubmitResponse | null;

    if (!response.ok) {
      setState("error");
      setMessage("Your enquiry could not be saved. Please use WhatsApp or try again.");
      return false;
    }

    setState("success");
    setMessage(
      responsePayload?.emailDelivery?.confirmation?.status === "sent"
        ? "Thank you. Your enquiry was submitted and a confirmation email has been sent."
        : "Thank you. Your enquiry was submitted and the Nest Foods Limited team will follow up.",
    );
    return true;
  }

  async function submitSupplyForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const saved = await submitPayload("/api/enquiries/bulk", {
      fullName: getFormValue(formData, "fullName"),
      phone: getFormValue(formData, "phone"),
      email: getFormValue(formData, "email"),
      location: getFormValue(formData, "location"),
      productInterest: getFormValue(formData, "productInterest"),
      quantity: getFormValue(formData, "quantity"),
      businessType: "",
      capacity: "",
      message: getFormValue(formData, "message"),
    });

    if (saved) {
      event.currentTarget.reset();
    }
  }

  async function submitDistributorForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stepIsComplete(distributorStep, distributorForm)) {
      setState("error");
      setMessage("Complete the required details in this step before continuing.");
      return;
    }

    if (distributorStep < 2) {
      setDistributorStep((current) => current + 1);
      setState("idle");
      setMessage("");
      return;
    }

    const saved = await submitPayload("/api/enquiries/distributor", distributorForm);
    if (saved) {
      setDistributorForm(initialDistributorState);
      setDistributorStep(0);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-1">
        {[
          { id: "supply", label: "Supply Enquiry" },
          { id: "distributor", label: "Business Interest" },
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
        <form onSubmit={(event) => void submitSupplyForm(event)} className="grid gap-3">
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
        <form onSubmit={(event) => void submitDistributorForm(event)} className="grid gap-4">
          <div className="grid grid-cols-3 gap-2">
            {["Contact", "Business", "Interest"].map((label, index) => (
              <div
                key={label}
                className={cn(
                  "rounded-full border px-3 py-2 text-center text-[0.62rem] font-black uppercase tracking-[0.12em]",
                  distributorStep === index
                    ? "border-[color:var(--brand-1)] bg-[color:var(--brand-1)] text-white"
                    : "border-[color:var(--border)] bg-[color:var(--surface-strong)] text-neutral-500",
                )}
              >
                {label}
              </div>
            ))}
          </div>

          {distributorStep === 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={distributorForm.fullName}
                onChange={(event) => updateDistributorForm({ fullName: event.target.value })}
                placeholder="Full name"
                required
              />
              <Input
                value={distributorForm.phone}
                onChange={(event) => updateDistributorForm({ phone: event.target.value })}
                placeholder="Phone or WhatsApp"
                required
              />
              <Input
                value={distributorForm.email}
                onChange={(event) => updateDistributorForm({ email: event.target.value })}
                type="email"
                placeholder="Email address"
                className="sm:col-span-2"
              />
            </div>
          ) : null}

          {distributorStep === 1 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={distributorForm.location}
                onChange={(event) => updateDistributorForm({ location: event.target.value })}
                placeholder="City / state"
                required
              />
              <Input
                value={distributorForm.businessType}
                onChange={(event) => updateDistributorForm({ businessType: event.target.value })}
                placeholder="Business type"
                required
              />
              <Input
                value={distributorForm.capacity}
                onChange={(event) => updateDistributorForm({ capacity: event.target.value })}
                placeholder="Current capacity or outlet profile"
                className="sm:col-span-2"
              />
            </div>
          ) : null}

          {distributorStep === 2 ? (
            <div className="grid gap-3">
              <Input
                value={distributorForm.productInterest}
                onChange={(event) => updateDistributorForm({ productInterest: event.target.value })}
                placeholder="Product of interest"
              />
              <textarea
                value={distributorForm.message}
                onChange={(event) => updateDistributorForm({ message: event.target.value })}
                placeholder="Tell us the nature of your interest"
                className={textareaClassName}
              />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {distributorStep > 0 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setDistributorStep((current) => current - 1);
                  setMessage("");
                  setState("idle");
                }}
              >
                Back
              </Button>
            ) : null}
            <Button type="submit" disabled={state === "submitting"}>
              {state === "submitting"
                ? "Submitting..."
                : distributorStep < 2
                  ? "Continue"
                  : "Send Interest"}
            </Button>
          </div>
        </form>
      )}

      <FormToast
        tone={state === "error" ? "error" : state === "success" ? "success" : "info"}
        message={message}
      />
    </div>
  );
}
