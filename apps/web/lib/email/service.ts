export type TransactionalEmailAttachment = {
  filename: string;
  content: string;
  content_type?: string;
};

export type TransactionalEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: TransactionalEmailAttachment[];
};

export type EmailSendResult =
  | {
      status: "sent";
      provider: "resend";
      id?: string;
    }
  | {
      status: "skipped";
      provider: "disabled" | "resend" | string;
      reason: string;
    }
  | {
      status: "failed";
      provider: "resend" | string;
      error: string;
    };

function getConfiguredProvider() {
  return (process.env.EMAIL_PROVIDER ?? (process.env.RESEND_API_KEY ? "resend" : "disabled"))
    .trim()
    .toLowerCase();
}

function splitRecipients(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function getEmailServiceStatus() {
  const provider = getConfiguredProvider();
  const from = process.env.EMAIL_FROM?.trim() || "De-Nest Bread <noreply@nestfoodsltd.com>";
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || "info@nestfoodsltd.com";
  const resendApiKeyConfigured = Boolean(process.env.RESEND_API_KEY?.trim());
  const enabled = provider === "resend" && resendApiKeyConfigured && Boolean(from);

  return {
    provider,
    enabled,
    from,
    replyTo,
    resendApiKeyConfigured,
    notificationRecipients: {
      sales: splitRecipients(process.env.SALES_NOTIFICATION_EMAIL || "sales@nestfoodsltd.com"),
      hr: splitRecipients(process.env.HR_NOTIFICATION_EMAIL || "hrsupport@nestfoodsltd.com"),
      admin: splitRecipients(process.env.ADMIN_NOTIFICATION_EMAIL || "adminsupport@nestfoodsltd.com"),
    },
  };
}

export function getNotificationRecipients(kind: "sales" | "hr" | "admin") {
  return getEmailServiceStatus().notificationRecipients[kind];
}

export function getEmailServiceHealth() {
  const status = getEmailServiceStatus();

  return {
    provider: status.provider,
    enabled: status.enabled,
    fromConfigured: Boolean(status.from),
    replyToConfigured: Boolean(status.replyTo),
    resendApiKeyConfigured: status.resendApiKeyConfigured,
    notificationRecipientsConfigured: {
      sales: status.notificationRecipients.sales.length > 0,
      hr: status.notificationRecipients.hr.length > 0,
      admin: status.notificationRecipients.admin.length > 0,
    },
  };
}

export async function sendTransactionalEmail(input: TransactionalEmailInput): Promise<EmailSendResult> {
  const status = getEmailServiceStatus();

  if (status.provider === "disabled") {
    return {
      status: "skipped",
      provider: "disabled",
      reason: "Transactional email is disabled. Set EMAIL_PROVIDER=resend and RESEND_API_KEY.",
    };
  }

  if (status.provider !== "resend") {
    return {
      status: "skipped",
      provider: status.provider,
      reason: `Unsupported EMAIL_PROVIDER "${status.provider}".`,
    };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      status: "skipped",
      provider: "resend",
      reason: "RESEND_API_KEY is not configured.",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: status.from,
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        text: input.text,
        html: input.html,
        reply_to: input.replyTo || status.replyTo,
        attachments: input.attachments?.length ? input.attachments : undefined,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;

    if (!response.ok) {
      return {
        status: "failed",
        provider: "resend",
        error: payload?.message || `Resend API returned ${response.status}.`,
      };
    }

    return {
      status: "sent",
      provider: "resend",
      id: payload?.id,
    };
  } catch (error) {
    return {
      status: "failed",
      provider: "resend",
      error: error instanceof Error ? error.message : "Email delivery failed.",
    };
  }
}
