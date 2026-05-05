export const chatIntentValues = [
  "greeting",
  "product_info",
  "allergen_info",
  "company_info",
  "careers",
  "contact_enquiry",
  "unknown",
] as const;

export type ChatIntent = (typeof chatIntentValues)[number];

export type ChatConversationStatus = "open" | "handoff_requested" | "resolved";

export type ChatConversation = {
  id: string;
  sessionId: string;
  channel: "web_widget";
  status: ChatConversationStatus;
  lastIntent: ChatIntent;
  lastConfidence: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  intent?: ChatIntent;
  confidence?: number;
  createdAt: string;
};

export type ChatLead = {
  id: string;
  conversationId: string;
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  sourceIntent?: ChatIntent;
  status: "new" | "contacted" | "closed";
  createdAt: string;
};

export type ChatQuickAction = {
  label: string;
  prompt: string;
};

export type ChatSuggestedLink = {
  label: string;
  href: string;
};

export type ChatData = {
  conversations: ChatConversation[];
  messages: ChatMessage[];
  leads: ChatLead[];
};
