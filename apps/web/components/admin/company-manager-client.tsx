"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type CompanyBranchLocation,
  type CompanyContent,
  type CompanyFaq,
  type CompanyTextBlock,
  type CompanyTrustCertification,
} from "@/lib/company/types";

type CompanyResponse = {
  role: string;
  company: CompanyContent;
};

type AdminCompanySection =
  | "contacts"
  | "socials"
  | "about"
  | "careers"
  | "branches"
  | "trust"
  | "faq";

type CompanyFormState = {
  storyText: string;
  vision: string;
  mission: string;
  founderStoryText: string;
  coreValuesText: string;
  milestonesText: string;
  certificationsText: string;
  faqsText: string;
  contactChannelsText: string;
  whatsappContactsText: string;
  socialChannelsText: string;
  pendingSocialChannelsText: string;
  branchLocationsText: string;
  headOfficeMapUrl: string;
  headOfficeEmbedMapUrl: string;
  trustCertificationsText: string;
  careersIntro: string;
  careerRolesText: string;
  careerRequirementsText: string;
  careerHrEmail: string;
  careerHrPhone: string;
  equalOpportunityText: string;
};

const sections: { id: AdminCompanySection; label: string; description: string }[] = [
  { id: "contacts", label: "Contacts", description: "Phones, emails, WhatsApp, and maps." },
  { id: "socials", label: "Socials", description: "Public social media links." },
  { id: "about", label: "About", description: "Story, vision, mission, founder, values." },
  { id: "careers", label: "Careers", description: "Roles, HR contacts, application guidance." },
  { id: "branches", label: "Branches", description: "Contact locations and office hours." },
  { id: "trust", label: "Trust", description: "Certifications, logos, milestones." },
  { id: "faq", label: "FAQ", description: "Questions and answers shown on About." },
];

