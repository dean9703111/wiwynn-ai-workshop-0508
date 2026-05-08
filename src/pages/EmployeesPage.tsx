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
import { ApiError } from "@/lib/api";
import {
  useDeleteEmployee,
  useEmployees,
  type EmployeeFilters,
} from "@/features/employees/api";
import { EmployeeFormDialog } from "@/features/employees/EmployeeFormDialog";
import type { Employee } from "@/types";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("zh-TW");
}

export function EmployeesPage() {
  const [filters, setFilters] = useState<EmployeeFilters>({ q: "" });
  const { data, isLoading } = useEmployees(filters);
  const remove = useDeleteEmployee();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const handleEdit = (e: Employee) => {
    setEditing(e);
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
          <h1 className="text-2xl font-bold tracking-tight">員工管理</h1>
          <p className="text-sm text-muted-foreground">
            僅管理者可使用此頁
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> 新增員工
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>員工清單</CardTitle>
          <CardDescription>
            可依姓名、員工編號或 e-mail 進行搜尋
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.q}
              onChange={(e) =>
                setFilters({ q: e.target.value })
              }
              placeholder="搜尋員工..."
              className="pl-8"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>員工編號</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>電子郵件</TableHead>
                  <TableHead>部門</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>建立時間</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : !data || data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      沒有符合條件的員工
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">
                        {e.employeeNo}
                      </TableCell>
                      <TableCell>{e.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {e.email}
                      </TableCell>
                      <TableCell>{e.department}</TableCell>
                      <TableCell>
                        <Badge
                          variant={e.role === "admin" ? "default" : "secondary"}
                        >
                          {e.role === "admin" ? "管理者" : "一般使用者"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(e.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(e)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleting(e)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EmployeeFormDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        employee={editing}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除員工？</AlertDialogTitle>
            <AlertDialogDescription>
              即將刪除員工「{deleting?.name}」（{deleting?.employeeNo}），此操作無法復原。
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
