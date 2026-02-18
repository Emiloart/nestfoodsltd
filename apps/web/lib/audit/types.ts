export type AuditActorType = "admin" | "customer" | "b2b" | "system" | "anonymous";

export type AuditOutcome = "success" | "failure" | "blocked";

export type AuditSeverity = "info" | "warning" | "critical";

export type AuditEvent = {
  id: string;
  occurredAt: string;
  actorType: AuditActorType;
  actorId?: string;
  actorRole?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  outcome: AuditOutcome;
  severity: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, string | number | boolean | null>;
};

export type AuditData = {
  events: AuditEvent[];
};
