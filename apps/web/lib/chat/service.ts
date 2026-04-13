import { unstable_noStore as noStore } from "next/cache";

import { readB2BData } from "@/lib/b2b/store";
import { listCommerceFacets, listCommerceProducts } from "@/lib/commerce/service";
import { type CommerceProduct } from "@/lib/commerce/types";
import { searchRecipes } from "@/lib/recipes/service";
import { type RecipeSearchResult } from "@/lib/recipes/types";
import { lookupTraceabilityBatch } from "@/lib/traceability/service";
import { type TraceabilityBatch } from "@/lib/traceability/types";

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
  previousConfidence: number;
  email?: string;
  orderNumber?: string;
  batchCode?: string;
  previousProductMessage?: string;
  previousRecipeMessage?: string;
};

type ProductSearchOptions = {
  searchTerm?: string;
  category?: string;
  tag?: string;
  region?: string;
  inStockOnly: boolean;
};

type RecipeSearchOptions = {
  searchTerm?: string;
  ingredientsHint?: string;
  maxMinutes?: number;
  minProteinG?: number;
  maxCalories?: number;
};

type TraceabilityReplyTopic =
  | "summary"
  | "timeline"
  | "certifications"
  | "source"
  | "processing"
  | "dates";
type B2BReplyTopic =
  | "overview"
  | "quote"
  | "approval"
  | "pricing"
  | "invoice"
  | "statement"
  | "support";

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
  { label: "Compare breads", prompt: "Compare your bread options for me." },
  { label: "Trace a batch", prompt: "Help me verify a batch code." },
  { label: "Recipe help", prompt: "Suggest bread ideas based on ingredients I have." },
  { label: "Distributor support", prompt: "I need distributor quote support." },
];

const defaultSuggestedLinks: ChatSuggestedLink[] = [
  { label: "Products", href: "/shop" },
  { label: "Traceability", href: "/traceability" },
  { label: "Contact Team", href: "/contact" },
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
  "find",
  "give",
  "products",
  "product",
  "options",
  "option",
  "catalog",
  "details",
  "detail",
  "full",
  "more",
  "stock",
  "available",
  "status",
  "timeline",
  "update",
  "updates",
  "info",
  "information",
]);

const greetingKeywords = ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"];
const b2bKeywords = [
  "distributor",
  "wholesale",
  "bulk",
  "retailer",
  "b2b",
  "quote",
  "reseller",
  "invoice",
  "statement",
  "account manager",
  "partner portal",
];
const orderKeywords = ["order", "tracking", "track", "delivery", "shipment", "payment status"];
const traceabilityKeywords = ["trace", "traceability", "batch", "qr", "lot", "certification"];
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
const recipeKeywords = ["recipe", "cook", "meal", "ingredient", "prep", "protein", "calorie"];
const productKeywords = [
  "bread",
  "beverage",
  "drink",
  "product",
  "shop",
  "catalog",
  "in stock",
  "available in",
];
const orderFollowUpKeywords = [
  "delivery",
  "shipment",
  "shipping",
  "payment",
  "paid",
  "reference",
  "items",
  "address",
  "where is it",
  "timeline",
];
const traceabilityFollowUpKeywords = [
  "timeline",
  "history",
  "source",
  "farm",
  "processing",
  "facility",
  "certification",
  "certificate",
  "expiry",
  "production date",
];
const productFollowUpKeywords = [
  "in stock",
  "available",
  "region",
  "compare",
  "filter",
];
const recipeFollowUpKeywords = [
  "quick",
  "under",
  "minutes",
  "ingredient",
  "protein",
  "calorie",
];
const b2bFollowUpKeywords = [
  "quote",
  "approval",
  "invoice",
  "statement",
  "support",
  "ticket",
  "pricing",
  "portal",
];
const followUpKeywords = [
  "this",
  "that",
  "it",
  "those",
  "these",
  "same",
  "more",
  "details",
  "full",
];

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