function parseLines(text: string) {
  return text
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseDelimitedLine(line: string) {
  return line.split("|").map((entry) => entry.trim());
}

function textBlocksToText(items: CompanyTextBlock[]) {
  return items.map((item) => `${item.title} | ${item.body}`).join("\n");
}

function parseTextBlocks(text: string, label: string): CompanyTextBlock[] {
  return parseLines(text).map((line, index) => {
    const [title, body] = parseDelimitedLine(line);
    if (!title || !body) {
      throw new Error(`${label} line ${index + 1} must be: title | text`);
    }
    return { title, body };
  });
}

function faqsToText(items: CompanyFaq[]) {
  return items.map((item) => `${item.question} | ${item.answer}`).join("\n");
}

function parseFaqs(text: string): CompanyFaq[] {
  return parseLines(text).map((line, index) => {
    const [question, answer] = parseDelimitedLine(line);
    if (!question || !answer) {
      throw new Error(`FAQ line ${index + 1} must be: question | answer`);
    }
    return { question, answer };
  });
}

function trustToText(items: CompanyTrustCertification[]) {
  return items.map((item) => `${item.label} | ${item.title} | ${item.body} | ${item.logoUrl}`).join("\n");
}

function parseTrust(text: string): CompanyTrustCertification[] {
  return parseLines(text).map((line, index) => {
    const [label, title, body, logoUrl] = parseDelimitedLine(line);
    if (!label || !title || !body || !logoUrl) {
      throw new Error(`Trust line ${index + 1} must be: label | title | text | logo URL`);
    }
    return { label, title, body, logoUrl };
  });
}

function contactsToText(company: CompanyContent) {
  return company.contactChannels
    .map((item) => `${item.id} | ${item.label} | ${item.value} | ${item.href}`)
    .join("\n");
}

function parseContacts(text: string) {
  return parseLines(text).map((line, index) => {
    const [id, label, value, href] = parseDelimitedLine(line);
    if (!id || !label || !value || !href) {
      throw new Error(`Contact line ${index + 1} must be: id | label | value | link`);
    }
    return { id, label, value, href };
  });
}

function whatsappToText(company: CompanyContent) {
  return company.whatsappContacts
    .map((item) => `${item.id} | ${item.label} | ${item.phone} | ${item.message}`)
    .join("\n");
}

function parseWhatsapp(text: string) {
  return parseLines(text).map((line, index) => {
    const [id, label, phone, message] = parseDelimitedLine(line);
    if (!id || !label || !phone || !message) {
      throw new Error(`WhatsApp line ${index + 1} must be: id | label | phone | message`);
    }
    return { id, label, phone, message };
  });
}

function socialsToText(company: CompanyContent) {
  return company.socialChannels
    .map((item) => `${item.id} | ${item.label} | ${item.value} | ${item.href}`)
    .join("\n");
}

function parseSocials(text: string) {
  return parseLines(text).map((line, index) => {
    const [id, label, value, href] = parseDelimitedLine(line);
    if (!id || !label || !href) {
      throw new Error(`Social line ${index + 1} must be: id | label | handle | full URL`);
    }
    return { id, label, value: value || label, href };
  });
}

function branchesToText(items: CompanyBranchLocation[]) {
  return items
    .map((item) =>
      [
        item.id,
        item.name,
        item.state,
        item.city,
        item.address ?? "",
        item.phone ?? "",
        item.hours ?? "",
        item.mapUrl,
        item.marker.x,
        item.marker.y,
      ].join(" | "),
    )
    .join("\n");
}

function parseBranches(text: string): CompanyBranchLocation[] {
  return parseLines(text).map((line, index) => {
    const [id, name, state, city, address, phone, hours, mapUrl, markerX, markerY] =
      parseDelimitedLine(line);
    if (!id || !name || !state || !city || !mapUrl) {
      throw new Error(
        `Branch line ${index + 1} must be: id | name | state | city | address | phone | hours | map URL | marker x | marker y`,
      );
    }
    return {
      id,
      name,
      state,
      city,
      address: address || undefined,
      phone: phone || undefined,
      hours: hours || undefined,
      mapUrl,
      marker: {
        x: Number(markerX || 50),
        y: Number(markerY || 50),
      },
    };
  });
}

function toForm(company: CompanyContent): CompanyFormState {
  return {
    storyText: company.story.join("\n\n"),
    vision: company.vision,
    mission: company.mission,
    founderStoryText: company.founderStory.join("\n\n"),
    coreValuesText: textBlocksToText(company.coreValues),
    milestonesText: textBlocksToText(company.milestones),
    certificationsText: textBlocksToText(company.certifications),
    faqsText: faqsToText(company.faqs),
    contactChannelsText: contactsToText(company),
    whatsappContactsText: whatsappToText(company),
    socialChannelsText: socialsToText(company),
    pendingSocialChannelsText: company.pendingSocialChannels.join("\n"),
    branchLocationsText: branchesToText(company.branchLocations),
    headOfficeMapUrl: company.headOfficeMapUrl,
    headOfficeEmbedMapUrl: company.headOfficeEmbedMapUrl,
    trustCertificationsText: trustToText(company.trustCertifications),
    careersIntro: company.careers.intro,
    careerRolesText: company.careers.roles.join("\n"),
    careerRequirementsText: company.careers.applicationRequirements.join("\n"),
    careerHrEmail: company.careers.hrEmail,
    careerHrPhone: company.careers.hrPhone,
    equalOpportunityText: company.careers.equalOpportunity.join("\n\n"),
  };
}

function buildPayload(form: CompanyFormState, current: CompanyContent): CompanyContent {
  return {
    ...current,
    story: parseParagraphs(form.storyText),
    vision: form.vision.trim(),
    mission: form.mission.trim(),
    founderStory: parseParagraphs(form.founderStoryText),
    coreValues: parseTextBlocks(form.coreValuesText, "Core values"),
    milestones: parseTextBlocks(form.milestonesText, "Milestones"),
    certifications: parseTextBlocks(form.certificationsText, "Certifications"),
    faqs: parseFaqs(form.faqsText),
    contactChannels: parseContacts(form.contactChannelsText),
    whatsappContacts: parseWhatsapp(form.whatsappContactsText),
    socialChannels: parseSocials(form.socialChannelsText),
    pendingSocialChannels: parseLines(form.pendingSocialChannelsText),
    branchLocations: parseBranches(form.branchLocationsText),
    headOfficeMapUrl: form.headOfficeMapUrl.trim(),
    headOfficeEmbedMapUrl: form.headOfficeEmbedMapUrl.trim(),
    trustCertifications: parseTrust(form.trustCertificationsText),
    careers: {
      intro: form.careersIntro.trim(),
      roles: parseLines(form.careerRolesText),
      applicationRequirements: parseLines(form.careerRequirementsText),
      hrEmail: form.careerHrEmail.trim(),
      hrPhone: form.careerHrPhone.trim(),
      equalOpportunity: parseParagraphs(form.equalOpportunityText),
    },
  };
}

function FieldLabel({ children }: { children: string }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
      {children}
    </span>
  );
}

