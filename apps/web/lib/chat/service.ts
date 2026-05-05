import { unstable_noStore as noStore } from "next/cache";

import { listCatalogueProducts } from "@/lib/catalog/service";

import { readChatData, writeChatData } from "./store";
import {
  type ChatConversation,
  type ChatData,
  type ChatIntent,
  type ChatLead,
  type ChatMessage,
  type ChatQuickAction,
  type ChatSuggestedLink,
  chatIntentValues,
} from "./types";

type IntentResolution = {
  intent: ChatIntent;
  confidence: number;
};

type ChatReply = {
  intent: ChatIntent;
  confidence: number;
  answer: string;
  quickActions: ChatQuickAction[];
  suggestedLinks: ChatSuggestedLink[];
  handoffSuggested: boolean;
  handoffReason?: string;
};

type ConversationContext = {
  conversation: ChatConversation;
  recentMessages: ChatMessage[];
  previousIntent: ChatIntent;
};

export type AskChatAgentInput = {
  message: string;
  conversationId?: string;
  sessionId?: string;
};

export type AskChatAgentResult = {
  conversationId: string;
  sessionId: string;
  userMessageId: string;
  assistantMessageId: string;
  answer: string;
  intent: ChatIntent;
  confidence: number;
  quickActions: ChatQuickAction[];
  suggestedLinks: ChatSuggestedLink[];
  handoffSuggested: boolean;
  handoffReason?: string;
  createdAt: string;
};

export type CaptureChatLeadInput = {
  conversationId?: string;
  sessionId?: string;
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  sourceIntent?: ChatIntent;
};

export type CaptureChatLeadResult = {
  conversationId: string;
  sessionId: string;
  lead: ChatLead;
};

const intentSet = new Set<ChatIntent>(chatIntentValues);

const defaultQuickActions: ChatQuickAction[] = [
  { label: "Products", prompt: "Show me the De-Nest Bread product range." },
  { label: "About", prompt: "Tell me about Nest Foods Limited." },
  { label: "Careers", prompt: "How can I learn about careers?" },
  { label: "Contact", prompt: "Help me contact the team." },
];

