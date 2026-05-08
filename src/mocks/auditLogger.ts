import type {
  AuditAction,
  AuditLog,
  AuditResource,
  User,
} from "@/types";
import { db } from "./db";

interface AppendAuditLogInput {
  actor: Pick<User, "id" | "username" | "name">;
  resource: AuditResource;
  resourceId: string;
  action: AuditAction;
  summary: string;
  details?: Record<string, unknown>;
}

export function appendAuditLog(input: AppendAuditLogInput): void {
  try {
    const log: AuditLog = {
      id: `log-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      actorId: input.actor.id,
      actorUsername: input.actor.username,
      actorName: input.actor.name,
      resource: input.resource,
      resourceId: input.resourceId,
      action: input.action,
      summary: input.summary,
      details: input.details,
    };
    db.appendAuditLog(log);
  } catch (err) {
    console.warn("[mock] failed to append audit log", err);
  }
}

interface ChangedField {
  label: string;
  before: unknown;
  after: unknown;
}

export function buildUpdateSummary(changes: ChangedField[]): string {
  if (changes.length === 0) return "無欄位變動";
  const head = changes
    .slice(0, 3)
    .map((c) => `${c.label} = ${formatValue(c.before)} → ${formatValue(c.after)}`)
    .join("；");
  if (changes.length <= 3) return head;
  return `${head}…等 ${changes.length} 項`;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "(空)";
  return String(value);
}
