import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth";
import { ApiError } from "@/lib/api";
import {
  useDeleteVehicle,
  useVehicles,
  type VehicleFilters,
} from "@/features/vehicles/api";
import { VehicleFormDialog } from "@/features/vehicles/VehicleFormDialog";
import type { Vehicle, VehicleStatus, VehicleType } from "@/types";

const STATUS_LABEL: Record<VehicleStatus, string> = {
  available: "可用",
  "in-use": "使用中",
  maintenance: "維修中",
};
const STATUS_VARIANT: Record<
  VehicleStatus,
  "success" | "default" | "warning"
> = {
  available: "success",
  "in-use": "default",
  maintenance: "warning",
};
const TYPE_LABEL: Record<VehicleType, string> = {
  sedan: "轎車",
  suv: "SUV",
  truck: "貨車",
  van: "廂型車",
};

export function VehiclesPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";
  const [filters, setFilters] = useState<VehicleFilters>({
    q: "",
    status: "all",
  });
  const { data, isLoading } = useVehicles(filters);
  const remove = useDeleteVehicle();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (v: Vehicle) => {
    setEditing(v);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      toast.success("刪除成功");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("刪除失敗");
      }
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">車輛管理</h1>
          <p className="text-sm text-muted-foreground">
            檢視所有車輛；管理者可新增、編輯與刪除。
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> 新增車輛
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>車輛清單</CardTitle>
          <CardDescription>
            可依車牌或品牌關鍵字搜尋，並依狀態篩選
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filters.q}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, q: e.target.value }))
                }
                placeholder="搜尋車牌、品牌、型號"
                className="pl-8"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(v) =>
                setFilters((p) => ({
                  ...p,
                  status: v as VehicleFilters["status"],
                }))
              }
            >
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有狀態</SelectItem>
                <SelectItem value="available">可用</SelectItem>
                <SelectItem value="in-use">使用中</SelectItem>
                <SelectItem value="maintenance">維修中</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>車牌</TableHead>
                  <TableHead>品牌 / 型號</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>年份</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">操作</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={isAdmin ? 6 : 5}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : !data || data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 6 : 5}
                      className="text-center text-muted-foreground"
                    >
                      沒有符合條件的車輛
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">
                        {v.plateNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{v.brand}</div>
                        <div className="text-xs text-muted-foreground">
                          {v.model}
                        </div>
                      </TableCell>
                      <TableCell>{TYPE_LABEL[v.type]}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[v.status]}>
                          {STATUS_LABEL[v.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{v.year}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(v)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleting(v)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <VehicleFormDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        vehicle={editing}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除車輛？</AlertDialogTitle>
            <AlertDialogDescription>
              即將刪除車牌「{deleting?.plateNumber}」，此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>確認</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
