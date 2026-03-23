import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";

import { CHAT_SEED_DATA } from "./seed";
import {
  type ChatConversation,
  type ChatData,
  type ChatLead,
  type ChatMessage,
  chatIntentValues,
} from "./types";

const relativeDataFilePath = path.join("data", "chat.json");

function resolveDataFilePath() {
  const candidates = [
    path.join(process.cwd(), relativeDataFilePath),
    path.join(process.cwd(), "apps", "web", relativeDataFilePath),
  ];
  const existingPath = candidates.find((candidatePath) => existsSync(candidatePath));
  return existingPath ?? candidates[0];
}

const dataFilePath = resolveDataFilePath();
const storageDriver = process.env.CHAT_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "chat";
const chatIntentSet = new Set(chatIntentValues);

function normalizeConfidence(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.min(1, parsed));
}

function normalizeConversation(
  input: Partial<ChatConversation> | null | undefined,
): ChatConversation | null {
  if (!input?.id?.trim() || !input.sessionId?.trim()) {
    return null;
  }

  const now = new Date().toISOString();
  const status: ChatConversation["status"] =
    input.status === "handoff_requested" || input.status === "resolved" ? input.status : "open";
  const lastIntent =
    input.lastIntent && chatIntentSet.has(input.lastIntent) ? input.lastIntent : "unknown";

  return {
    id: input.id.trim(),
    sessionId: input.sessionId.trim(),
    channel: "web_widget",
    status,
    lastIntent,
    lastConfidence: normalizeConfidence(input.lastConfidence),
    lastMessageAt: input.lastMessageAt?.trim() || now,
    createdAt: input.createdAt?.trim() || now,
    updatedAt: input.updatedAt?.trim() || now,
  };
}

function normalizeMessage(input: Partial<ChatMessage> | null | undefined): ChatMessage | null {
  if (!input?.id?.trim() || !input.conversationId?.trim() || !input.content?.trim()) {
    return null;
  }
  if (input.role !== "user" && input.role !== "assistant") {
    return null;
  }

  const normalizedIntent =
    input.intent && chatIntentSet.has(input.intent) ? input.intent : undefined;
  const normalizedConfidence =
    input.confidence === undefined ? undefined : normalizeConfidence(input.confidence);

  return {
    id: input.id.trim(),
    conversationId: input.conversationId.trim(),
    role: input.role,
    content: input.content.trim(),
    intent: normalizedIntent,
    confidence: normalizedConfidence,
    createdAt: input.createdAt?.trim() || new Date().toISOString(),
  };
}

function normalizeLead(input: Partial<ChatLead> | null | undefined): ChatLead | null {
  if (!input?.id?.trim() || !input.conversationId?.trim()) {
    return null;
  }
  const email = input.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return null;
  }

  const sourceIntent =
    input.sourceIntent && chatIntentSet.has(input.sourceIntent) ? input.sourceIntent : undefined;
  const status: ChatLead["status"] =
    input.status === "contacted" || input.status === "closed" ? input.status : "new";

  return {
    id: input.id.trim(),
    conversationId: input.conversationId.trim(),
    name: input.name?.trim() || undefined,
    email,
    phone: input.phone?.trim() || undefined,
    company: input.company?.trim() || undefined,
    message: input.message?.trim() || "Customer requested support.",
    sourceIntent,
    status,
    createdAt: input.createdAt?.trim() || new Date().toISOString(),
  };
}

function mergeChatData(input: Partial<ChatData> | null | undefined): ChatData {
  if (!input) {
    return structuredClone(CHAT_SEED_DATA);
  }

  const conversations = (input.conversations ?? [])
    .map((entry) => normalizeConversation(entry))
    .filter((entry): entry is ChatConversation => Boolean(entry));

  const conversationIdSet = new Set(conversations.map((entry) => entry.id));
  const messages = (input.messages ?? [])
    .map((entry) => normalizeMessage(entry))
    .filter(
      (entry): entry is ChatMessage =>
        Boolean(entry) && conversationIdSet.has(entry.conversationId),
    );
  const leads = (input.leads ?? [])
    .map((entry) => normalizeLead(entry))
    .filter(
      (entry): entry is ChatLead => Boolean(entry) && conversationIdSet.has(entry.conversationId),
    );

  return {
    conversations,
    messages,
    leads,
  };
}

export async function readChatData(): Promise<ChatData> {
  if (storageDriver === "postgres") {
    const payload = await readPostgresJsonStore<Partial<ChatData>>(
      postgresModuleKey,
      CHAT_SEED_DATA,
    );
    return mergeChatData(payload);
  }

  if (storageDriver !== "json") {
    throw new Error("CHAT_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeChatData(JSON.parse(raw) as Partial<ChatData>);
  } catch {
    await writeChatData(CHAT_SEED_DATA);
    return CHAT_SEED_DATA;
  }
}

export async function writeChatData(data: ChatData) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
    return;
  }

  if (storageDriver !== "json") {
    throw new Error("CHAT_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
