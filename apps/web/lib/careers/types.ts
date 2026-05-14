export type CareerApplicationStatus = "new" | "reviewed";

export type CareerApplication = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  position: string;
  yearsOfExperience?: string;
  otherExperience?: string;
  fileNames: string[];
  status: CareerApplicationStatus;
  createdAt: string;
};

export type CareersData = {
  applications: CareerApplication[];
};