function tokenizeSearchValue(value: string) {
  return normalizeToken(value)
    .split(/[^a-z0-9]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 2 && !stopWords.has(entry));
}

function toSearchTerm(message: string) {
  return tokenizeSearchValue(message).slice(0, 7).join(" ");
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

function findMatchingFacet(message: string, values: string[]) {
  const normalized = normalizeToken(message);
  return values.find((entry) => normalized.includes(normalizeToken(entry))) ?? null;
}

function hasShortFollowUpShape(message: string) {
  const tokens = tokenizeSearchValue(message);
  return tokens.length <= 4 || includesAny(normalizeToken(message), followUpKeywords);
}

function formatDate(value?: string) {
  if (!value) {
    return "Not available";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

function formatDateTime(value?: string) {
  if (!value) {
    return "Not available";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function summarizeStockStatus(product: CommerceProduct) {
  if (product.variants.every((variant) => variant.stockStatus === "out_of_stock")) {
    return "out of stock";
  }
  if (product.variants.some((variant) => variant.stockStatus === "low_stock")) {
    return "limited stock";
  }
  return "in stock";
}

function scoreTextMatch(text: string, tokens: string[]) {
  const normalized = normalizeToken(text);
  return tokens.reduce((score, token) => score + (normalized.includes(token) ? 1 : 0), 0);
}

function findLatestConversationValue(
  messages: ChatMessage[],
  extractor: (value: string) => string | null | undefined,
) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const value = extractor(messages[index]?.content ?? "");
    if (value) {
      return value;
    }
  }
  return undefined;
}

function findLatestIntentMessage(messages: ChatMessage[], intent: ChatIntent) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === "user" && message.intent === intent) {
      return message.content;
    }
  }
  return undefined;
}

