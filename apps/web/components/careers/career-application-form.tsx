"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
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

function encodeMailtoBody(form: CareerApplicationFormState, fileNames: string[]) {
  const body = [
    "Career application for Nest Foods Limited Awka",
    "",
    `Full name: ${form.fullName}`,
    `Phone number: ${form.phone}`,
    `Email: ${form.email}`,
    `Position applying for: ${form.position}`,
    `Years of experience: ${form.yearsOfExperience}`,
    `Other work experience: ${form.otherExperience || "Not provided"}`,
    fileNames.length ? `Files prepared: ${fileNames.join(", ")}` : "Files prepared: Not attached yet",
    "",
    "Please attach your CV and application letter before sending this email. Drivers should also attach a driver's license or cover letter where applicable.",
  ].join("\n");

  return encodeURIComponent(body);
}

export function CareerApplicationForm() {
  const [form, setForm] = useState(initialFormState);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [status, setStatus] = useState("Use the form to prepare an HR email application.");

  function updateForm(partial: Partial<CareerApplicationFormState>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  function updateFileNames(files: FileList | null) {
    setFileNames(files ? Array.from(files).map((file) => file.name) : []);
  }

  function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.fullName.trim() || !form.phone.trim() || !form.email.trim() || !form.position.trim()) {
      setStatus("Full name, phone, email, and position are required.");
      return;
    }

    const subject = encodeURIComponent(`Career Application - ${form.position} - ${form.fullName}`);
    const body = encodeMailtoBody(form, fileNames);
    setStatus("Opening your email app. Attach CV/application files before sending.");
    window.location.href = `mailto:hrsupport@nestfoodsltd.com?subject=${subject}&body=${body}`;
  }

  return (
    <form className="space-y-4" onSubmit={submitApplication}>
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          required
          value={form.fullName}
          onChange={(event) => updateForm({ fullName: event.target.value })}
          placeholder="Full name"
        />
        <Input
          required
          value={form.phone}
          onChange={(event) => updateForm({ phone: event.target.value })}
          placeholder="Phone number"
        />
        <Input
          required
          type="email"
          value={form.email}
          onChange={(event) => updateForm({ email: event.target.value })}
          placeholder="Email address"
        />
        <Input
          required
          value={form.position}
          onChange={(event) => updateForm({ position: event.target.value })}
          placeholder="Position applying for"
        />
        <Input
          value={form.yearsOfExperience}
          onChange={(event) => updateForm({ yearsOfExperience: event.target.value })}
          placeholder="Years of experience"
        />
        <label className="field-control flex min-h-11 cursor-pointer items-center px-3 text-sm text-neutral-500">
          <span className="sr-only">Upload CV, application letter, or driver documents</span>
          <input
            type="file"
            multiple
            className="w-full text-xs"
            onChange={(event) => updateFileNames(event.target.files)}
          />
        </label>
      </div>
      <textarea
        value={form.otherExperience}
        onChange={(event) => updateForm({ otherExperience: event.target.value })}
        placeholder="Other work experience, if any"
        className="field-control min-h-24 px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">Prepare HR Email</Button>
        <p className="text-xs leading-5 text-neutral-500">{status}</p>
      </div>
    </form>
  );
}
