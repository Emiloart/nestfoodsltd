import { buildWhatsAppUrl, WHATSAPP_CONTACTS } from "@/lib/whatsapp";
import { COMPANY_FAQS } from "@/lib/company/about";

export type BranchLocation = {
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

export const CONTACT_CHANNELS = [
  { label: "Primary phone", value: "07066898953", href: "tel:+2347066898953" },
  { label: "Secondary phone", value: "08064107897", href: "tel:+2348064107897" },
  { label: "Secondary phone", value: "09116337168", href: "tel:+2349116337168" },
  { label: "Official email", value: "info@nestfoodsltd.com", href: "mailto:info@nestfoodsltd.com" },
  { label: "Product email", value: "sales@nestfoodsltd.com", href: "mailto:sales@nestfoodsltd.com" },
  { label: "HR email", value: "hrsupport@nestfoodsltd.com", href: "mailto:hrsupport@nestfoodsltd.com" },
  {
    label: "Admin email",
    value: "adminsupport@nestfoodsltd.com",
    href: "mailto:adminsupport@nestfoodsltd.com",
  },
] as const;

export const HEAD_OFFICE_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=No.%201%20Nest%20Foods%20Street%20Okochime%20Okpuno%20Awka%20South%20Anambra%20State";
export const HEAD_OFFICE_EMBED_MAP_URL =
  "https://www.google.com/maps?q=No.+1+Nest+Foods+Street,+Okochime+Okpuno,+Awka+South,+Anambra+State&output=embed";

export const BRANCH_LOCATIONS: BranchLocation[] = [
  {
    id: "awka",
    name: "Awka Head Office",
    state: "Anambra",
    city: "Awka",
    address: "No. 1 Nest Foods Street, Okochime Okpuno, Awka South, Anambra State",
    phone: "07066898953, 08064107897",
    hours: "Mondays - Saturdays: 24 hours. Sundays: 6am - 12pm as scheduled.",
    mapUrl: HEAD_OFFICE_MAP_URL,
    coordinates: { latitude: 6.2459, longitude: 7.1194 },
    marker: { x: 57, y: 57 },
  },
  {
    id: "port-harcourt",
    name: "Port Harcourt Contact Location",
    state: "Rivers",
    city: "Port Harcourt",
    address: "No. 14 Old Refinery Road, Elelenwo, Port Harcourt, Rivers State",
    phone: "08114549026",
    hours: "Mondays - Saturdays: 6am - 6pm.",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=No.%2014%20Old%20Refinery%20Road%20Elelenwo%20Port%20Harcourt%20Rivers%20State",
    coordinates: { latitude: 4.8156, longitude: 7.0498 },
    marker: { x: 54, y: 75 },
  },
  {
    id: "owerri",
    name: "Owerri Contact Location",
    state: "Imo",
    city: "Owerri",
    address: "No. 20A Mbonu Ojike Street, Ikenegbu, Owerri, Imo State",
    phone: "09165407850",
    hours: "Mondays - Saturdays: 6am - 6pm.",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=No.%2020A%20Mbonu%20Ojike%20Street%20Ikenegbu%20Owerri%20Imo%20State",
    coordinates: { latitude: 5.485, longitude: 7.0359 },
    marker: { x: 52, y: 66 },
  },
  {
    id: "umuahia",
    name: "Umuahia Contact Location",
    state: "Abia",
    city: "Umuahia",
    address: "No. 1 Club Road by Okpara Square Roundabout, Umuahia, Abia State",
    phone: "07077746092",
    hours: "Mondays - Saturdays: 6am - 6pm.",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=No.%201%20Club%20Road%20by%20Okpara%20Square%20Roundabout%20Umuahia%20Abia%20State",
    coordinates: { latitude: 5.5249, longitude: 7.4946 },
    marker: { x: 58, y: 67 },
  },
  {
    id: "benin",
    name: "Benin Contact Location",
    state: "Edo",
    city: "Benin City",
    address: "No. 1 Uwa Lane off Wire Road, Benin City, Edo State",
    phone: "08125927131",
    hours: "Mondays - Saturdays: 6am - 6pm.",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=No.%201%20Uwa%20Lane%20off%20Wire%20Road%20Benin%20City%20Edo%20State",
    coordinates: { latitude: 6.335, longitude: 5.6037 },
    marker: { x: 38, y: 56 },
  },
  {
    id: "aba",
    name: "Aba Contact Location",
    state: "Abia",
    city: "Aba",
    address: "Port Harcourt Road Area",
    phone: "Contact head office for details",
    hours: "Mondays - Saturdays: 6am - 6pm.",
    notes: "Phone contact was not supplied in the PDF source.",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Port%20Harcourt%20Road%20Aba",
    coordinates: { latitude: 5.1216, longitude: 7.3733 },
    marker: { x: 56, y: 71 },
  },
  {
    id: "akwa-ibom",
    name: "Akwa-Ibom Contact Location",
    state: "Akwa Ibom",
    city: "Uyo",
    address: "Contact head office for details",
    phone: "Contact head office for details",
    hours: "Mondays - Saturdays: 6am - 6pm.",
    notes: "Address and phone contact were not supplied in the PDF source.",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Uyo%20Akwa%20Ibom%20State",
    coordinates: { latitude: 5.0377, longitude: 7.9128 },
    marker: { x: 62, y: 75 },
  },
];

export const SOCIAL_CHANNELS = [
  { label: "Facebook", value: "nest.foods.2025", href: "https://www.facebook.com/nest.foods.2025" },
] as const;

export const PENDING_SOCIAL_CHANNELS = ["X", "Instagram", "TikTok", "YouTube", "LinkedIn"];

export const TRUST_CERTIFICATIONS = [
  {
    label: "NAFDAC",
    title: "NAFDAC registered",
    body: "NAFDAC REG: ANO1T2BAWK.",
    logoUrl: "/brand/certifications/nafdac-logo.png",
  },
  {
    label: "SON",
    title: "Standards focus",
    body: "SON-certified products with periodic inspections.",
    logoUrl: "/brand/certifications/son-logo.png",
  },
  {
    label: "NESREA",
    title: "Environmental compliance",
    body: "Responsible environmental practices and regulatory alignment.",
    logoUrl: "/brand/certifications/nesrea-logo.jpeg",
  },
  {
    label: "QC",
    title: "Quality control",
    body: "Ingredient, baking, packaging, and distribution checks.",
    logoUrl: "/brand/certifications/qc.svg",
  },
] as const;

export const SAFE_FAQS = COMPANY_FAQS;

export const WHATSAPP_LINKS = {
  general: buildWhatsAppUrl(WHATSAPP_CONTACTS.general.phone, WHATSAPP_CONTACTS.general.message),
  sales: buildWhatsAppUrl(WHATSAPP_CONTACTS.sales.phone, WHATSAPP_CONTACTS.sales.message),
  hr: buildWhatsAppUrl(WHATSAPP_CONTACTS.hr.phone, WHATSAPP_CONTACTS.hr.message),
} as const;
