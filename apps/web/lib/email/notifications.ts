import { type CareerApplication } from "@/lib/careers/types";
import { type EnquiryLead } from "@/lib/enquiries/types";
import { type NewsletterSubscriber } from "@/lib/newsletter/types";

import {
  getNotificationRecipients,
  sendTransactionalEmail,
  type EmailSendResult,
  type TransactionalEmailAttachment,
} from "./service";

type Detail = {
  label: string;
  value?: string | string[] | null;
};

type NotificationDelivery = {
  confirmation?: EmailSendResult;
  internal?: EmailSendResult;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeDetailValue(value: Detail["value"]) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }
  return value?.trim() || "Not provided";
}

function detailsToText(details: Detail[]) {
  return details.map((detail) => `${detail.label}: ${normalizeDetailValue(detail.value)}`).join("\n");
}

function detailsToHtml(details: Detail[]) {
  const rows = details
    .map((detail) => {
      const value = escapeHtml(normalizeDetailValue(detail.value)).replaceAll("\n", "<br />");
      return `<tr><th align="left" style="padding:10px 12px;border-bottom:1px solid #eadfce;color:#2e1245;width:38%;">${escapeHtml(detail.label)}</th><td style="padding:10px 12px;border-bottom:1px solid #eadfce;color:#26211c;">${value}</td></tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#fcf7f0;border:1px solid #eadfce;border-radius:14px;overflow:hidden;">${rows}</table>`;
}

function buildEmailHtml(title: string, intro: string, details: Detail[], footer: string) {
  return `
    <div style="margin:0;padding:24px;background:#f5efe6;font-family:Arial,sans-serif;color:#26211c;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;padding:28px;border:1px solid #eadfce;">
        <p style="margin:0 0 8px;color:#5a247a;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;font-weight:700;">De-Nest Bread</p>
        <h1 style="margin:0 0 14px;color:#2e1245;font-size:26px;line-height:1.2;">${escapeHtml(title)}</h1>
        <p style="margin:0 0 22px;line-height:1.7;color:#4d453d;">${escapeHtml(intro)}</p>
        ${detailsToHtml(details)}
        <p style="margin:22px 0 0;line-height:1.6;color:#6d6258;font-size:13px;">${escapeHtml(footer)}</p>
      </div>
    </div>
  `;
}

function enquiryDetails(lead: EnquiryLead): Detail[] {
  return [
    { label: "Reference", value: lead.id },
    { label: "Name", value: lead.fullName },
    { label: "Phone", value: lead.phone },
    { label: "Email", value: lead.email },
    { label: "Location", value: lead.location },
    { label: "Product interest", value: lead.productInterest },
    { label: "Quantity / need", value: lead.quantity },
    { label: "Business type", value: lead.businessType },
    { label: "Capacity", value: lead.capacity },
    { label: "Message", value: lead.message },
    { label: "Submitted", value: new Date(lead.createdAt).toLocaleString("en-NG") },
  ];
}

export async function sendEnquiryLeadEmails(lead: EnquiryLead): Promise<NotificationDelivery> {
  const details = enquiryDetails(lead);
  const leadType = lead.type === "bulk" ? "supply enquiry" : "business interest";
  const delivery: NotificationDelivery = {};

  if (lead.email) {
    delivery.confirmation = await sendTransactionalEmail({
      to: lead.email,
      subject: "We received your De-Nest Bread enquiry",
      text: [
        `Hello ${lead.fullName},`,
        "",
        `Nest Foods Limited has received your ${leadType}. A team member will review it and follow up using the contact details you provided.`,
        "",
        detailsToText(details),
        "",
        "This is an automated confirmation from Nest Foods Limited.",
      ].join("\n"),
      html: buildEmailHtml(
        "Enquiry received",
        `Hello ${lead.fullName}, Nest Foods Limited has received your ${leadType}. A team member will review it and follow up using the contact details you provided.`,
        details,
        "This is an automated confirmation from Nest Foods Limited.",
      ),
      replyTo: "sales@nestfoodsltd.com",
    });
  }

  delivery.internal = await sendTransactionalEmail({
    to: getNotificationRecipients("sales"),
    subject: `New ${leadType} - ${lead.fullName}`,
    text: ["A new website enquiry was submitted.", "", detailsToText(details)].join("\n"),
    html: buildEmailHtml(
      `New ${leadType}`,
      "A new website enquiry was submitted through the De-Nest Bread website.",
      details,
      "Reply directly to the submitted customer email or use the phone number provided.",
    ),
    replyTo: lead.email || "sales@nestfoodsltd.com",
  });

  return delivery;
}

export async function sendNewsletterSignupEmails(input: {
  subscriber: NewsletterSubscriber;
  created: boolean;
}): Promise<NotificationDelivery> {
  const details: Detail[] = [
    { label: "Reference", value: input.subscriber.id },
    { label: "Email", value: input.subscriber.email },
    { label: "Name", value: input.subscriber.fullName },
    { label: "Source", value: input.subscriber.source },
    { label: "Marketing consent", value: input.subscriber.consentMarketing ? "Yes" : "No" },
    { label: "Submitted", value: new Date(input.subscriber.createdAt).toLocaleString("en-NG") },
  ];

  const delivery: NotificationDelivery = {};
  delivery.confirmation = await sendTransactionalEmail({
    to: input.subscriber.email,
    subject: "Your De-Nest Bread newsletter signup",
    text: [
      "Nest Foods Limited has received your newsletter signup.",
      "",
      detailsToText(details),
      "",
      "This is an automated confirmation from Nest Foods Limited.",
    ].join("\n"),
    html: buildEmailHtml(
      "Newsletter signup received",
      "Nest Foods Limited has received your newsletter signup.",
      details,
      "This is an automated confirmation from Nest Foods Limited.",
    ),
    replyTo: "info@nestfoodsltd.com",
  });

  if (input.created) {
    delivery.internal = await sendTransactionalEmail({
      to: getNotificationRecipients("admin"),
      subject: `New newsletter signup - ${input.subscriber.email}`,
      text: ["A new newsletter signup was submitted.", "", detailsToText(details)].join("\n"),
      html: buildEmailHtml(
        "New newsletter signup",
        "A new newsletter signup was submitted through the De-Nest Bread website.",
        details,
        "This notification was generated automatically by the website.",
      ),
      replyTo: input.subscriber.email,
    });
  }

  return delivery;
}

export async function sendCareerApplicationEmails(input: {
  application: CareerApplication;
  attachments: TransactionalEmailAttachment[];
}): Promise<NotificationDelivery> {
  const details: Detail[] = [
    { label: "Reference", value: input.application.id },
    { label: "Name", value: input.application.fullName },
    { label: "Phone", value: input.application.phone },
    { label: "Email", value: input.application.email },
    { label: "Position", value: input.application.position },
    { label: "Years of experience", value: input.application.yearsOfExperience },
    { label: "Other experience", value: input.application.otherExperience },
    { label: "Attached files", value: input.application.fileNames },
    { label: "Submitted", value: new Date(input.application.createdAt).toLocaleString("en-NG") },
  ];

  const delivery: NotificationDelivery = {};
  delivery.confirmation = await sendTransactionalEmail({
    to: input.application.email,
    subject: "We received your Nest Foods Limited application",
    text: [
      `Hello ${input.application.fullName},`,
      "",
      "Nest Foods Limited has received your career application. HR will review your details and contact you if your application matches current openings.",
      "",
      detailsToText(details),
      "",
      "This is an automated confirmation from Nest Foods Limited.",
    ].join("\n"),
    html: buildEmailHtml(
      "Application received",
      `Hello ${input.application.fullName}, Nest Foods Limited has received your career application. HR will review your details and contact you if your application matches current openings.`,
      details,
      "This is an automated confirmation from Nest Foods Limited.",
    ),
    replyTo: "hrsupport@nestfoodsltd.com",
  });

  delivery.internal = await sendTransactionalEmail({
    to: getNotificationRecipients("hr"),
    subject: `New career application - ${input.application.position} - ${input.application.fullName}`,
    text: ["A new career application was submitted.", "", detailsToText(details)].join("\n"),
    html: buildEmailHtml(
      "New career application",
      "A new career application was submitted through the De-Nest Bread website.",
      details,
      "Applicant files are attached when email delivery is configured and file size limits are respected.",
    ),
    replyTo: input.application.email,
    attachments: input.attachments,
  });

  return delivery;
}
