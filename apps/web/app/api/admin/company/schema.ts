import { z } from "zod";

const textBlockSchema = z.object({
  title: z.string().trim().min(1).max(180),
  body: z.string().trim().min(1).max(4000),
});

const faqSchema = z.object({
  question: z.string().trim().min(1).max(260),
  answer: z.string().trim().min(1).max(4000),
});

const contactChannelSchema = z.object({
  id: z.string().trim().min(1).max(120),
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(180),
  href: z.string().trim().min(3).max(400),
});

const socialChannelSchema = z.object({
  id: z.string().trim().min(1).max(120),
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().max(180),
  href: z.string().trim().min(3).max(400),
});

const whatsAppContactSchema = z.object({
  id: z.string().trim().min(1).max(120),
  label: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(7).max(40),
  message: z.string().trim().min(1).max(400),
});

const branchLocationSchema = z.object({
  id: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(180),
  state: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(120),
  address: z.string().trim().max(500).optional(),
  phone: z.string().trim().max(120).optional(),
  hours: z.string().trim().max(220).optional(),
  mapUrl: z.string().trim().min(3).max(700),
  notes: z.string().trim().max(400).optional(),
  coordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  marker: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
  }),
});

const trustCertificationSchema = z.object({
  label: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(180),
  body: z.string().trim().min(1).max(700),
  logoUrl: z.string().trim().min(3).max(400),
});

const careersSchema = z.object({
  intro: z.string().trim().min(1).max(1200),
  roles: z.array(z.string().trim().min(1).max(160)).max(40),
  applicationRequirements: z.array(z.string().trim().min(1).max(220)).max(40),
  hrEmail: z.string().trim().email().max(180),
  hrPhone: z.string().trim().min(7).max(40),
  equalOpportunity: z.array(z.string().trim().min(1).max(1600)).max(8),
});

export const updateCompanyContentSchema = z.object({
  story: z.array(z.string().trim().min(1).max(3000)).min(1).max(16),
  vision: z.string().trim().min(1).max(1000),
  mission: z.string().trim().min(1).max(1000),
  founderStory: z.array(z.string().trim().min(1).max(3000)).min(1).max(8),
  coreValues: z.array(textBlockSchema).min(1).max(20),
  milestones: z.array(textBlockSchema).max(24),
  certifications: z.array(textBlockSchema).max(24),
  faqs: z.array(faqSchema).max(24),
  contactChannels: z.array(contactChannelSchema).min(1).max(24),
  whatsappContacts: z.array(whatsAppContactSchema).min(1).max(8),
  socialChannels: z.array(socialChannelSchema).max(12),
  pendingSocialChannels: z.array(z.string().trim().min(1).max(80)).max(12),
  branchLocations: z.array(branchLocationSchema).max(24),
  headOfficeMapUrl: z.string().trim().min(3).max(700),
  headOfficeEmbedMapUrl: z.string().trim().min(3).max(700),
  trustCertifications: z.array(trustCertificationSchema).max(12),
  careers: careersSchema,
  updatedAt: z.string().trim().optional(),
});
