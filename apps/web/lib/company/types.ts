export type CompanyTextBlock = {
  title: string;
  body: string;
};

export type CompanyFaq = {
  question: string;
  answer: string;
};

export type CompanyContactChannel = {
  id: string;
  label: string;
  value: string;
  href: string;
};

export type CompanySocialChannel = {
  id: string;
  label: string;
  value: string;
  href: string;
};

export type CompanyWhatsAppContact = {
  id: "general" | "sales" | "hr" | string;
  label: string;
  phone: string;
  message: string;
};

export type CompanyBranchLocation = {
  id: string;
  name: string;
  state: string;
  city: string;
  address?: string;
  phone?: string;
  hours?: string;
  mapUrl: string;
  notes?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  marker: {
    x: number;
    y: number;
  };
};

export type CompanyTrustCertification = {
  label: string;
  title: string;
  body: string;
  logoUrl: string;
};

export type CompanyCareersContent = {
  intro: string;
  roles: string[];
  applicationRequirements: string[];
  hrEmail: string;
  hrPhone: string;
  equalOpportunity: string[];
};

export type CompanyContent = {
  story: string[];
  vision: string;
  mission: string;
  founderStory: string[];
  coreValues: CompanyTextBlock[];
  milestones: CompanyTextBlock[];
  certifications: CompanyTextBlock[];
  faqs: CompanyFaq[];
  contactChannels: CompanyContactChannel[];
  whatsappContacts: CompanyWhatsAppContact[];
  socialChannels: CompanySocialChannel[];
  pendingSocialChannels: string[];
  branchLocations: CompanyBranchLocation[];
  headOfficeMapUrl: string;
  headOfficeEmbedMapUrl: string;
  trustCertifications: CompanyTrustCertification[];
  careers: CompanyCareersContent;
  updatedAt: string;
};
