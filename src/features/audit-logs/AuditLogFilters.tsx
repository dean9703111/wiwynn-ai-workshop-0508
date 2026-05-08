import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuditAction, AuditResource } from "@/types";

interface AuditLogFiltersProps {
  resource: AuditResource | "all";
  action: AuditAction | "all";
  onResourceChange: (value: AuditResource | "all") => void;
  onActionChange: (value: AuditAction | "all") => void;
}

export function AuditLogFilters({
  resource,
  action,
  onResourceChange,
  onActionChange,
}: AuditLogFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">資源類型</span>
        <Select
          value={resource}
          onValueChange={(v) =>
            onResourceChange(v as AuditResource | "all")
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="全部" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="vehicle">車輛</SelectItem>
            <SelectItem value="employee">員工</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">動作</span>
        <Select
          value={action}
          onValueChange={(v) => onActionChange(v as AuditAction | "all")}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="全部" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="create">新增</SelectItem>
            <SelectItem value="update">編輯</SelectItem>
            <SelectItem value="delete">刪除</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
