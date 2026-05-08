import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  AuditAction,
  AuditLogListResponse,
  AuditResource,
} from "@/types";

export interface AuditLogFilters {
  resource?: AuditResource;
  action?: AuditAction;
  page: number;
  pageSize: number;
}

const baseKey = ["audit-logs"] as const;

export function useAuditLogs(filters: AuditLogFilters) {
  return useQuery({
    queryKey: [...baseKey, filters],
    queryFn: () =>
      api.get<AuditLogListResponse>("/api/audit-logs", {
        query: {
          resource: filters.resource,
          action: filters.action,
          page: filters.page,
          pageSize: filters.pageSize,
        },
      }),
    placeholderData: keepPreviousData,
  });
}