const defaultSuggestedLinks: ChatSuggestedLink[] = [
  { label: "Products", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

function sanitizeMessage(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function clipConfidence(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

function normalizeQuickActions(actions: ChatQuickAction[]) {
  const seen = new Set<string>();
  const normalized: ChatQuickAction[] = [];
  for (const action of actions) {
    const label = action.label.trim();
    const prompt = action.prompt.trim();
    const key = `${label}:${prompt}`.toLowerCase();
    if (!label || !prompt || seen.has(key)) {
      continue;
    }
    seen.add(key);
    normalized.push({ label, prompt });
  }
  return normalized.slice(0, 4);
}

function normalizeSuggestedLinks(links: ChatSuggestedLink[]) {
  const seen = new Set<string>();
  const normalized: ChatSuggestedLink[] = [];
  for (const link of links) {
    const label = link.label.trim();
    const href = link.href.trim();
    if (!label || !href || seen.has(href)) {
      continue;
    }
    seen.add(href);
    normalized.push({ label, href });
  }
  return normalized.slice(0, 4);
}

function resolveConversation(
  data: ChatData,
  input: { conversationId?: string; sessionId?: string },
): ChatConversation {
  const requestedId = input.conversationId?.trim();
  const existing = requestedId
    ? data.conversations.find((entry) => entry.id === requestedId)
    : null;
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const conversation: ChatConversation = {
    id: `chat-${crypto.randomUUID()}`,
    sessionId: input.sessionId?.trim() || `chat-session-${crypto.randomUUID()}`,
    channel: "web_widget",
    status: "open",
    lastIntent: "unknown",
    lastConfidence: 0,
    lastMessageAt: now,
    createdAt: now,
    updatedAt: now,
  };
  data.conversations.unshift(conversation);
  return conversation;
}

function buildConversationContext(data: ChatData, conversation: ChatConversation): ConversationContext {
  const recentMessages = data.messages
    .filter((entry) => entry.conversationId === conversation.id)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .slice(-8);

  return {
    conversation,
    recentMessages,
    previousIntent: conversation.lastIntent,
  };
}

function trimConversationMessages(data: ChatData, conversationId: string) {
  const conversationMessages = data.messages
    .filter((entry) => entry.conversationId === conversationId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const keepIds = new Set(conversationMessages.slice(0, 40).map((entry) => entry.id));
  data.messages = data.messages.filter(
    (entry) => entry.conversationId !== conversationId || keepIds.has(entry.id),
  );
}

function includesAny(message: string, keywords: string[]) {
  return keywords.some((keyword) => message.includes(keyword));
}

function resolveIntent(message: string, context: ConversationContext): IntentResolution {
  const normalized = message.toLowerCase();

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalized)) {
    return { intent: "greeting", confidence: 0.95 };
  }

  if (includesAny(normalized, ["career", "job", "hiring", "vacancy", "cv", "hr", "work"])) {
    return { intent: "careers", confidence: 0.9 };
  }

  if (
    includesAny(normalized, [
      "contact",
      "phone",
      "call",
      "email",
      "whatsapp",
      "address",
      "location",
      "social",
      "enquiry",
      "reach",
    ])
  ) {
    return { intent: "contact_enquiry", confidence: 0.9 };
  }

  if (includesAny(normalized, ["allergen", "allergy", "gluten", "wheat", "milk", "soya"])) {
    return { intent: "allergen_info", confidence: 0.86 };
  }

  if (
    includesAny(normalized, [
      "product",
      "bread",
      "loaf",
      "jumbo",
      "family",
      "midi",
      "mini",
      "size",
      "ingredient",
    ])
  ) {
    return { intent: "product_info", confidence: 0.86 };
  }

  if (
    includesAny(normalized, [
      "about",
      "company",
      "founder",
      "mission",
      "vision",
      "value",
      "quality",
      "standard",
      "nafdac",
      "son",
      "nesrea",
    ])
  ) {
    return { intent: "company_info", confidence: 0.86 };
  }

  if (context.previousIntent !== "unknown") {
    return { intent: context.previousIntent, confidence: 0.58 };
  }

  return { intent: "unknown", confidence: 0.44 };
}

function buildGreetingReply(): ChatReply {
  return {
    intent: "greeting",
    confidence: 0.96,
    answer:
      "Hi. I can help with De-Nest Bread products, ingredients, allergen notes, company information, careers, and contact details.",
    quickActions: defaultQuickActions,
    suggestedLinks: defaultSuggestedLinks,
    handoffSuggested: false,
  };
}

async function buildProductReply(message: string): Promise<ChatReply> {
  const products = await listCatalogueProducts({ search: message });
  const fallbackProducts = products.length > 0 ? products : await listCatalogueProducts();
  const summary = fallbackProducts
    .slice(0, 4)
    .map((product) => {
      const sizes = product.packFormats.map((format) => format.label).join(", ");
      return `${product.name}: ${product.shortDescription} Size: ${sizes}.`;
    })
    .join("\n");

  return {
    intent: "product_info",
    confidence: fallbackProducts.length > 0 ? 0.88 : 0.58,
    answer:
      summary ||
      "The De-Nest Bread catalogue is being prepared. Use the contact page for product enquiries.",
    quickActions: normalizeQuickActions([
      { label: "Allergens", prompt: "Show allergen notes for the products." },
      { label: "Contact", prompt: "Help me contact the team." },
      ...defaultQuickActions,
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      { label: "Products", href: "/shop" },
      { label: "Contact", href: "/contact" },
    ]),
    handoffSuggested: false,
  };
}

async function buildAllergenReply(): Promise<ChatReply> {
  const products = await listCatalogueProducts();
  const allergens = [...new Set(products.flatMap((product) => product.allergens))].join(", ");

  return {
    intent: "allergen_info",
    confidence: 0.88,
    answer:
      allergens.length > 0
        ? `Current product allergen notes: ${allergens}. Review each product page or contact Nest Foods Limited for specific product guidance.`
        : "Allergen notes are being prepared for the catalogue. Use the contact page for specific product guidance.",
    quickActions: normalizeQuickActions([
      { label: "Products", prompt: "Show me the De-Nest Bread product range." },
      { label: "Contact", prompt: "Help me contact the team." },
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      { label: "Products", href: "/shop" },
      { label: "Contact", href: "/contact" },
    ]),
    handoffSuggested: false,
  };
}

function buildCompanyReply(): ChatReply {
  return {
    intent: "company_info",
    confidence: 0.88,
    answer:
      "De-Nest Bread is the public brand of Nest Foods Limited. The company was incorporated on 18 November 2022, operates from Awka, Anambra State, and focuses on hygienic bread production, selected ingredients, quality control, and consistent bakery products.",
    quickActions: normalizeQuickActions([
      { label: "Vision", prompt: "Tell me about the company vision." },
      { label: "Products", prompt: "Show me the De-Nest Bread product range." },
      { label: "Contact", prompt: "Help me contact the team." },
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      { label: "About", href: "/about" },
      { label: "Vision", href: "/vision" },
      { label: "Contact", href: "/contact" },
    ]),
    handoffSuggested: false,
  };
}

function buildCareersReply(): ChatReply {
  return {
    intent: "careers",
    confidence: 0.9,
    answer:
      "Nest Foods Limited accepts career enquiries for production, management, accounting, sales, marketing and distribution, driving, cleaning, and support roles. HR contact: hrsupport@nestfoodsltd.com or 09116337168.",
    quickActions: normalizeQuickActions([
      { label: "Careers page", prompt: "Open careers guidance." },
      { label: "Contact", prompt: "Help me contact the team." },
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ]),
    handoffSuggested: false,
  };
}

function buildContactReply(): ChatReply {
  return {
    intent: "contact_enquiry",
    confidence: 0.9,
    answer:
      "You can contact Nest Foods Limited by phone on 07066898953, 08064107897, or 09116337168. Official emails are info@nestfoodsltd.com, sales@nestfoodsltd.com, hrsupport@nestfoodsltd.com, and adminsupport@nestfoodsltd.com.",
    quickActions: normalizeQuickActions([
      { label: "Products", prompt: "Show me the De-Nest Bread product range." },
      { label: "Careers", prompt: "How can I learn about careers?" },
    ]),
    suggestedLinks: normalizeSuggestedLinks([{ label: "Contact", href: "/contact" }]),
    handoffSuggested: true,
    handoffReason: "Contact details are the right next step for this request.",
  };
}

function buildUnknownReply(): ChatReply {
  return {
    intent: "unknown",
    confidence: 0.44,
    answer:
      "I do not have a strong match for that request. I can help with De-Nest Bread products, ingredients, allergen notes, company information, careers, and contact details.",
    quickActions: defaultQuickActions,
    suggestedLinks: defaultSuggestedLinks,
    handoffSuggested: true,
    handoffReason: "Low answer confidence for the current request.",
  };
}

async function buildReply(input: {
  message: string;
  intent: ChatIntent;
  context: ConversationContext;
}) {
  const normalizedIntent = intentSet.has(input.intent) ? input.intent : "unknown";
  switch (normalizedIntent) {
    case "greeting":
      return buildGreetingReply();
    case "product_info":
      return buildProductReply(input.message);
    case "allergen_info":
      return buildAllergenReply();
    case "company_info":
      return buildCompanyReply();
    case "careers":
      return buildCareersReply();
    case "contact_enquiry":
      return buildContactReply();
    case "unknown":
    default:
      return buildUnknownReply();
  }
}

export async function askChatAgent(input: AskChatAgentInput): Promise<AskChatAgentResult> {
  const message = sanitizeMessage(input.message);
  if (!message) {
    throw new Error("Message is required.");
  }

  const data = await readChatData();
  const conversation = resolveConversation(data, {
    conversationId: input.conversationId,
    sessionId: input.sessionId,
  });
  const context = buildConversationContext(data, conversation);
  const intentResolution = resolveIntent(message, context);
  const reply = await buildReply({
    message,
    intent: intentResolution.intent,
    context,
  });

  const now = new Date().toISOString();
  const userMessage: ChatMessage = {
    id: crypto.randomUUID(),
    conversationId: conversation.id,
    role: "user",
    content: message,
    intent: intentResolution.intent,
    confidence: clipConfidence(intentResolution.confidence),
    createdAt: now,
  };
  const assistantMessage: ChatMessage = {
    id: crypto.randomUUID(),
    conversationId: conversation.id,
    role: "assistant",
    content: reply.answer,
    intent: reply.intent,
    confidence: clipConfidence(reply.confidence),
    createdAt: now,
  };

  data.messages.push(userMessage, assistantMessage);
  trimConversationMessages(data, conversation.id);

  conversation.status = reply.handoffSuggested ? "handoff_requested" : "open";
  conversation.lastIntent = reply.intent;
  conversation.lastConfidence = clipConfidence(reply.confidence);
  conversation.lastMessageAt = now;
  conversation.updatedAt = now;

  await writeChatData(data);

  return {
    conversationId: conversation.id,
    sessionId: conversation.sessionId,
    userMessageId: userMessage.id,
    assistantMessageId: assistantMessage.id,
    answer: reply.answer,
    intent: reply.intent,
    confidence: clipConfidence(reply.confidence),
    quickActions: normalizeQuickActions(reply.quickActions),
    suggestedLinks: normalizeSuggestedLinks(reply.suggestedLinks),
    handoffSuggested: reply.handoffSuggested,
    handoffReason: reply.handoffReason,
    createdAt: assistantMessage.createdAt,
  };
}

export async function captureChatLead(input: CaptureChatLeadInput): Promise<CaptureChatLeadResult> {
  const message = sanitizeMessage(input.message);
  const normalizedEmail = input.email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("A valid email is required.");
  }
  if (!message) {
    throw new Error("Lead message is required.");
  }

  const data = await readChatData();
  const conversation = resolveConversation(data, {
    conversationId: input.conversationId,
    sessionId: input.sessionId,
  });
  const now = new Date().toISOString();

  const lead: ChatLead = {
    id: crypto.randomUUID(),
    conversationId: conversation.id,
    name: input.name?.trim() || undefined,
    email: normalizedEmail,
    phone: input.phone?.trim() || undefined,
    company: input.company?.trim() || undefined,
    message,
    sourceIntent:
      input.sourceIntent && intentSet.has(input.sourceIntent) ? input.sourceIntent : undefined,
    status: "new",
    createdAt: now,
  };

  data.leads.unshift(lead);
  conversation.status = "handoff_requested";
  conversation.updatedAt = now;
  conversation.lastMessageAt = now;
  await writeChatData(data);

  return {
    conversationId: conversation.id,
    sessionId: conversation.sessionId,
    lead,
  };
}

export async function listChatConversationMessages(conversationId: string) {
  noStore();
  const data = await readChatData();
  return data.messages
    .filter((entry) => entry.conversationId === conversationId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}
