import { unstable_noStore as noStore } from "next/cache";

import { formatCurrency } from "@/lib/commerce/format";
import {
  listCommerceFacets,
  listCommerceProducts,
  listOrdersByEmail,
} from "@/lib/commerce/service";
import { searchRecipes } from "@/lib/recipes/service";
import { lookupTraceabilityBatch } from "@/lib/traceability/service";

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

const defaultQuickActions: ChatQuickAction[] = [
  { label: "Find bread options", prompt: "Show me your bread options." },
  { label: "Allergen help", prompt: "Which products are safe for gluten-sensitive customers?" },
  { label: "Track my order", prompt: "Help me check my order status." },
  { label: "B2B support", prompt: "I need distributor quote support." },
];

const defaultSuggestedLinks: ChatSuggestedLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "Traceability", href: "/traceability" },
  { label: "Distributor Portal", href: "/b2b" },
];

const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "have",
  "please",
  "help",
  "need",
  "show",
  "about",
  "what",
  "which",
  "where",
  "when",
  "into",
  "your",
  "our",
  "just",
  "want",
  "some",
  "any",
]);

const intentSet = new Set<ChatIntent>(chatIntentValues);

function normalizeToken(value: string) {
  return value.trim().toLowerCase();
}

function sanitizeMessage(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 1200);
}

function clipConfidence(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

function includesAny(haystack: string, needles: string[]) {
  return needles.some((needle) => haystack.includes(needle));
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ");
}

function formatOrderStatus(status: string) {
  return status.replace(/_/g, " ");
}

function buildConversationId() {
  return `chat-${crypto.randomUUID()}`;
}

function buildSessionId() {
  return `chat-session-${crypto.randomUUID()}`;
}

function extractEmail(value: string) {
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0]?.toLowerCase();
}

function extractOrderNumber(value: string) {
  const match = value.match(/\bNFL-\d{4}-\d{4}\b/i);
  return match?.[0]?.toUpperCase();
}

function extractBatchCode(value: string) {
  const orderNumber = extractOrderNumber(value);
  const match = value.toUpperCase().match(/\b[A-Z]{2,8}-[A-Z0-9]{2,}(?:-[A-Z0-9]{1,})+\b/);
  if (!match?.[0]) {
    return null;
  }
  if (orderNumber && match[0] === orderNumber) {
    return null;
  }
  return match[0];
}

function toSearchTerm(message: string) {
  const tokens = normalizeToken(message)
    .split(/[^a-z0-9]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 2 && !stopWords.has(entry));
  return tokens.slice(0, 7).join(" ");
}

function extractIngredientHint(message: string) {
  const normalized = normalizeToken(message);
  if (normalized.includes(",")) {
    const entries = normalized
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 2);
    if (entries.length > 0) {
      return entries.slice(0, 6).join(",");
    }
  }

  const withMatch = normalized.match(/\bwith\s+([a-z0-9,\s-]{3,})/);
  if (!withMatch?.[1]) {
    return "";
  }
  const entries = withMatch[1]
    .split(/,| and /)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 2);
  return entries.slice(0, 6).join(",");
}

function resolveIntent(message: string): IntentResolution {
  const normalized = normalizeToken(message);
  if (!normalized) {
    return { intent: "unknown", confidence: 0.2 };
  }

  const greetingKeywords = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"];
  const b2bKeywords = ["distributor", "wholesale", "bulk", "retailer", "b2b", "quote", "reseller"];
  const orderKeywords = ["order", "tracking", "track", "delivery", "shipment", "payment status"];
  const traceabilityKeywords = ["trace", "traceability", "batch", "qr", "lot"];
  const allergenKeywords = [
    "allergen",
    "allergy",
    "gluten",
    "dairy",
    "milk",
    "soy",
    "nut",
    "peanut",
    "egg",
    "sesame",
  ];
  const recipeKeywords = ["recipe", "cook", "meal", "ingredient", "prep"];
  const productKeywords = [
    "bread",
    "beverage",
    "drink",
    "product",
    "shop",
    "buy",
    "price",
    "catalog",
    "subscription",
  ];

  if (extractOrderNumber(message) || includesAny(normalized, orderKeywords)) {
    return { intent: "order_status", confidence: 0.88 };
  }
  if (extractBatchCode(message) || includesAny(normalized, traceabilityKeywords)) {
    return { intent: "traceability_lookup", confidence: 0.9 };
  }
  if (includesAny(normalized, b2bKeywords)) {
    return { intent: "b2b_quote", confidence: 0.9 };
  }
  if (includesAny(normalized, allergenKeywords)) {
    return { intent: "allergen_help", confidence: 0.86 };
  }
  if (includesAny(normalized, recipeKeywords)) {
    return { intent: "recipe_help", confidence: 0.83 };
  }
  if (includesAny(normalized, greetingKeywords) && normalized.split(" ").length <= 7) {
    return { intent: "greeting", confidence: 0.94 };
  }
  if (includesAny(normalized, productKeywords)) {
    return { intent: "product_search", confidence: 0.78 };
  }

  return { intent: "unknown", confidence: 0.44 };
}

