import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import {
  useCreateEmployee,
  useUpdateEmployee,
  type EmployeeInput,
} from "./api";
import type { Employee, Role } from "@/types";

const schema = z.object({
  employeeNo: z.string().min(1, "請輸入員工編號"),
  name: z.string().min(1, "請輸入姓名"),
  email: z.string().email("e-mail 格式不正確"),
  department: z.string().min(1, "請輸入部門"),
  role: z.enum(["admin", "user"]),
});

type FormValues = z.infer<typeof schema>;

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "user", label: "一般使用者" },
  { value: "admin", label: "管理者" },
];

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
}: EmployeeFormDialogProps) {
  const isEdit = !!employee;
  const create = useCreateEmployee();
  const update = useUpdateEmployee();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      employeeNo: "",
      name: "",
      email: "",
      department: "",
      role: "user",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        employee
          ? {
              employeeNo: employee.employeeNo,
              name: employee.name,
              email: employee.email,
              department: employee.department,
              role: employee.role,
            }
          : {
              employeeNo: "",
              name: "",
              email: "",
              department: "",
              role: "user",
            }
      );
    }
  }, [open, employee, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload: EmployeeInput = values;
    try {
      if (isEdit && employee) {
        await update.mutateAsync({ id: employee.id, input: payload });
        toast.success("更新成功");
      } else {
        await create.mutateAsync(payload);
        toast.success("新增成功");
      }
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409 && err.field === "employeeNo") {
          setError("employeeNo", { message: "員工編號已存在" });
          return;
        }
        if (err.status === 409 && err.field === "email") {
          setError("email", { message: "電子郵件已存在" });
          return;
        }
        toast.error(err.message);
      } else {
        toast.error("操作失敗");
      }
    }
  };

  const roleValue = watch("role");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "編輯員工" : "新增員工"}</DialogTitle>
          <DialogDescription>請填寫員工資料後儲存</DialogDescription>
        </DialogHeader>
        <form
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="employeeNo">員工編號</Label>
            <Input id="employeeNo" {...register("employeeNo")} />
            {errors.employeeNo && (
              <p className="text-xs text-destructive">
                {errors.employeeNo.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="email">電子郵件</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">部門</Label>
            <Input id="department" {...register("department")} />
            {errors.department && (
              <p className="text-xs text-destructive">
                {errors.department.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>角色</Label>
            <Select
              value={roleValue}
              onValueChange={(v) =>
                setValue("role", v as Role, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇角色" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEdit ? "儲存" : "新增"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