function AdminTextarea({
  value,
  onChange,
  minHeight = "min-h-32",
}: {
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${minHeight} w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm leading-6 text-neutral-900`}
    />
  );
}

export function CompanyManagerClient() {
  const [role, setRole] = useState("Unknown");
  const [company, setCompany] = useState<CompanyContent | null>(null);
  const [form, setForm] = useState<CompanyFormState | null>(null);
  const [activeSection, setActiveSection] = useState<AdminCompanySection>("contacts");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Loading company controls...");

  const canWrite = role === "SUPER_ADMIN" || role === "CONTENT_EDITOR";
  const activeSectionMeta = useMemo(
    () => sections.find((section) => section.id === activeSection) ?? sections[0]!,
    [activeSection],
  );

  const reloadCompany = useCallback(async () => {
    const response = await fetch("/api/admin/company", { cache: "no-store" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to load company controls.");
      return;
    }
    const data = (await response.json()) as CompanyResponse;
    setRole(data.role);
    setCompany(data.company);
    setForm(toForm(data.company));
    setStatus("Company controls ready.");
  }, []);

  useEffect(() => {
    void reloadCompany();
  }, [reloadCompany]);

  function updateForm(partial: Partial<CompanyFormState>) {
    setForm((current) => (current ? { ...current, ...partial } : current));
  }

  async function saveCompany() {
    if (!company || !form) {
      setStatus("Company content is still loading.");
      return;
    }
    if (!canWrite) {
      setStatus("This role has read-only access.");
      return;
    }

    let payload: CompanyContent;
    try {
      payload = buildPayload(form, company);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid company form.");
      return;
    }

    setSaving(true);
    setStatus("Saving company content...");
    const response = await fetch("/api/admin/company", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to save company content.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as CompanyResponse;
    setCompany(data.company);
    setForm(toForm(data.company));
    setStatus("Company content saved and public pages refreshed.");
    setSaving(false);
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    window.location.assign("/admin/login");
  }

  if (!form) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
        <Card>
          <p className="text-sm text-neutral-600">{status}</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <Badge>Website Controls</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Company Content Manager
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-neutral-600">
          Edit the public company details a visitor sees: contacts, social links, About content,
          careers, branch locations, FAQ, and certification text. Role:{" "}
          <span className="font-semibold">{role}</span>.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.36fr_0.64fr]">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Control Areas
          </p>
          <div className="grid gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  activeSection === section.id
                    ? "border-[color:var(--brand-1)] bg-[color:var(--bg-accent-brand)] text-[color:var(--brand-2)]"
                    : "border-[color:var(--border)] bg-white text-neutral-700 hover:border-[color:var(--border-strong)]"
                }`}
              >
                <span className="block text-sm font-semibold">{section.label}</span>
                <span className="mt-1 block text-xs leading-5 opacity-80">{section.description}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveCompany} disabled={saving || !canWrite}>
              {saving ? "Saving..." : "Save Website Content"}
            </Button>
            <Button variant="secondary" onClick={() => void reloadCompany()} disabled={saving}>
              Reload
            </Button>
            <Button variant="secondary" onClick={signOut}>
              Sign Out
            </Button>
          </div>
          <p className="text-xs leading-5 text-neutral-500">{status}</p>
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              {activeSectionMeta.label}
            </p>
            <p className="mt-1 text-sm text-neutral-600">{activeSectionMeta.description}</p>
          </div>

          {activeSection === "contacts" ? (
            <div className="space-y-4">
              <label className="block space-y-2">
                <FieldLabel>Official contact buttons</FieldLabel>
                <AdminTextarea
                  value={form.contactChannelsText}
                  onChange={(value) => updateForm({ contactChannelsText: value })}
                  minHeight="min-h-44"
                />
                <span className="text-xs text-neutral-500">
                  One per line: id | label | visible value | link. Use tel: and mailto: links.
                </span>
              </label>
              <label className="block space-y-2">
                <FieldLabel>WhatsApp departments</FieldLabel>
                <AdminTextarea
                  value={form.whatsappContactsText}
                  onChange={(value) => updateForm({ whatsappContactsText: value })}
                />
                <span className="text-xs text-neutral-500">
                  One per line: id | department | phone | prefilled message.
                </span>
              </label>
              <Input
                value={form.headOfficeEmbedMapUrl}
                onChange={(event) => updateForm({ headOfficeEmbedMapUrl: event.target.value })}
                placeholder="Google Maps embed URL"
              />
              <Input
                value={form.headOfficeMapUrl}
                onChange={(event) => updateForm({ headOfficeMapUrl: event.target.value })}
                placeholder="Google Maps open URL"
              />
            </div>
          ) : null}

          {activeSection === "socials" ? (
            <div className="space-y-4">
              <label className="block space-y-2">
                <FieldLabel>Live social links</FieldLabel>
                <AdminTextarea
                  value={form.socialChannelsText}
                  onChange={(value) => updateForm({ socialChannelsText: value })}
                />
                <span className="text-xs text-neutral-500">
                  One per line: id | network name | handle | full URL.
                </span>
              </label>
              <label className="block space-y-2">
                <FieldLabel>Socials not ready yet</FieldLabel>
                <AdminTextarea
                  value={form.pendingSocialChannelsText}
                  onChange={(value) => updateForm({ pendingSocialChannelsText: value })}
                  minHeight="min-h-24"
                />
              </label>
            </div>
          ) : null}

          {activeSection === "about" ? (
            <div className="space-y-4">
              <label className="block space-y-2">
                <FieldLabel>About Nest Foods Limited</FieldLabel>
                <AdminTextarea
                  value={form.storyText}
                  onChange={(value) => updateForm({ storyText: value })}
                  minHeight="min-h-56"
                />
                <span className="text-xs text-neutral-500">Separate paragraphs with a blank line.</span>
              </label>
              <label className="block space-y-2">
                <FieldLabel>Vision</FieldLabel>
                <AdminTextarea
                  value={form.vision}
                  onChange={(value) => updateForm({ vision: value })}
                  minHeight="min-h-20"
                />
              </label>
              <label className="block space-y-2">
                <FieldLabel>Mission</FieldLabel>
                <AdminTextarea
                  value={form.mission}
                  onChange={(value) => updateForm({ mission: value })}
                  minHeight="min-h-20"
                />
              </label>
              <label className="block space-y-2">
                <FieldLabel>Founder Story</FieldLabel>
                <AdminTextarea
                  value={form.founderStoryText}
                  onChange={(value) => updateForm({ founderStoryText: value })}
                />
              </label>
              <label className="block space-y-2">
                <FieldLabel>Core values</FieldLabel>
                <AdminTextarea
                  value={form.coreValuesText}
                  onChange={(value) => updateForm({ coreValuesText: value })}
                />
                <span className="text-xs text-neutral-500">One per line: title | description.</span>
              </label>
            </div>
          ) : null}

          {activeSection === "careers" ? (
            <div className="space-y-4">
              <label className="block space-y-2">
                <FieldLabel>Careers introduction</FieldLabel>
                <AdminTextarea
                  value={form.careersIntro}
                  onChange={(value) => updateForm({ careersIntro: value })}
                  minHeight="min-h-24"
                />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  type="email"
                  value={form.careerHrEmail}
                  onChange={(event) => updateForm({ careerHrEmail: event.target.value })}
                  placeholder="HR email"
                />
                <Input
                  value={form.careerHrPhone}
                  onChange={(event) => updateForm({ careerHrPhone: event.target.value })}
                  placeholder="HR phone"
                />
              </div>
              <label className="block space-y-2">
                <FieldLabel>Roles</FieldLabel>
                <AdminTextarea
                  value={form.careerRolesText}
                  onChange={(value) => updateForm({ careerRolesText: value })}
                />
              </label>
              <label className="block space-y-2">
                <FieldLabel>Application requirements</FieldLabel>
                <AdminTextarea
                  value={form.careerRequirementsText}
                  onChange={(value) => updateForm({ careerRequirementsText: value })}
                />
              </label>
              <label className="block space-y-2">
                <FieldLabel>Equal opportunity text</FieldLabel>
                <AdminTextarea
                  value={form.equalOpportunityText}
                  onChange={(value) => updateForm({ equalOpportunityText: value })}
                />
              </label>
            </div>
          ) : null}

          {activeSection === "branches" ? (
            <label className="block space-y-2">
              <FieldLabel>Branch/contact locations</FieldLabel>
              <AdminTextarea
                value={form.branchLocationsText}
                onChange={(value) => updateForm({ branchLocationsText: value })}
                minHeight="min-h-72"
              />
              <span className="text-xs text-neutral-500">
                One per line: id | name | state | city | address | phone | hours | map URL | map
                marker x | map marker y.
              </span>
            </label>
          ) : null}

          {activeSection === "trust" ? (
            <div className="space-y-4">
              <label className="block space-y-2">
                <FieldLabel>Homepage trust logos</FieldLabel>
                <AdminTextarea
                  value={form.trustCertificationsText}
                  onChange={(value) => updateForm({ trustCertificationsText: value })}
                />
                <span className="text-xs text-neutral-500">
                  One per line: label | title | short text | logo URL.
                </span>
              </label>
              <label className="block space-y-2">
                <FieldLabel>About page milestones</FieldLabel>
                <AdminTextarea
                  value={form.milestonesText}
                  onChange={(value) => updateForm({ milestonesText: value })}
                />
              </label>
              <label className="block space-y-2">
                <FieldLabel>Certifications and compliance</FieldLabel>
                <AdminTextarea
                  value={form.certificationsText}
                  onChange={(value) => updateForm({ certificationsText: value })}
                  minHeight="min-h-56"
                />
              </label>
            </div>
          ) : null}

          {activeSection === "faq" ? (
            <label className="block space-y-2">
              <FieldLabel>FAQ</FieldLabel>
              <AdminTextarea
                value={form.faqsText}
                onChange={(value) => updateForm({ faqsText: value })}
                minHeight="min-h-72"
              />
              <span className="text-xs text-neutral-500">One per line: question | answer.</span>
            </label>
          ) : null}
        </Card>
      </div>
    </section>
  );
}
