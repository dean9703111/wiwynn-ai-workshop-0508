export type AuditResource = "vehicle" | "employee";
export type AuditAction = "create" | "update" | "delete";

export interface AuditLog {
  id: string;
  createdAt: string;
  actorId: string;
  actorUsername: string;
  actorName: string;
  resource: AuditResource;
  resourceId: string;
  action: AuditAction;
  summary: string;
  details?: Record<string, unknown>;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditLogQuery {
  resource?: AuditResource;
  action?: AuditAction;
  page?: number;
  pageSize?: number;
}
