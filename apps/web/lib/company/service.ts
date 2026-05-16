import { readCompanyContent, writeCompanyContent } from "./store";
import {
  type CompanyBranchLocation,
  type CompanyCareersContent,
  type CompanyContactChannel,
  type CompanyContent,
  type CompanyFaq,
  type CompanySocialChannel,
  type CompanyTextBlock,
  type CompanyTrustCertification,
  type CompanyWhatsAppContact,
} from "./types";

function slugify(value: string, fallback: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function compactLines(items: string[]) {
  return items.map((entry) => entry.trim()).filter(Boolean);
}

function normalizeTextBlocks(items: CompanyTextBlock[]) {
  return items
    .map((item) => ({
      title: item.title.trim(),
      body: item.body.trim(),
    }))
    .filter((item) => item.title && item.body);
}

function normalizeFaqs(items: CompanyFaq[]) {
  return items
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer);
}

function normalizeContactChannels(items: CompanyContactChannel[]) {
  return items
    .map((item, index) => ({
      id: item.id?.trim() || slugify(`${item.label}-${index}`, `contact-${index + 1}`),
      label: item.label.trim(),
      value: item.value.trim(),
      href: item.href.trim(),
    }))
    .filter((item) => item.label && item.value && item.href);
}

function normalizeSocialChannels(items: CompanySocialChannel[]) {
  return items
    .map((item, index) => ({
      id: item.id?.trim() || slugify(`${item.label}-${index}`, `social-${index + 1}`),
      label: item.label.trim(),
      value: item.value.trim(),
      href: item.href.trim(),
    }))
    .filter((item) => item.label && item.href);
}

function normalizeWhatsAppContacts(items: CompanyWhatsAppContact[]) {
  return items
    .map((item, index) => ({
      id: item.id?.trim() || slugify(`${item.label}-${index}`, `whatsapp-${index + 1}`),
      label: item.label.trim(),
      phone: item.phone.trim(),
      message: item.message.trim(),
    }))
    .filter((item) => item.label && item.phone && item.message);
}

function normalizeBranches(items: CompanyBranchLocation[]) {
  return items
    .map((item, index) => ({
      id: item.id?.trim() || slugify(`${item.name}-${index}`, `branch-${index + 1}`),
      name: item.name.trim(),
      state: item.state.trim(),
      city: item.city.trim(),
      address: item.address?.trim() || undefined,
      phone: item.phone?.trim() || undefined,
      hours: item.hours?.trim() || undefined,
      mapUrl: item.mapUrl.trim(),
      notes: item.notes?.trim() || undefined,
      coordinates: item.coordinates,
      marker: item.marker ?? { x: 50, y: 50 },
    }))
    .filter((item) => item.name && item.state && item.city && item.mapUrl);
}

function normalizeTrustCertifications(items: CompanyTrustCertification[]) {
  return items
    .map((item) => ({
      label: item.label.trim(),
      title: item.title.trim(),
      body: item.body.trim(),
      logoUrl: item.logoUrl.trim(),
    }))
    .filter((item) => item.label && item.title && item.body && item.logoUrl);
}

function normalizeCareers(input: CompanyCareersContent, fallback: CompanyCareersContent) {
  return {
    intro: input.intro?.trim() || fallback.intro,
    roles: compactLines(input.roles ?? fallback.roles),
    applicationRequirements: compactLines(
      input.applicationRequirements ?? fallback.applicationRequirements,
    ),
    hrEmail: input.hrEmail?.trim() || fallback.hrEmail,
    hrPhone: input.hrPhone?.trim() || fallback.hrPhone,
    equalOpportunity: compactLines(input.equalOpportunity ?? fallback.equalOpportunity),
  };
}

export async function getCompanyContent() {
  return readCompanyContent();
}

export async function updateCompanyContent(input: CompanyContent) {
  const current = await readCompanyContent();
  const next: CompanyContent = {
    story: compactLines(input.story),
    vision: input.vision.trim(),
    mission: input.mission.trim(),
    founderStory: compactLines(input.founderStory),
    coreValues: normalizeTextBlocks(input.coreValues),
    milestones: normalizeTextBlocks(input.milestones),
    certifications: normalizeTextBlocks(input.certifications),
    faqs: normalizeFaqs(input.faqs),
    contactChannels: normalizeContactChannels(input.contactChannels),
    whatsappContacts: normalizeWhatsAppContacts(input.whatsappContacts),
    socialChannels: normalizeSocialChannels(input.socialChannels),
    pendingSocialChannels: compactLines(input.pendingSocialChannels),
    branchLocations: normalizeBranches(input.branchLocations),
    headOfficeMapUrl: input.headOfficeMapUrl.trim(),
    headOfficeEmbedMapUrl: input.headOfficeEmbedMapUrl.trim(),
    trustCertifications: normalizeTrustCertifications(input.trustCertifications),
    careers: normalizeCareers(input.careers, current.careers),
    updatedAt: new Date().toISOString(),
  };

  await writeCompanyContent(next);
  return next;
}