function resolveConversation(
  data: ChatData,
  input: { conversationId?: string; sessionId?: string },
): ChatConversation {
  const requestedId = input.conversationId?.trim();
  if (requestedId) {
    const existing = data.conversations.find((entry) => entry.id === requestedId);
    if (existing) {
      return existing;
    }
  }

  const now = new Date().toISOString();
  const sessionId = input.sessionId?.trim() || buildSessionId();
  const conversation: ChatConversation = {
    id: buildConversationId(),
    sessionId,
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

function trimConversationMessages(data: ChatData, conversationId: string, maxMessages = 120) {
  const scopedMessages = data.messages.filter((entry) => entry.conversationId === conversationId);
  if (scopedMessages.length <= maxMessages) {
    return;
  }

  const keepMessageIds = new Set(scopedMessages.slice(-maxMessages).map((entry) => entry.id));
  data.messages = data.messages.filter(
    (entry) => entry.conversationId !== conversationId || keepMessageIds.has(entry.id),
  );
}

function normalizeSuggestedLinks(input: ChatSuggestedLink[]) {
  const seen = new Set<string>();
  return input
    .filter((entry) => entry.label.trim() && entry.href.trim())
    .filter((entry) => {
      const key = `${entry.label.trim().toLowerCase()}::${entry.href.trim()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 6);
}

function normalizeQuickActions(input: ChatQuickAction[]) {
  const seen = new Set<string>();
  return input
    .filter((entry) => entry.label.trim() && entry.prompt.trim())
    .filter((entry) => {
      const key = entry.prompt.trim().toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 5);
}

async function buildGreetingReply(): Promise<ChatReply> {
  return {
    intent: "greeting",
    confidence: 0.96,
    answer:
      "Hi — I can help with product discovery, allergens, recipes, order tracking, traceability, and distributor support.",
    quickActions: defaultQuickActions,
    suggestedLinks: defaultSuggestedLinks,
    handoffSuggested: false,
  };
}

async function buildProductSearchReply(message: string): Promise<ChatReply> {
  const searchTerm = toSearchTerm(message);
  const [products, recipes] = await Promise.all([
    listCommerceProducts({ search: searchTerm || undefined }),
    searchRecipes({ search: searchTerm || undefined }),
  ]);

  const topProducts = products.slice(0, 3);
  const topRecipes = recipes.slice(0, 2);
  if (topProducts.length === 0 && topRecipes.length === 0) {
    return {
      intent: "product_search",
      confidence: 0.58,
      answer:
        "I couldn't find a close match yet. Try keywords like bread type, flavor, or category, and I’ll narrow it down.",
      quickActions: defaultQuickActions,
      suggestedLinks: [{ label: "Open Shop", href: "/shop" }],
      handoffSuggested: false,
    };
  }

  const productLines = topProducts.map((product) => {
    const cheapestVariant = [...product.variants].sort(
      (left, right) => left.priceMinor - right.priceMinor,
    )[0];
    const priceLabel = cheapestVariant
      ? formatCurrency(cheapestVariant.currency, cheapestVariant.priceMinor)
      : "Price on request";
    return `• ${product.name} (${product.category}) — from ${priceLabel}`;
  });

  const recipeLines = topRecipes.map(
    (recipe) => `• ${recipe.title} (${recipe.prepMinutes + recipe.cookMinutes} mins)`,
  );

  const answerParts = [
    `I found ${products.length} product match${products.length === 1 ? "" : "es"}.`,
    productLines.join("\n"),
  ];
  if (recipeLines.length > 0) {
    answerParts.push(`Related recipe ideas:\n${recipeLines.join("\n")}`);
  }

  const suggestedLinks = normalizeSuggestedLinks([
    {
      label: "Shop Results",
      href: searchTerm ? `/shop?search=${encodeURIComponent(searchTerm)}` : "/shop",
    },
    ...topProducts.map((product) => ({ label: product.name, href: `/products/${product.slug}` })),
    { label: "Recipes", href: "/recipes" },
  ]);

  return {
    intent: "product_search",
    confidence: products.length > 0 ? 0.84 : 0.68,
    answer: answerParts.filter(Boolean).join("\n\n"),
    quickActions: normalizeQuickActions([
      { label: "Show subscriptions", prompt: "Which products support subscriptions?" },
      { label: "Filter by allergens", prompt: "Help me filter products by allergens." },
      { label: "See recipes", prompt: "Show recipe ideas for these products." },
      ...defaultQuickActions.slice(0, 2),
    ]),
    suggestedLinks,
    handoffSuggested: false,
  };
}

async function buildRecipeReply(message: string): Promise<ChatReply> {
  const searchTerm = toSearchTerm(message);
  const ingredientsHint = extractIngredientHint(message);
  const recipes = await searchRecipes({
    search: searchTerm || undefined,
    ingredients: ingredientsHint || undefined,
  });
  const topRecipes = recipes.slice(0, 3);

  if (topRecipes.length === 0) {
    return {
      intent: "recipe_help",
      confidence: 0.6,
      answer:
        "I couldn't find a recipe match yet. Share ingredients you have (comma separated), and I’ll suggest the best options.",
      quickActions: normalizeQuickActions([
        { label: "Quick recipes", prompt: "Show quick recipes under 30 minutes." },
        { label: "Ingredient recipes", prompt: "Find recipes with tomatoes, onions, and peppers." },
        ...defaultQuickActions.slice(0, 2),
      ]),
      suggestedLinks: [{ label: "Recipe Finder", href: "/recipes" }],
      handoffSuggested: false,
    };
  }

  const recipeLines = topRecipes.map(
    (recipe) =>
      `• ${recipe.title} — ${recipe.prepMinutes + recipe.cookMinutes} mins · serves ${recipe.servings}`,
  );

  return {
    intent: "recipe_help",
    confidence: 0.86,
    answer: `Here are top recipe matches:\n${recipeLines.join("\n")}`,
    quickActions: normalizeQuickActions([
      { label: "Ingredient search", prompt: "Find recipes with rice, tomato, and pepper." },
      { label: "Nutrition check", prompt: "Show me recipes with higher protein." },
      ...defaultQuickActions.slice(0, 2),
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      { label: "Open Recipes", href: "/recipes" },
      ...topRecipes.map((recipe) => ({ label: recipe.title, href: `/recipes#${recipe.slug}` })),
    ]),
    handoffSuggested: false,
  };
}

function resolveAllergen(message: string, knownAllergens: string[]) {
  const normalized = normalizeToken(message);
  const allergenAliases = [
    "gluten",
    "wheat",
    "dairy",
    "milk",
    "soy",
    "nut",
    "nuts",
    "peanut",
    "egg",
    "sesame",
  ];

  for (const alias of allergenAliases) {
    if (!normalized.includes(alias)) {
      continue;
    }
    const match = knownAllergens.find((entry) => normalizeToken(entry).includes(alias));
    return match ?? alias;
  }

  const direct = knownAllergens.find((entry) => normalized.includes(normalizeToken(entry)));
  return direct ?? null;
}

function tokenizeAllergen(allergen: string) {
  return normalizeToken(allergen)
    .split(/[^a-z0-9]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 2);
}

async function buildAllergenReply(message: string): Promise<ChatReply> {
  const [facets, products] = await Promise.all([listCommerceFacets(), listCommerceProducts()]);
  const allergen = resolveAllergen(message, facets.allergens);

  if (!allergen) {
    return {
      intent: "allergen_help",
      confidence: 0.62,
      answer:
        "Tell me the exact allergen to exclude (for example: gluten, soy, dairy, nuts, or egg), and I’ll filter suitable products.",
      quickActions: normalizeQuickActions([
        { label: "Gluten-safe options", prompt: "Show products that avoid gluten." },
        { label: "Soy-safe options", prompt: "Show products that avoid soy." },
        { label: "Dairy-safe options", prompt: "Show products that avoid dairy." },
      ]),
      suggestedLinks: [{ label: "Open Shop Filters", href: "/shop" }],
      handoffSuggested: false,
    };
  }

  const allergenTokens = tokenizeAllergen(allergen);
  const safeProducts = products.filter((product) =>
    product.allergens.every((entry) => {
      const entryToken = normalizeToken(entry);
      return allergenTokens.every((token) => !entryToken.includes(token));
    }),
  );

  if (safeProducts.length === 0) {
    return {
      intent: "allergen_help",
      confidence: 0.72,
      answer: `I did not find safe matches for "${allergen}" right now. A specialist can confirm alternatives and handling details.`,
      quickActions: normalizeQuickActions([
        { label: "Try another allergen", prompt: "Help me filter by another allergen." },
        { label: "Talk to support", prompt: "I need human support for allergen guidance." },
        ...defaultQuickActions.slice(0, 1),
      ]),
      suggestedLinks: normalizeSuggestedLinks([
        { label: "Shop Filter", href: `/shop?allergenExclude=${encodeURIComponent(allergen)}` },
        { label: "Contact Team", href: "/contact" },
      ]),
      handoffSuggested: true,
      handoffReason: "No safe products found for selected allergen.",
    };
  }

  const topSafe = safeProducts.slice(0, 3);
  const safeLines = topSafe.map((product) => `• ${product.name} (${product.category})`);

  return {
    intent: "allergen_help",
    confidence: 0.83,
    answer: `Top options excluding "${allergen}":\n${safeLines.join("\n")}\n\nAlways verify allergen details on each product page before purchase.`,
    quickActions: normalizeQuickActions([
      { label: "Filter in shop", prompt: `Show products excluding ${allergen}.` },
      { label: "Check ingredients", prompt: "Compare ingredient details for these products." },
      ...defaultQuickActions.slice(0, 1),
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      { label: "Filtered Shop", href: `/shop?allergenExclude=${encodeURIComponent(allergen)}` },
      ...topSafe.map((product) => ({ label: product.name, href: `/products/${product.slug}` })),
    ]),
    handoffSuggested: false,
  };
}

async function buildOrderStatusReply(message: string): Promise<ChatReply> {
  const email = extractEmail(message);
  const orderNumber = extractOrderNumber(message);

  if (!email || !orderNumber) {
    return {
      intent: "order_status",
      confidence: 0.64,
      answer:
        "To check order status, share both your order number (for example NFL-2026-0001) and the checkout email used.",
      quickActions: normalizeQuickActions([
        { label: "How to track", prompt: "How can I track my order?" },
        { label: "Open account", prompt: "Take me to my account dashboard." },
        ...defaultQuickActions.slice(0, 1),
      ]),
      suggestedLinks: normalizeSuggestedLinks([
        { label: "Account Dashboard", href: "/account" },
        { label: "Contact Support", href: "/contact" },
      ]),
      handoffSuggested: false,
    };
  }

  const orders = await listOrdersByEmail(email);
  const order = orders.find(
    (entry) => normalizeToken(entry.orderNumber) === normalizeToken(orderNumber),
  );

  if (!order) {
    return {
      intent: "order_status",
      confidence: 0.7,
      answer:
        "I couldn't verify that order with the details provided. Please double-check the order number/email, or request human support.",
      quickActions: normalizeQuickActions([
        { label: "Retry order lookup", prompt: "Help me retry order tracking." },
        { label: "Human support", prompt: "I need help with my order tracking." },
      ]),
      suggestedLinks: normalizeSuggestedLinks([
        { label: "Account Dashboard", href: "/account" },
        { label: "Contact Support", href: "/contact" },
      ]),
      handoffSuggested: true,
      handoffReason: "Order lookup failed with provided order number/email.",
    };
  }

  const latestEvent = order.timeline[0] ?? order.timeline[order.timeline.length - 1];
  const latestNote = latestEvent?.note || "No additional timeline note yet.";

  return {
    intent: "order_status",
    confidence: 0.91,
    answer: `Order ${order.orderNumber} is currently "${formatOrderStatus(order.status)}". Last update: ${latestNote}`,
    quickActions: normalizeQuickActions([
      { label: "View account orders", prompt: "Show me where to view all my orders." },
      { label: "Delivery updates", prompt: "How do I get delivery updates for this order?" },
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      { label: "Account Dashboard", href: "/account" },
      { label: "Checkout", href: "/checkout" },
    ]),
    handoffSuggested: false,
  };
}

async function buildTraceabilityReply(message: string): Promise<ChatReply> {
  const normalized = sanitizeMessage(message).toUpperCase();
  const extractedCode = extractBatchCode(message);
  const lookupCode = extractedCode ?? normalized;

  if (!lookupCode || lookupCode.length < 4) {
    return {
      intent: "traceability_lookup",
      confidence: 0.6,
      answer:
        "Share the batch code or QR value, and I’ll look up sourcing, processing, and certification details.",
      quickActions: normalizeQuickActions([
        { label: "Trace by batch code", prompt: "Lookup traceability for this batch code." },
        { label: "Open traceability page", prompt: "Open the traceability lookup page." },
      ]),
      suggestedLinks: [{ label: "Traceability Lookup", href: "/traceability" }],
      handoffSuggested: false,
    };
  }

  const batch = await lookupTraceabilityBatch(lookupCode);
  if (!batch) {
    return {
      intent: "traceability_lookup",
      confidence: 0.69,
      answer:
        "No traceability batch was found for that code yet. Check the code format or request support for manual verification.",
      quickActions: normalizeQuickActions([
        { label: "Retry lookup", prompt: "Help me retry batch traceability lookup." },
        { label: "Human support", prompt: "I need human help verifying a batch code." },
      ]),
      suggestedLinks: normalizeSuggestedLinks([
        { label: "Traceability Lookup", href: "/traceability" },
        { label: "Contact Team", href: "/contact" },
      ]),
      handoffSuggested: true,
      handoffReason: "Batch code was not found in traceability records.",
    };
  }

  const latestTimeline = batch.timeline[batch.timeline.length - 1];
  const stage = latestTimeline?.stage ? formatLabel(latestTimeline.stage) : "processing";

  return {
    intent: "traceability_lookup",
    confidence: 0.95,
    answer: `Batch ${batch.batchCode} (${batch.productName}) is "${batch.status}". Source: ${batch.source.farmName}, ${batch.source.region}. Latest stage: ${stage}.`,
    quickActions: normalizeQuickActions([
      { label: "Open batch timeline", prompt: `Show full timeline for ${batch.batchCode}.` },
      { label: "Certification info", prompt: "Show certification details for this batch." },
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      {
        label: "Open Traceability",
        href: `/traceability?code=${encodeURIComponent(batch.batchCode)}`,
      },
      { label: "Shop Product", href: `/shop?search=${encodeURIComponent(batch.productName)}` },
    ]),
    handoffSuggested: false,
  };
}

async function buildB2BReply(): Promise<ChatReply> {
  return {
    intent: "b2b_quote",
    confidence: 0.93,
    answer:
      "For distributor/B2B onboarding, use the portal to submit company details and quote requirements. You can request bulk pricing, convert quotes to orders, and download invoices.",
    quickActions: normalizeQuickActions([
      { label: "Open B2B portal", prompt: "Take me to the distributor portal." },
      { label: "Quote requirements", prompt: "What details are needed for a bulk quote?" },
      { label: "Track B2B order", prompt: "How do I track my B2B order?" },
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      { label: "Distributor Portal", href: "/b2b" },
      { label: "Contact Sales", href: "/contact" },
    ]),
    handoffSuggested: false,
  };
}

async function buildUnknownReply(): Promise<ChatReply> {
  return {
    intent: "unknown",
    confidence: 0.45,
    answer:
      "I’m not fully confident on that request yet. I can connect you to human support while we keep improving responses.",
    quickActions: normalizeQuickActions([
      { label: "Product help", prompt: "Help me find the right products." },
      { label: "Order support", prompt: "I need help with an order issue." },
      { label: "B2B help", prompt: "I need distributor support." },
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      { label: "Contact Team", href: "/contact" },
      { label: "Shop", href: "/shop" },
    ]),
    handoffSuggested: true,
    handoffReason: "Low answer confidence for current request.",
  };
}

async function buildReply(input: { message: string; intent: ChatIntent; confidence: number }) {
  const normalizedIntent = intentSet.has(input.intent) ? input.intent : "unknown";
  switch (normalizedIntent) {
    case "greeting":
      return buildGreetingReply();
    case "product_search":
      return buildProductSearchReply(input.message);
    case "recipe_help":
      return buildRecipeReply(input.message);
    case "allergen_help":
      return buildAllergenReply(input.message);
    case "order_status":
      return buildOrderStatusReply(input.message);
    case "traceability_lookup":
      return buildTraceabilityReply(input.message);
    case "b2b_quote":
      return buildB2BReply();
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

  const intentResolution = resolveIntent(message);
  const reply = await buildReply({
    message,
    intent: intentResolution.intent,
    confidence: intentResolution.confidence,
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
