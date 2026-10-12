"use client";

import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { FormToast } from "@/components/ui/form-toast";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type ActiveForm = "supply" | "distributor";
type SubmitState = "idle" | "submitting" | "success" | "error";
type SubmitResponse = {
  error?: string;
  details?: { fieldErrors?: Record<string, string[]> };
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

export function EnquiryCaptureForms({ initialProduct = "" }: { initialProduct?: string }) {
  const [activeForm, setActiveForm] = useState<ActiveForm>("supply");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [distributorStep, setDistributorStep] = useState(0);
  const [distributorForm, setDistributorForm] = useState({
    ...initialDistributorState,
    productInterest: initialProduct,
  });
  const inFlightSubmissionRef = useRef(false);
  const lastSubmittedSignatureRef = useRef<string | null>(null);

  function updateDistributorForm(partial: Partial<DistributorFormState>) {
    setDistributorForm((current) => ({ ...current, ...partial }));
  }

  async function submitPayload(
    endpoint: string,
    payload: Record<string, string>,
    formElement: HTMLFormElement,
  ) {
    if (inFlightSubmissionRef.current) {
      return false;
    }

    const submissionSignature = JSON.stringify({ endpoint, payload });
    if (lastSubmittedSignatureRef.current === submissionSignature) {
      setState("success");
      setMessage("Thank you. This enquiry has already been submitted.");
      return false;
    }

    inFlightSubmissionRef.current = true;
    setState("submitting");
    setMessage("");
    setFieldErrors({});

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responsePayload = (await response.json().catch(() => null)) as SubmitResponse | null;

      if (!response.ok) {
        setState("error");
        const errors = Object.fromEntries(
          Object.entries(responsePayload?.details?.fieldErrors ?? {}).map(([key, values]) => [
            key,
            values[0] ?? "Check this field.",
          ]),
        );
        setFieldErrors(errors);
        setMessage(
          Object.keys(errors).length
            ? "Please correct the highlighted fields."
            : (responsePayload?.error ??
                "Your enquiry could not be saved. Please try again or use WhatsApp."),
        );
        if (activeForm === "distributor") {
          if (errors.fullName || errors.phone || errors.email) setDistributorStep(0);
          else if (errors.location || errors.businessType) setDistributorStep(1);
        }
        const field = Object.keys(errors)[0];
        if (field)
          requestAnimationFrame(() =>
            formElement.querySelector<HTMLInputElement>(`[name="${CSS.escape(field)}"]`)?.focus(),
          );
        return false;
      }

      lastSubmittedSignatureRef.current = submissionSignature;
      setState("success");
      setMessage(
        responsePayload?.emailDelivery?.confirmation?.status === "sent"
          ? "Thank you. Your enquiry was submitted. Please check your inbox for confirmation."
          : "Thank you. Your enquiry was submitted and the Nest Foods Limited team will follow up.",
      );
      return true;
    } catch {
      setState("error");
      setMessage("Your enquiry could not be saved. Please check your connection or use WhatsApp.");
      return false;
    } finally {
      inFlightSubmissionRef.current = false;
    }
  }

  async function submitSupplyForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    const saved = await submitPayload(
      "/api/enquiries/bulk",
      {
        fullName: getFormValue(formData, "fullName"),
        phone: getFormValue(formData, "phone"),
        email: getFormValue(formData, "email"),
        location: getFormValue(formData, "location"),
        productInterest: getFormValue(formData, "productInterest"),
        quantity: getFormValue(formData, "quantity"),
        businessType: "",
        capacity: "",
        message: getFormValue(formData, "message"),
      },
      formElement,
    );

    if (saved) {
      formElement.reset();
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

    const saved = await submitPayload(
      "/api/enquiries/distributor",
      distributorForm,
      event.currentTarget,
    );
    if (saved) {
      setDistributorForm({ ...initialDistributorState, productInterest: initialProduct });
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
              setFieldErrors({});
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
            <Input
              label="Full name (required)"
              error={fieldErrors.fullName}
              minLength={2}
              maxLength={140}
              autoComplete="name"
              name="fullName"
              placeholder="Full name"
              required
            />
            <Input
              label="Phone or WhatsApp (required)"
              error={fieldErrors.phone}
              type="tel"
              minLength={7}
              maxLength={40}
              autoComplete="tel"
              name="phone"
              placeholder="Phone or WhatsApp"
              required
            />
            <Input
              label="Email address (optional)"
              error={fieldErrors.email}
              maxLength={180}
              autoComplete="email"
              name="email"
              type="email"
              placeholder="Email address"
            />
            <Input
              label="City / state"
              error={fieldErrors.location}
              name="location"
              placeholder="City / state"
            />
            <Input
              label="Product of interest (optional)"
              error={fieldErrors.productInterest}
              defaultValue={initialProduct}
              name="productInterest"
              placeholder="Product of interest"
            />
            <Input
              label="Estimated quantity or supply need (optional)"
              error={fieldErrors.quantity}
              name="quantity"
              placeholder="Estimated quantity or supply need"
            />
          </div>
          <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
            <span>Additional details (optional)</span>
            <textarea
              name="message"
              placeholder="Additional product or supply enquiry details"
              className={textareaClassName}
            />
          </label>
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
                label="Full name (required)"
                error={fieldErrors.fullName}
                name="fullName"
                minLength={2}
                maxLength={140}
                autoComplete="name"
                value={distributorForm.fullName}
                onChange={(event) => updateDistributorForm({ fullName: event.target.value })}
                placeholder="Full name"
                required
              />
              <Input
                label="Phone or WhatsApp (required)"
                error={fieldErrors.phone}
                name="phone"
                type="tel"
                minLength={7}
                maxLength={40}
                autoComplete="tel"
                value={distributorForm.phone}
                onChange={(event) => updateDistributorForm({ phone: event.target.value })}
                placeholder="Phone or WhatsApp"
                required
              />
              <Input
                label="Email address (optional)"
                error={fieldErrors.email}
                name="email"
                maxLength={180}
                autoComplete="email"
                value={distributorForm.email}
                onChange={(event) => updateDistributorForm({ email: event.target.value })}
                type="email"
                placeholder="Email address"
                wrapperClassName="sm:col-span-2"
              />
            </div>
          ) : null}

          {distributorStep === 1 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="City / state"
                error={fieldErrors.location}
                name="location"
                value={distributorForm.location}
                onChange={(event) => updateDistributorForm({ location: event.target.value })}
                placeholder="City / state"
                required
              />
              <Input
                label="Business type (required)"
                error={fieldErrors.businessType}
                name="businessType"
                value={distributorForm.businessType}
                onChange={(event) => updateDistributorForm({ businessType: event.target.value })}
                placeholder="Business type"
                required
              />
              <Input
                label="Outlet profile (optional)"
                error={fieldErrors.capacity}
                name="capacity"
                value={distributorForm.capacity}
                onChange={(event) => updateDistributorForm({ capacity: event.target.value })}
                placeholder="Current capacity or outlet profile"
                wrapperClassName="sm:col-span-2"
              />
            </div>
          ) : null}

          {distributorStep === 2 ? (
            <div className="grid gap-3">
              <Input
                label="Product of interest (optional)"
                error={fieldErrors.productInterest}
                name="productInterest"
                value={distributorForm.productInterest}
                onChange={(event) => updateDistributorForm({ productInterest: event.target.value })}
                placeholder="Product of interest"
              />
              <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
                <span>Business interest details (optional)</span>
                <textarea
                  name="message"
                  value={distributorForm.message}
                  onChange={(event) => updateDistributorForm({ message: event.target.value })}
                  placeholder="Tell us the nature of your interest"
                  className={textareaClassName}
                />
              </label>
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

      <p className="text-sm text-neutral-700">
        We use these details to respond to your enquiry.{" "}
        <a href="/privacy" className="font-semibold text-[color:var(--brand-1)] underline">
          Privacy information
        </a>
      </p>
      <FormToast
        tone={state === "error" ? "error" : state === "success" ? "success" : "info"}
        message={message}
      />
    </div>
  );
}
