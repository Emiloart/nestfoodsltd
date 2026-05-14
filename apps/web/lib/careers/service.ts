import { unstable_noStore as noStore } from "next/cache";

import { readCareersData, writeCareersData } from "./store";

const MAX_APPLICATIONS = 10_000;

export async function captureCareerApplication(input: {
  fullName: string;
  phone: string;
  email: string;
  position: string;
  yearsOfExperience?: string;
  otherExperience?: string;
  fileNames?: string[];
}) {
  const data = await readCareersData();
  const application = {
    id: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    position: input.position.trim(),
    yearsOfExperience: input.yearsOfExperience?.trim() || undefined,
    otherExperience: input.otherExperience?.trim() || undefined,
    fileNames: input.fileNames?.map((fileName) => fileName.trim()).filter(Boolean) ?? [],
    status: "new" as const,
    createdAt: new Date().toISOString(),
  };

  data.applications.unshift(application);
  if (data.applications.length > MAX_APPLICATIONS) {
    data.applications = data.applications.slice(0, MAX_APPLICATIONS);
  }

  await writeCareersData(data);
  return application;
}

export async function listCareerApplications(limit = 100) {
  noStore();
  const data = await readCareersData();
  return data.applications.slice(0, Math.min(Math.max(limit, 1), 500));
}
