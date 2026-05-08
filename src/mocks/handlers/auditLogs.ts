import { http, HttpResponse } from "msw";
import type {
  AuditAction,
  AuditLog,
  AuditLogListResponse,
  AuditResource,
} from "@/types";
import { db } from "../db";
import { getRequestUser } from "../auth";

const ALLOWED_RESOURCES: AuditResource[] = ["vehicle", "employee"];
const ALLOWED_ACTIONS: AuditAction[] = ["create", "update", "delete"];
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function unauthorized() {
  return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
}
function forbidden() {
  return HttpResponse.json({ message: "forbidden" }, { status: 403 });
}

export const auditLogHandlers = [
  http.get("/api/audit-logs", ({ request }) => {
    const user = getRequestUser(request);
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();

    const url = new URL(request.url);
    const resourceParam = url.searchParams.get("resource");
    const actionParam = url.searchParams.get("action");
    const resource = ALLOWED_RESOURCES.includes(
      resourceParam as AuditResource
    )
      ? (resourceParam as AuditResource)
      : undefined;
    const action = ALLOWED_ACTIONS.includes(actionParam as AuditAction)
      ? (actionParam as AuditAction)
      : undefined;

    const pageRaw = Number(url.searchParams.get("page") ?? 1);
    const pageSizeRaw = Number(
      url.searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE
    );
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;
    const pageSize = clampPageSize(pageSizeRaw);

    const filtered = filterAndSort(db.auditLogs, { resource, action });
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    const body: AuditLogListResponse = { items, total, page, pageSize };
    return HttpResponse.json(body);
  }),
];

function clampPageSize(value: number): number {
  if (!Number.isFinite(value) || value < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(MAX_PAGE_SIZE, Math.floor(value));
}

function filterAndSort(
  logs: AuditLog[],
  filters: { resource?: AuditResource; action?: AuditAction }
): AuditLog[] {
  let result = logs;
  if (filters.resource) {
    result = result.filter((l) => l.resource === filters.resource);
  }
  if (filters.action) {
    result = result.filter((l) => l.action === filters.action);
  }
  return result
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}
