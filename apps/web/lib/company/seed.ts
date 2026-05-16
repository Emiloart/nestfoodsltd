import {
  COMPANY_CERTIFICATIONS,
  COMPANY_FAQS,
  COMPANY_MILESTONES,
  COMPANY_MISSION,
  COMPANY_STORY,
  COMPANY_VISION,
  CORE_VALUES,
  FOUNDER_STORY,
} from "@/lib/company/about";
import {
  BRANCH_LOCATIONS,
  CONTACT_CHANNELS,
  HEAD_OFFICE_EMBED_MAP_URL,
  HEAD_OFFICE_MAP_URL,
  PENDING_SOCIAL_CHANNELS,
  SOCIAL_CHANNELS,
  TRUST_CERTIFICATIONS,
} from "@/lib/company/contact";
import { WHATSAPP_CONTACTS } from "@/lib/whatsapp";

import { type CompanyContent } from "./types";

export const COMPANY_CONTENT_SEED_DATA: CompanyContent = {
  story: [...COMPANY_STORY],
  vision: COMPANY_VISION,
  mission: COMPANY_MISSION,
  founderStory: [...FOUNDER_STORY],
  coreValues: [...CORE_VALUES],
  milestones: [...COMPANY_MILESTONES],
  certifications: [...COMPANY_CERTIFICATIONS],
  faqs: [...COMPANY_FAQS],
  contactChannels: CONTACT_CHANNELS.map((channel, index) => ({
    id: `${channel.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${index + 1}`,
    label: channel.label,
    value: channel.value,
    href: channel.href,
  })),
  whatsappContacts: Object.entries(WHATSAPP_CONTACTS).map(([id, contact]) => ({
    id,
    label: contact.label,
    phone: contact.phone,
    message: contact.message,
  })),
  socialChannels: [...SOCIAL_CHANNELS].map((channel) => ({
    id: channel.label.toLowerCase(),
    label: channel.label,
    value: channel.value,
    href: channel.href,
  })),
  pendingSocialChannels: [...PENDING_SOCIAL_CHANNELS],
  branchLocations: [...BRANCH_LOCATIONS],
  headOfficeMapUrl: HEAD_OFFICE_MAP_URL,
  headOfficeEmbedMapUrl: HEAD_OFFICE_EMBED_MAP_URL,
  trustCertifications: [...TRUST_CERTIFICATIONS],
  careers: {
    intro:
      "Nest Foods Limited welcomes career enquiries from people who want to contribute to production, quality, operations, and company growth.",
    roles: [
      "Production workers",
      "Management workers",
      "Accountants",
      "Sales personnel",
      "Marketing and distribution workers",
      "Drivers",
      "Cleaners",
      "Other support roles",
    ],
    applicationRequirements: [
      "Full name",
      "Phone number",
      "Email address",
      "CV",
      "Application letter addressed to the Manager, Nest Foods Limited Awka",
      "Position applying for",
      "Years of experience and relevant work history",
      "Driver's license or cover note where required for driving roles",
    ],
    hrEmail: "hrsupport@nestfoodsltd.com",
    hrPhone: "09116337168",
    equalOpportunity: [
      "Nest Foods Limited hires across different backgrounds of education, skills, experiences, and exposure. The company is committed to a diverse and inclusive workplace where employees are treated with fairness and respect.",
      "Employment decisions are based on business needs and merit, while recognising qualifications, skills, and previous experience where applicable and necessary.",
    ],
  },
  updatedAt: new Date(0).toISOString(),
};