function getConversationMessages(data: ChatData, conversationId: string) {
  return data.messages
    .filter((entry) => entry.conversationId === conversationId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

function buildConversationContext(
  data: ChatData,
  conversation: ChatConversation,
): ConversationContext {
  const recentMessages = getConversationMessages(data, conversation.id).slice(-18);
  const recentUserMessages = recentMessages.filter((entry) => entry.role === "user");

  return {
    conversation,
    recentMessages,
    previousIntent: conversation.lastIntent,
    previousConfidence: conversation.lastConfidence,
    email: findLatestConversationValue(recentUserMessages, extractEmail),
    orderNumber: findLatestConversationValue(recentUserMessages, extractOrderNumber),
    batchCode: findLatestConversationValue(recentUserMessages, extractBatchCode),
    previousProductMessage: findLatestIntentMessage(recentMessages, "product_search"),
    previousRecipeMessage: findLatestIntentMessage(recentMessages, "recipe_help"),
  };
}

function resolveFollowUpIntent(
  message: string,
  context?: ConversationContext,
): IntentResolution | null {
  if (!context || context.previousIntent === "unknown") {
    return null;
  }

  const normalized = normalizeToken(message);
  const followUpMessage = hasShortFollowUpShape(message);

  if (
    context.previousIntent === "order_status" &&
    (includesAny(normalized, orderFollowUpKeywords) ||
      (followUpMessage && Boolean(context.orderNumber || context.email)))
  ) {
    return { intent: "order_status", confidence: 0.78 };
  }

  if (
    context.previousIntent === "traceability_lookup" &&
    (includesAny(normalized, traceabilityFollowUpKeywords) ||
      (followUpMessage && Boolean(context.batchCode)))
  ) {
    return { intent: "traceability_lookup", confidence: 0.8 };
  }

  if (
    context.previousIntent === "product_search" &&
    (includesAny(normalized, productFollowUpKeywords) || followUpMessage)
  ) {
    return { intent: "product_search", confidence: 0.72 };
  }

  if (
    context.previousIntent === "recipe_help" &&
    (includesAny(normalized, recipeFollowUpKeywords) || followUpMessage)
  ) {
    return { intent: "recipe_help", confidence: 0.72 };
  }

  if (
    context.previousIntent === "b2b_quote" &&
    (includesAny(normalized, b2bFollowUpKeywords) || followUpMessage)
  ) {
    return { intent: "b2b_quote", confidence: 0.74 };
  }

  return null;
}

function resolveIntent(message: string, context?: ConversationContext): IntentResolution {
  const normalized = normalizeToken(message);
  if (!normalized) {
    return { intent: "unknown", confidence: 0.2 };
  }

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

  const followUpIntent = resolveFollowUpIntent(message, context);
  if (followUpIntent) {
    return followUpIntent;
  }

  if (includesAny(normalized, greetingKeywords) && normalized.split(" ").length <= 7) {
    return { intent: "greeting", confidence: 0.94 };
  }
  if (includesAny(normalized, productKeywords)) {
    return { intent: "product_search", confidence: 0.78 };
  }

  if (context?.previousIntent && context.previousIntent !== "unknown" && hasShortFollowUpShape(message)) {
    return {
      intent: context.previousIntent,
      confidence: Math.max(0.58, Math.min(0.76, context.previousConfidence || 0.58)),
    };
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
      "Hi. I can compare products, filter allergens, suggest recipes, verify traceability, and guide distributor support.",
    quickActions: defaultQuickActions,
    suggestedLinks: defaultSuggestedLinks,
    handoffSuggested: false,
  };
}

function parseProductSearchOptions(
  message: string,
  context: ConversationContext,
  facets: Awaited<ReturnType<typeof listCommerceFacets>>,
): ProductSearchOptions {
  const normalized = normalizeToken(message);
  const followUpSearchTerm =
    !includesAny(normalized, productFollowUpKeywords) && tokenizeSearchValue(message).length > 0
      ? toSearchTerm(message)
      : undefined;

  return {
    searchTerm: followUpSearchTerm || context.previousProductMessage
      ? followUpSearchTerm || toSearchTerm(context.previousProductMessage ?? "")
      : undefined,
    category: findMatchingFacet(message, facets.categories) ?? undefined,
    tag: findMatchingFacet(message, facets.tags) ?? undefined,
    region: findMatchingFacet(message, facets.regions) ?? undefined,
    inStockOnly: includesAny(normalized, ["in stock", "available now", "ready stock"]),
  };
}

function filterAndRankProducts(products: CommerceProduct[], options: ProductSearchOptions) {
  let rankedProducts = [...products];

  const tokens = options.searchTerm ? tokenizeSearchValue(options.searchTerm) : [];
  if (tokens.length > 0) {
    rankedProducts = rankedProducts
      .map((product) => ({
        product,
        score: scoreTextMatch(
          [
            product.name,
            product.category,
            product.shortDescription,
            product.longDescription,
            product.tags.join(" "),
            product.availableRegions.join(" "),
          ].join(" "),
          tokens,
        ),
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => {
        if (left.score !== right.score) {
          return right.score - left.score;
        }
        return left.product.name.localeCompare(right.product.name);
      })
      .map((entry) => entry.product);
  }

  return rankedProducts;
}

async function buildProductSearchReply(
  message: string,
  context: ConversationContext,
): Promise<ChatReply> {
  const facets = await listCommerceFacets();
  const options = parseProductSearchOptions(message, context, facets);
  const products = await listCommerceProducts({
    category: options.category,
    tag: options.tag,
    region: options.region,
    inStockOnly: options.inStockOnly,
  });
  const rankedProducts = filterAndRankProducts(products, options);
  const topProducts = rankedProducts.slice(0, 3);

  if (topProducts.length === 0) {
    return {
      intent: "product_search",
      confidence: 0.58,
      answer:
        "I could not find a strong product match yet. Try a bread type, region, category, or ask for currently available options.",
      quickActions: normalizeQuickActions([
        { label: "In-stock only", prompt: "Show in-stock bread options." },
        { label: "By region", prompt: "Show products available in Lagos." },
        { label: "Allergen filter", prompt: "Help me filter bread options by allergens." },
        { label: "Traceability", prompt: "Help me verify a batch code." },
      ]),
      suggestedLinks: [{ label: "Open Products", href: "/shop" }],
      handoffSuggested: false,
    };
  }

  const activeFilters = [
    options.category,
    options.tag,
    options.region,
    options.inStockOnly ? "in stock only" : "",
  ].filter(Boolean);

  const productLines = topProducts.map((product) => {
    const regionLabel = product.availableRegions.slice(0, 2).join(", ");
    return `• ${product.name} — ${product.category} · ${summarizeStockStatus(product)} · MOQ ${product.minimumOrderQuantity}+ · ${product.variants.length} format${product.variants.length === 1 ? "" : "s"} · ${regionLabel}`;
  });

  const answerLines = [
    `I found ${rankedProducts.length} product match${rankedProducts.length === 1 ? "" : "es"}${activeFilters.length > 0 ? ` for ${activeFilters.join(", ")}` : ""}.`,
    productLines.join("\n"),
  ];

  return {
    intent: "product_search",
    confidence: rankedProducts.length > 0 ? 0.86 : 0.68,
    answer: answerLines.join("\n\n"),
    quickActions: normalizeQuickActions([
      { label: "In-stock only", prompt: "Filter these to in-stock products only." },
      { label: "By region", prompt: "Filter these by region." },
      { label: "Allergen filter", prompt: "Help me filter these by allergens." },
      { label: "Recipe ideas", prompt: "Show recipe ideas for these products." },
      { label: "Make enquiry", prompt: "Help me contact Nest Foods about these products." },
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      {
        label: "Products",
        href: options.searchTerm ? `/shop?search=${encodeURIComponent(options.searchTerm)}` : "/shop",
      },
      ...topProducts.map((product) => ({ label: product.name, href: `/products/${product.slug}` })),
    ]),
    handoffSuggested: false,
  };
}

function extractMaxMinutes(message: string) {
  const normalized = normalizeToken(message);
  const match = normalized.match(/\b(?:under|within|less than)\s+(\d{1,3})\s*(?:min|mins|minutes)\b/);
  if (match?.[1]) {
    return Number(match[1]);
  }
  const compactMatch = normalized.match(/\b(\d{1,3})\s*(?:min|mins|minutes)\b/);
  if (compactMatch?.[1] && includesAny(normalized, ["under", "quick", "fast"])) {
    return Number(compactMatch[1]);
  }
  return undefined;
}

function extractMaxCalories(message: string) {
  const normalized = normalizeToken(message);
  const match = normalized.match(/\b(?:under|below|less than)\s+(\d{2,4})\s*cal/);
  if (match?.[1]) {
    return Number(match[1]);
  }
  if (includesAny(normalized, ["lower calorie", "low calorie", "lighter"])) {
    return 450;
  }
  return undefined;
}

function parseRecipeSearchOptions(message: string, context: ConversationContext): RecipeSearchOptions {
  const normalized = normalizeToken(message);
  const searchTerm = toSearchTerm(message) || toSearchTerm(context.previousRecipeMessage ?? "");
  const ingredientsHint = extractIngredientHint(message);

  return {
    searchTerm: searchTerm || undefined,
    ingredientsHint: ingredientsHint || undefined,
    maxMinutes: extractMaxMinutes(message),
    minProteinG: includesAny(normalized, ["high protein", "more protein", "protein"]) ? 15 : undefined,
    maxCalories: extractMaxCalories(message),
  };
}

function filterAndRankRecipes(recipes: RecipeSearchResult[], options: RecipeSearchOptions) {
  let rankedRecipes = [...recipes];

  if (options.searchTerm) {
    const tokens = tokenizeSearchValue(options.searchTerm);
    if (tokens.length > 0) {
      rankedRecipes = rankedRecipes
        .map((recipe) => ({
          recipe,
          score:
            recipe.matchScore +
            scoreTextMatch(
              [
                recipe.title,
                recipe.description,
                recipe.tags.join(" "),
                recipe.ingredients.join(" "),
              ].join(" "),
              tokens,
            ),
        }))
        .filter((entry) => entry.score > 0)
        .sort((left, right) => right.score - left.score)
        .map((entry) => entry.recipe);
    }
  }

  if (options.maxMinutes !== undefined) {
    rankedRecipes = rankedRecipes.filter(
      (recipe) => recipe.prepMinutes + recipe.cookMinutes <= options.maxMinutes!,
    );
  }
  if (options.minProteinG !== undefined) {
    rankedRecipes = rankedRecipes.filter(
      (recipe) => recipe.nutritionPerServing.proteinG >= options.minProteinG!,
    );
  }
  if (options.maxCalories !== undefined) {
    rankedRecipes = rankedRecipes.filter(
      (recipe) => recipe.nutritionPerServing.calories <= options.maxCalories!,
    );
  }

  return rankedRecipes;
}

async function buildRecipeReply(message: string, context: ConversationContext): Promise<ChatReply> {
  const options = parseRecipeSearchOptions(message, context);
  const recipes = await searchRecipes({
    ingredients: options.ingredientsHint,
  });
  const topRecipes = filterAndRankRecipes(recipes, options).slice(0, 3);

  if (topRecipes.length === 0) {
    return {
      intent: "recipe_help",
      confidence: 0.6,
      answer:
        "I could not find a recipe match for that combination yet. Try ingredient names, a time target like under 20 minutes, or ask for higher-protein options.",
      quickActions: normalizeQuickActions([
        { label: "Quick recipes", prompt: "Show quick recipes under 20 minutes." },
        { label: "High protein", prompt: "Show higher-protein recipe ideas." },
        { label: "By ingredients", prompt: "Find recipes with tomatoes, onions, and peppers." },
        ...defaultQuickActions.slice(0, 2),
      ]),
      suggestedLinks: [{ label: "Recipe Finder", href: "/recipes" }],
      handoffSuggested: false,
    };
  }

  const recipeLines = topRecipes.map((recipe) => {
    const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;
    return `• ${recipe.title} — ${totalMinutes} mins · ${recipe.nutritionPerServing.proteinG}g protein · ${recipe.nutritionPerServing.calories} cal`;
  });

  return {
    intent: "recipe_help",
    confidence: 0.87,
    answer: `Here are the strongest recipe matches:\n${recipeLines.join("\n")}`,
    quickActions: normalizeQuickActions([
      { label: "Under 20 mins", prompt: "Show recipes under 20 minutes." },
      { label: "High protein", prompt: "Show higher-protein recipe ideas." },
      { label: "Lower calorie", prompt: "Show lower-calorie recipe ideas." },
      { label: "By ingredients", prompt: "Find recipes with rice, tomato, and pepper." },
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      { label: "Recipes", href: "/recipes" },
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
        "Tell me the allergen to exclude, such as gluten, soy, dairy, nuts, sesame, or egg, and I will narrow the products.",
      quickActions: normalizeQuickActions([
        { label: "Gluten-safe", prompt: "Show products that avoid gluten." },
        { label: "Soy-safe", prompt: "Show products that avoid soy." },
        { label: "Dairy-safe", prompt: "Show products that avoid dairy." },
      ]),
      suggestedLinks: [{ label: "Products", href: "/shop" }],
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
      answer: `I did not find safe matches for "${allergen}" right now. A specialist should confirm alternatives and handling details.`,
      quickActions: normalizeQuickActions([
        { label: "Try another allergen", prompt: "Help me filter by another allergen." },
        { label: "Human support", prompt: "I need human support for allergen guidance." },
        ...defaultQuickActions.slice(0, 1),
      ]),
      suggestedLinks: normalizeSuggestedLinks([
        { label: "Filtered Products", href: `/shop?allergenExclude=${encodeURIComponent(allergen)}` },
        { label: "Contact Team", href: "/contact" },
      ]),
      handoffSuggested: true,
      handoffReason: "No safe products found for the selected allergen.",
    };
  }

  const topSafe = safeProducts.slice(0, 3);
  const safeLines = topSafe.map((product) => `• ${product.name} (${product.category})`);

  return {
    intent: "allergen_help",
    confidence: 0.83,
    answer: `Top options excluding "${allergen}":\n${safeLines.join("\n")}`,
    quickActions: normalizeQuickActions([
      { label: "Filter in products", prompt: `Show products excluding ${allergen}.` },
      { label: "Compare ingredients", prompt: "Compare ingredient details for these products." },
      ...defaultQuickActions.slice(0, 1),
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      { label: "Filtered Products", href: `/shop?allergenExclude=${encodeURIComponent(allergen)}` },
      ...topSafe.map((product) => ({ label: product.name, href: `/products/${product.slug}` })),
    ]),
    handoffSuggested: false,
  };
}

async function buildOrderStatusReply(
  _message: string,
  _context: ConversationContext,
): Promise<ChatReply> {
  void _message;
  void _context;
  return {
    intent: "order_status",
    confidence: 0.88,
    answer:
      "Nest Foods does not provide public online ordering or self-serve order tracking on this website. For delivery follow-up, distributor coordination, or product support, contact the team directly.",
    quickActions: normalizeQuickActions([
      { label: "Contact team", prompt: "Help me contact the Nest Foods team." },
      { label: "Distributor support", prompt: "I need distributor support." },
      { label: "Products", prompt: "Show me the Nest Foods product range." },
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      { label: "Contact Team", href: "/contact" },
      { label: "Distributor Portal", href: "/b2b" },
      { label: "Products", href: "/shop" },
    ]),
    handoffSuggested: true,
    handoffReason: "Public order tracking is not part of the corporate site.",
  };
}

function resolveTraceabilityReplyTopic(message: string): TraceabilityReplyTopic {
  const normalized = normalizeToken(message);
  if (includesAny(normalized, ["timeline", "history", "stages"])) {
    return "timeline";
  }
  if (includesAny(normalized, ["certification", "certificate", "certified"])) {
    return "certifications";
  }
  if (includesAny(normalized, ["source", "farm", "origin", "lot reference"])) {
    return "source";
  }
  if (includesAny(normalized, ["processing", "facility", "packaged", "qa"])) {
    return "processing";
  }
  if (includesAny(normalized, ["production date", "expiry", "dates", "harvested"])) {
    return "dates";
  }
  return "summary";
}

function buildTraceabilityTimelineLines(batch: TraceabilityBatch) {
  return [...batch.timeline]
    .slice(-4)
    .map(
      (entry) =>
        `• ${formatDateTime(entry.startedAt)} — ${entry.title} (${formatLabel(entry.stage)}) at ${entry.location}`,
    );
}

async function buildTraceabilityReply(
  message: string,
  context: ConversationContext,
): Promise<ChatReply> {
  const lookupCode = extractBatchCode(message) ?? context.batchCode;
  const topic = resolveTraceabilityReplyTopic(message);

  if (!lookupCode || lookupCode.length < 4) {
    return {
      intent: "traceability_lookup",
      confidence: 0.6,
      answer:
        "Share the batch code or QR value and I will look up sourcing, processing, and certification details.",
      quickActions: normalizeQuickActions([
        { label: "Lookup a batch", prompt: "Lookup traceability for this batch code." },
        { label: "Batch timeline", prompt: "Show the full timeline for this batch." },
      ]),
      suggestedLinks: [{ label: "Traceability", href: "/traceability" }],
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
        { label: "Traceability", href: "/traceability" },
        { label: "Contact Team", href: "/contact" },
      ]),
      handoffSuggested: true,
      handoffReason: "Batch code was not found in traceability records.",
    };
  }

  const latestTimeline = batch.timeline[batch.timeline.length - 1];
  const traceabilityReplyByTopic: Record<TraceabilityReplyTopic, string> = {
    summary: `Batch ${batch.batchCode} for ${batch.productName} is "${batch.status}". Source: ${batch.source.farmName}, ${batch.source.region}. Latest stage: ${latestTimeline ? formatLabel(latestTimeline.stage) : "processing"}.`,
    timeline: `Recent batch timeline for ${batch.batchCode}:\n${buildTraceabilityTimelineLines(batch).join("\n")}`,
    certifications:
      batch.certifications.length > 0
        ? `Certifications for ${batch.batchCode}:\n${batch.certifications
            .map(
              (entry) =>
                `• ${entry.name} · ${entry.issuer} · code ${entry.certificateCode}${entry.validUntil ? ` · valid until ${formatDate(entry.validUntil)}` : ""}`,
            )
            .join("\n")}`
        : `No certifications are attached to ${batch.batchCode} yet.`,
    source: `Source for ${batch.batchCode}: ${batch.source.farmName}, ${batch.source.region}, ${batch.source.country}. Lot reference: ${batch.source.lotReference}.${batch.source.harvestedAt ? ` Harvested ${formatDate(batch.source.harvestedAt)}.` : ""}`,
    processing: `Processing details for ${batch.batchCode}: ${batch.processing.facilityName}, line ${batch.processing.lineName}. Packaged ${formatDateTime(batch.processing.packagedAt)}. QA lead: ${batch.processing.qaLead}.`,
    dates: `Dates for ${batch.batchCode}: produced ${formatDate(batch.productionDate)}, packaged ${formatDate(batch.processing.packagedAt)}, expires ${formatDate(batch.expiryDate)}${batch.source.harvestedAt ? `, harvested ${formatDate(batch.source.harvestedAt)}` : ""}.`,
  };

  return {
    intent: "traceability_lookup",
    confidence: 0.95,
    answer: traceabilityReplyByTopic[topic],
    quickActions: normalizeQuickActions([
      { label: "Timeline", prompt: `Show the full timeline for ${batch.batchCode}.` },
      { label: "Source", prompt: `Show source details for ${batch.batchCode}.` },
      { label: "Certifications", prompt: `Show certification details for ${batch.batchCode}.` },
      { label: "Processing", prompt: `Show processing details for ${batch.batchCode}.` },
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      {
        label: "Traceability",
        href: `/traceability?code=${encodeURIComponent(batch.batchCode)}`,
      },
      { label: batch.productName, href: `/shop?search=${encodeURIComponent(batch.productName)}` },
    ]),
    handoffSuggested: false,
  };
}

function resolveB2BReplyTopic(message: string): B2BReplyTopic {
  const normalized = normalizeToken(message);
  if (includesAny(normalized, ["quote", "quotation", "pricing request", "bulk order"])) {
    return "quote";
  }
  if (includesAny(normalized, ["approval", "approved", "application"])) {
    return "approval";
  }
  if (includesAny(normalized, ["pricing", "tier", "discount", "minimum order"])) {
    return "pricing";
  }
  if (includesAny(normalized, ["invoice", "billing", "due"])) {
    return "invoice";
  }
  if (includesAny(normalized, ["statement", "account statement"])) {
    return "statement";
  }
  if (includesAny(normalized, ["support", "ticket", "account manager", "issue"])) {
    return "support";
  }
  return "overview";
}

async function buildB2BReply(message: string): Promise<ChatReply> {
  const topic = resolveB2BReplyTopic(message);
  const b2bData = await readB2BData();
  const tierSummary = b2bData.pricingTiers
    .map((tier) => `• ${tier.label} — review target ${tier.quoteReviewHours}h`)
    .join("\n");

  const answerByTopic: Record<B2BReplyTopic, string> = {
    overview:
      "The distributor portal supports account onboarding, quote requests, quote-to-order conversion, invoice access, statements, and support tickets.",
    quote:
      "For a bulk quote, submit company details, delivery region, product variants, quantities, preferred delivery date, and any handling notes through the distributor portal.",
    approval:
      "Distributor approval starts with company and contact details. Once reviewed, the team assigns your account tier, active regions, and account manager access.",
    pricing: `Pricing is managed through account tiers. Current portal response windows:\n${tierSummary}`,
    invoice:
      "Invoices are handled inside the distributor portal after quote approval and order conversion. Use the portal for invoice downloads, balance checks, and payment follow-up.",
    statement:
      "Account statements are generated by period inside the distributor portal. Use the portal to review billed totals, payments, and outstanding balance.",
    support:
      "Distributor support runs through the portal or the sales team. You can open tickets for quoting, order issues, invoices, and account management follow-up.",
  };

  return {
    intent: "b2b_quote",
    confidence: 0.92,
    answer: answerByTopic[topic],
    quickActions: normalizeQuickActions([
      { label: "Quote requirements", prompt: "What details are needed for a bulk quote?" },
      { label: "Approval flow", prompt: "How does distributor approval work?" },
      { label: "Invoices", prompt: "How do B2B invoices work?" },
      { label: "Portal support", prompt: "I need distributor support." },
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      { label: "Distributor Portal", href: "/b2b" },
      { label: "Contact Sales", href: "/contact" },
    ]),
    handoffSuggested: false,
  };
}

async function buildUnknownReply(context?: ConversationContext): Promise<ChatReply> {
  const contextualAction =
    context?.previousIntent && context.previousIntent !== "unknown"
      ? {
          label: "Continue previous topic",
          prompt: "Continue with the previous topic.",
        }
      : null;

  return {
    intent: "unknown",
    confidence: 0.45,
    answer:
      "I do not have a strong match for that request yet. I can still help with products, allergens, recipes, traceability, and distributor support.",
    quickActions: normalizeQuickActions([
      ...(contextualAction ? [contextualAction] : []),
      { label: "Product help", prompt: "Help me find the right products." },
      { label: "Traceability", prompt: "Help me verify a batch code." },
      { label: "Recipe help", prompt: "Suggest bread ideas based on ingredients I have." },
      { label: "B2B help", prompt: "I need distributor support." },
    ]),
    suggestedLinks: normalizeSuggestedLinks([
      { label: "Contact Team", href: "/contact" },
      { label: "Products", href: "/shop" },
      { label: "Traceability", href: "/traceability" },
    ]),
    handoffSuggested: true,
    handoffReason: "Low answer confidence for the current request.",
  };
}

async function buildReply(input: {
  message: string;
  intent: ChatIntent;
  confidence: number;
  context: ConversationContext;
}) {
  const normalizedIntent = intentSet.has(input.intent) ? input.intent : "unknown";
  switch (normalizedIntent) {
    case "greeting":
      return buildGreetingReply();
    case "product_search":
      return buildProductSearchReply(input.message, input.context);
    case "recipe_help":
      return buildRecipeReply(input.message, input.context);
    case "allergen_help":
      return buildAllergenReply(input.message);
    case "order_status":
      return buildOrderStatusReply(input.message, input.context);
    case "traceability_lookup":
      return buildTraceabilityReply(input.message, input.context);
    case "b2b_quote":
      return buildB2BReply(input.message);
    case "unknown":
    default:
      return buildUnknownReply(input.context);
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
    confidence: intentResolution.confidence,
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
