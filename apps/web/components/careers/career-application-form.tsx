"use client";

import { FormEvent, useState } from "react";

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

export function CareerApplicationForm() {
  const [form, setForm] = useState(initialFormState);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState<"info" | "success" | "error">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateForm(partial: Partial<CareerApplicationFormState>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  function updateFileNames(files: FileList | null) {
    setFileNames(files ? Array.from(files).map((file) => file.name) : []);
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.fullName.trim() || !form.phone.trim() || !form.email.trim() || !form.position.trim()) {
      setStatus("Full name, phone, email, and position are required.");
      setStatusTone("error");
      return;
    }

    setIsSubmitting(true);
    setStatus("");
    setStatusTone("info");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/careers/apply", {
      method: "POST",
      body: formData,
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; emailDelivery?: { confirmation?: { status?: string } } }
      | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setStatus(payload?.error || "Application could not be submitted. Please try again.");
      setStatusTone("error");
      return;
    }

    event.currentTarget.reset();
    setForm(initialFormState);
    setFileNames([]);
    setStatusTone("success");
    setStatus(
      payload?.emailDelivery?.confirmation?.status === "sent"
        ? "Application submitted. A confirmation email has been sent to your inbox."
        : "Application submitted online. HR will review your details.",
    );
  }

  return (
    <form className="space-y-4" onSubmit={submitApplication}>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 lg:col-span-2">
          <p className="section-kicker">Step 1</p>
          <h3 className="mt-2 text-lg font-semibold text-neutral-900">Applicant details</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Input
              name="fullName"
              required
              value={form.fullName}
              onChange={(event) => updateForm({ fullName: event.target.value })}
              placeholder="Full name"
            />
            <Input
              name="phone"
              required
              value={form.phone}
              onChange={(event) => updateForm({ phone: event.target.value })}
              placeholder="Phone number"
            />
            <Input
              name="email"
              required
              type="email"
              value={form.email}
              onChange={(event) => updateForm({ email: event.target.value })}
              placeholder="Email address"
            />
            <Input
              name="position"
              required
              value={form.position}
              onChange={(event) => updateForm({ position: event.target.value })}
              placeholder="Position applying for"
            />
            <Input
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
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="w-full text-xs"
              onChange={(event) => updateFileNames(event.target.files)}
            />
          </label>
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
              Upload CV, application letter, and driver documents where applicable. Each file should be
              3MB or less.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
        <p className="section-kicker">Step 3</p>
        <h3 className="mt-2 text-lg font-semibold text-neutral-900">Experience note</h3>
        <textarea
          name="otherExperience"
          value={form.otherExperience}
          onChange={(event) => updateForm({ otherExperience: event.target.value })}
          placeholder="Other work experience, if any"
          className="field-control mt-4 min-h-24 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
      <FormToast tone={statusTone} message={status} />
    </form>
  );
}
