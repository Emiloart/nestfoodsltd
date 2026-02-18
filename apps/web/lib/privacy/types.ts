export type PrivacyConsentCategories = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
};

export type PrivacyConsentRecord = {
  id: string;
  subjectId: string;
  locale?: string;
  source: "banner" | "privacy-page" | "api";
  categories: PrivacyConsentCategories;
  ipAddress?: string;
  userAgent?: string;
  consentedAt: string;
};

export type PrivacyDataRequestType = "export" | "delete";

export type PrivacyDataRequestStatus = "submitted" | "in_review" | "completed" | "rejected";

export type PrivacyDataRequest = {
  id: string;
  email: string;
  fullName?: string;
  type: PrivacyDataRequestType;
  message?: string;
  status: PrivacyDataRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type PrivacyData = {
  consents: PrivacyConsentRecord[];
  dataRequests: PrivacyDataRequest[];
};
