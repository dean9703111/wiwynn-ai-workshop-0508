import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AuditAction, AuditLog, AuditResource } from "@/types";

interface AuditLogTableProps {
  data: AuditLog[];
  isLoading: boolean;
}

const RESOURCE_LABEL: Record<AuditResource, string> = {
  vehicle: "車輛",
  employee: "員工",
};

const ACTION_LABEL: Record<AuditAction, string> = {
  create: "新增",
  update: "編輯",
  delete: "刪除",
};

const ACTION_VARIANT: Record<
  AuditAction,
  "default" | "secondary" | "destructive"
> = {
  create: "default",
  update: "secondary",
  delete: "destructive",
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-TW", { hour12: false });
}

export function AuditLogTable({ data, isLoading }: AuditLogTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">時間</TableHead>
            <TableHead className="w-[180px]">操作者</TableHead>
            <TableHead className="w-[100px]">資源類型</TableHead>
            <TableHead className="w-[180px]">資源 ID</TableHead>
            <TableHead className="w-[80px]">動作</TableHead>
            <TableHead>變更摘要</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={6}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                沒有符合條件的紀錄
              </TableCell>
            </TableRow>
          ) : (
            data.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDateTime(log.createdAt)}
                </TableCell>
                <TableCell>
                  {log.actorName}{" "}
                  <span className="text-muted-foreground">
                    ({log.actorUsername})
                  </span>
                </TableCell>
                <TableCell>{RESOURCE_LABEL[log.resource]}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {log.resourceId}
                </TableCell>
                <TableCell>
                  <Badge variant={ACTION_VARIANT[log.action]}>
                    {ACTION_LABEL[log.action]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{log.summary}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
