export type EnquiryLeadType = "bulk" | "distributor";

export type EnquiryLeadStatus = "new" | "reviewed";

export type EnquiryLead = {
  id: string;
  type: EnquiryLeadType;
  fullName: string;
  phone: string;
  email?: string;
  location?: string;
  productInterest?: string;
  quantity?: string;
  businessType?: string;
  capacity?: string;
  message?: string;
  status: EnquiryLeadStatus;
  createdAt: string;
};

export type EnquiriesData = {
  enquiries: EnquiryLead[];
};
