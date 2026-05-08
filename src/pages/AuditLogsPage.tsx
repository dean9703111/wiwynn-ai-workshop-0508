import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuditLogFilters } from "@/features/audit-logs/AuditLogFilters";
import { AuditLogTable } from "@/features/audit-logs/AuditLogTable";
import { useAuditLogs } from "@/features/audit-logs/api";
import type { AuditAction, AuditResource } from "@/types";

const PAGE_SIZE = 20;

type ResourceFilter = AuditResource | "all";
type ActionFilter = AuditAction | "all";

function parseResource(value: string | null): ResourceFilter {
  return value === "vehicle" || value === "employee" ? value : "all";
}
function parseAction(value: string | null): ActionFilter {
  return value === "create" || value === "update" || value === "delete"
    ? value
    : "all";
}
function parsePage(value: string | null): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function AuditLogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const resource = parseResource(searchParams.get("resource"));
  const action = parseAction(searchParams.get("action"));
  const page = parsePage(searchParams.get("page"));

  const filters = useMemo(
    () => ({
      resource: resource === "all" ? undefined : resource,
      action: action === "all" ? undefined : action,
      page,
      pageSize: PAGE_SIZE,
    }),
    [resource, action, page]
  );

  const { data, isLoading, isFetching } = useAuditLogs(filters);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = data?.items ?? [];

  const updateParams = (
    next: Partial<{ resource: ResourceFilter; action: ActionFilter; page: number }>
  ) => {
    const params = new URLSearchParams(searchParams);
    const apply = <K extends "resource" | "action" | "page">(
      key: K,
      value: string | number | undefined
    ) => {
      if (value === undefined || value === "all" || value === 1) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    };
    if ("resource" in next) apply("resource", next.resource);
    if ("action" in next) apply("action", next.action);
    if ("page" in next) apply("page", next.page);
    setSearchParams(params, { replace: false });
  };

  const handleResourceChange = (value: ResourceFilter) => {
    updateParams({ resource: value, page: 1 });
  };
  const handleActionChange = (value: ActionFilter) => {
    updateParams({ action: value, page: 1 });
  };
  const goToPage = (target: number) => {
    if (target < 1 || target > totalPages) return;
    updateParams({ page: target });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">操作紀錄</h1>
        <p className="text-sm text-muted-foreground">
          僅管理者可使用此頁；查看系統所有 CRUD 寫入的稽核軌跡
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>稽核日誌</CardTitle>
          <CardDescription>依時間由新到舊排序，每頁 {PAGE_SIZE} 筆</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuditLogFilters
            resource={resource}
            action={action}
            onResourceChange={handleResourceChange}
            onActionChange={handleActionChange}
          />

          <AuditLogTable data={items} isLoading={isLoading} />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              總共 {total} 筆{isFetching && !isLoading ? "（更新中…）" : ""}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> 上一頁
              </Button>
              <span>
                第 {page} / {totalPages} 頁
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
              >
                下一頁 <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
