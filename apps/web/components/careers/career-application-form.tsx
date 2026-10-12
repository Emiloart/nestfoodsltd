"use client";

import { FormEvent, useRef, useState } from "react";

import { validateCareerFiles } from "@/lib/careers/upload-rules";

import { Button } from "@/components/ui/button";
import { FormToast } from "@/components/ui/form-toast";
import { Input } from "@/components/ui/input";

type CareerApplicationFormState = {
  fullName: string;
  phone: string;
  email: string;
  position: string;
  yearsOfExperience: string;
  otherExperience: string;
};

const initialFormState: CareerApplicationFormState = {
  fullName: "",
  phone: "",
  email: "",
  position: "",
  yearsOfExperience: "",
  otherExperience: "",
};

const applicationConfirmationMessage =
  "Thank you for your submission. Nest Foods Limited will review your application and reach out to you via email. Please check your inbox for your application confirmation and a copy of your submission.";

export function CareerApplicationForm({ initialPosition = "" }: { initialPosition?: string }) {
  const [form, setForm] = useState({ ...initialFormState, position: initialPosition });
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState<"info" | "success" | "error">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inFlightSubmissionRef = useRef(false);
  const lastSubmittedSignatureRef = useRef<string | null>(null);

  function updateForm(partial: Partial<CareerApplicationFormState>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  function updateFileNames(files: FileList | null) {
    const selected = files ? Array.from(files) : [];
    setFileNames(
      selected.map((file) => `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`),
    );
    setUploadError(validateCareerFiles(selected));
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (inFlightSubmissionRef.current) {
      return;
    }

    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.email.trim() ||
      !form.position.trim()
    ) {
      setStatus("Full name, phone, email, and position are required.");
      setStatusTone("error");
      return;
    }

    if (uploadError) {
      setStatus(uploadError);
      setStatusTone("error");
      return;
    }

    const submissionSignature = JSON.stringify({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
      position: form.position.trim(),
      yearsOfExperience: form.yearsOfExperience.trim(),
      otherExperience: form.otherExperience.trim(),
      fileNames,
    });

    if (lastSubmittedSignatureRef.current === submissionSignature) {
      setStatus(applicationConfirmationMessage);
      setStatusTone("success");
      return;
    }

    const formElement = event.currentTarget;
    inFlightSubmissionRef.current = true;
    setIsSubmitting(true);
    setFieldErrors({});
    setStatus("");
    setStatusTone("info");

    try {
      const formData = new FormData(formElement);
      const response = await fetch("/api/careers/apply", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        details?: { fieldErrors?: Record<string, string[]> };
        emailDelivery?: { confirmation?: { status?: string } };
      } | null;

      if (!response.ok) {
        const errors = Object.fromEntries(
          Object.entries(payload?.details?.fieldErrors ?? {}).map(([key, values]) => [
            key,
            values[0] ?? "Check this field.",
          ]),
        );
        setFieldErrors(errors);
        const field = Object.keys(errors)[0];
        if (field)
          requestAnimationFrame(() =>
            formElement.querySelector<HTMLInputElement>(`[name="${CSS.escape(field)}"]`)?.focus(),
          );
        setStatus(payload?.error || "Application could not be submitted. Please try again.");
        setStatusTone("error");
        return;
      }

      formElement.reset();
      setForm({ ...initialFormState, position: initialPosition });
      setUploadError(null);
      setFileNames([]);
      lastSubmittedSignatureRef.current = submissionSignature;
      setStatusTone("success");
      setStatus(
        payload?.emailDelivery?.confirmation?.status === "sent"
          ? applicationConfirmationMessage
          : "Thank you for your submission. Nest Foods Limited will review your application and reach out to you.",
      );
    } catch {
      setStatus("Application could not be submitted. Please check your connection and try again.");
      setStatusTone("error");
    } finally {
      inFlightSubmissionRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submitApplication}>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 lg:col-span-2">
          <p className="section-kicker">Step 1</p>
          <h3 className="mt-2 text-lg font-semibold text-neutral-900">Applicant details</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Input
              label="Full name (required)"
              minLength={2}
              maxLength={140}
              autoComplete="name"
              error={fieldErrors.fullName}
              name="fullName"
              required
              value={form.fullName}
              onChange={(event) => updateForm({ fullName: event.target.value })}
              placeholder="Full name"
            />
            <Input
              label="Phone number (required)"
              type="tel"
              minLength={7}
              maxLength={40}
              autoComplete="tel"
              error={fieldErrors.phone}
              name="phone"
              required
              value={form.phone}
              onChange={(event) => updateForm({ phone: event.target.value })}
              placeholder="Phone number"
            />
            <Input
              label="Email address (required)"
              autoComplete="email"
              maxLength={180}
              error={fieldErrors.email}
              name="email"
              required
              type="email"
              value={form.email}
              onChange={(event) => updateForm({ email: event.target.value })}
              placeholder="Email address"
            />
            <Input
              label="Position applying for (required)"
              minLength={2}
              maxLength={140}
              error={fieldErrors.position}
              name="position"
              required
              value={form.position}
              onChange={(event) => updateForm({ position: event.target.value })}
              placeholder="Position applying for"
            />
            <Input
              label="Years of experience (optional)"
              maxLength={80}
              error={fieldErrors.yearsOfExperience}
              name="yearsOfExperience"
              value={form.yearsOfExperience}
              onChange={(event) => updateForm({ yearsOfExperience: event.target.value })}
              placeholder="Years of experience"
            />
          </div>
        </div>

        <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
          <p className="section-kicker">Step 2</p>
          <h3 className="mt-2 text-lg font-semibold text-neutral-900">Prepare files</h3>
          <label className="field-control mt-4 flex min-h-11 cursor-pointer items-center px-3 text-sm text-neutral-500">
            <span className="sr-only">Select CV, application letter, or driver documents</span>
            <input
              name="files"
              type="file"
              required
              aria-describedby="career-upload-guidance"
              aria-invalid={Boolean(uploadError)}
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="w-full text-xs"
              onChange={(event) => updateFileNames(event.target.files)}
            />
          </label>
          <p id="career-upload-guidance" className="mt-3 text-sm leading-6 text-neutral-700">
            PDF, DOC, DOCX, JPG or PNG. Up to 4 files, 3 MB each and 4 MB in total. Include your CV.
          </p>
          {uploadError ? (
            <p role="alert" className="mt-2 text-sm text-red-800">
              {uploadError}
            </p>
          ) : null}
          {fileNames.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {fileNames.map((fileName) => (
                <span
                  key={fileName}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--bg-accent-brand)] px-3 py-1 text-xs font-medium text-[color:var(--brand-1)]"
                >
                  {fileName}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs leading-5 text-neutral-500">
              Upload CV, application letter, and driver documents where applicable. Each file should
              be 3 MB or less.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
        <p className="section-kicker">Step 3</p>
        <h3 className="mt-2 text-lg font-semibold text-neutral-900">Experience note</h3>
        <label className="mt-4 grid gap-1.5 text-sm font-medium text-neutral-800">
          <span>Other work experience (optional)</span>
          <textarea
            maxLength={1200}
            name="otherExperience"
            value={form.otherExperience}
            onChange={(event) => updateForm({ otherExperience: event.target.value })}
            placeholder="Other work experience, if any"
            className="field-control min-h-24 px-3 py-2 text-base"
          />
        </label>
      </div>

      <p className="text-sm text-neutral-700">
        Your details and documents are used to review your application.{" "}
        <a href="/privacy" className="font-semibold text-[color:var(--brand-1)] underline">
          Privacy information
        </a>
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSubmitting || Boolean(uploadError)}>
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
      <FormToast tone={statusTone} message={status} />
    </form>
  );
}
