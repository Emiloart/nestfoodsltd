import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { captureCareerApplication } from "@/lib/careers/service";
import { validateCareerFiles } from "@/lib/careers/upload-rules";
import { sendCareerApplicationEmails } from "@/lib/email/notifications";
import { type TransactionalEmailAttachment } from "@/lib/email/service";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { isTrustedOrigin, resolveClientIp } from "@/lib/security/request";

export const runtime = "nodejs";

const careerApplicationSchema = z.object({
  fullName: z.string().trim().min(2).max(140),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(180),
  position: z.string().trim().min(2).max(140),
  yearsOfExperience: z.string().trim().max(80).optional(),
  otherExperience: z.string().trim().max(1200).optional(),
});

function readStringField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isUploadedFile(value: FormDataEntryValue): value is File {
  return typeof value === "object" && "arrayBuffer" in value && "name" in value && "size" in value;
}

function cleanFileName(fileName: string) {
  return fileName.replace(/[^\w .()-]/g, "_").slice(0, 160) || "attachment";
}

async function buildEmailAttachments(files: File[]) {
  const attachments: TransactionalEmailAttachment[] = [];
  const validationError = validateCareerFiles(files);
  if (validationError) return { error: validationError, attachments };

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split(".").pop()?.toLowerCase();
    const signatureMatches =
      extension === "pdf"
        ? buffer.subarray(0, 5).toString() === "%PDF-"
        : extension === "png"
          ? buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : extension === "jpg" || extension === "jpeg"
            ? buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
            : extension === "doc"
              ? buffer.subarray(0, 8).equals(Buffer.from([208, 207, 17, 224, 161, 177, 26, 225]))
              : extension === "docx"
                ? buffer.subarray(0, 4).equals(Buffer.from([80, 75, 3, 4])) &&
                  buffer.includes(Buffer.from("word/")) &&
                  buffer.includes(Buffer.from("[Content_Types].xml"))
                : false;
    if (!signatureMatches)
      return {
        error: `${file.name} does not match its document format. Please export and attach a valid file.`,
        attachments: [],
      };
    attachments.push({
      filename: cleanFileName(file.name),
      content: buffer.toString("base64"),
      content_type: file.type || undefined,
    });
  }

  return { attachments };
}

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const rateLimitResult = evaluateRateLimit({
    bucket: "careers.apply",
    identifier: resolveClientIp(request),
    windowMs: 10 * 60 * 1000,
    max: 6,
    blockDurationMs: 10 * 60 * 1000,
  });
  if (!rateLimitResult.allowed) {
    return createRateLimitErrorResponse(
      rateLimitResult,
      "Career application limit exceeded. Please retry shortly.",
    );
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    const response = NextResponse.json(
      { error: "Invalid career application payload." },
      { status: 400 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }

  const validated = careerApplicationSchema.safeParse({
    fullName: readStringField(formData, "fullName"),
    phone: readStringField(formData, "phone"),
    email: readStringField(formData, "email"),
    position: readStringField(formData, "position"),
    yearsOfExperience: readStringField(formData, "yearsOfExperience"),
    otherExperience: readStringField(formData, "otherExperience"),
  });

  if (!validated.success) {
    const response = NextResponse.json(
      { error: "Invalid career application payload.", details: validated.error.flatten() },
      { status: 400 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }

  const files = formData
    .getAll("files")
    .filter(isUploadedFile)
    .filter((file) => file.name.trim());

  const attachmentResult = await buildEmailAttachments(files);
  if (attachmentResult.error) {
    const response = NextResponse.json({ error: attachmentResult.error }, { status: 400 });
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }

  try {
    const application = await captureCareerApplication({
      ...validated.data,
      fileNames: files.map((file) => cleanFileName(file.name)),
    });
    const emailDelivery = await sendCareerApplicationEmails({
      application,
      attachments: attachmentResult.attachments,
    });

    const response = NextResponse.json(
      {
        application: { id: application.id, position: application.position },
        emailDelivery,
      },
      { status: 201 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  } catch {
    const response = NextResponse.json(
      { error: "Career application could not be saved. Please try again." },
      { status: 500 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }
}
