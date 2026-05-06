export const WHATSAPP_CONTACTS = {
  general: {
    label: "General",
    phone: "07066898953",
    message: "Hi, I'd like to contact Nest Foods Limited about De-Nest Bread.",
  },
  sales: {
    label: "Sales",
    phone: "08064107897",
    message: "Hi, I'd like to enquire about De-Nest Bread supply.",
  },
  hr: {
    label: "HR",
    phone: "09116337168",
    message: "Hi, I'd like to enquire about careers at Nest Foods Limited.",
  },
} as const;

export type WhatsAppContactKey = keyof typeof WHATSAPP_CONTACTS;

function normalizeNigeriaPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) {
    return digits;
  }
  if (digits.startsWith("0")) {
    return `234${digits.slice(1)}`;
  }
  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string) {
  return `https://wa.me/${normalizeNigeriaPhone(phone)}?text=${encodeURIComponent(message)}`;
}

export function productWhatsAppMessage(productName: string) {
  return `Hi, I'd like to enquire about ${productName}.`;
}
