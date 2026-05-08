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
  useCreateVehicle,
  useUpdateVehicle,
  type VehicleInput,
} from "./api";
import type { Vehicle } from "@/types";

const currentYear = new Date().getFullYear();

const schema = z.object({
  plateNumber: z
    .string()
    .min(1, "請輸入車牌")
    .max(16, "車牌過長"),
  brand: z.string().min(1, "請輸入品牌"),
  model: z.string().min(1, "請輸入型號"),
  type: z.enum(["sedan", "suv", "truck", "van"]),
  status: z.enum(["available", "in-use", "maintenance"]),
  year: z
    .coerce.number({ invalid_type_error: "年份需為數字" })
    .int()
    .min(1900, "年份不可早於 1900")
    .max(currentYear, `年份不可晚於 ${currentYear}`),
});

type FormValues = z.infer<typeof schema>;

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle | null;
}

const TYPE_OPTIONS: { value: FormValues["type"]; label: string }[] = [
  { value: "sedan", label: "轎車" },
  { value: "suv", label: "SUV" },
  { value: "truck", label: "貨車" },
  { value: "van", label: "廂型車" },
];

const STATUS_OPTIONS: { value: FormValues["status"]; label: string }[] = [
  { value: "available", label: "可用" },
  { value: "in-use", label: "使用中" },
  { value: "maintenance", label: "維修中" },
];

export function VehicleFormDialog({
  open,
  onOpenChange,
  vehicle,
}: VehicleFormDialogProps) {
  const isEdit = !!vehicle;
  const create = useCreateVehicle();
  const update = useUpdateVehicle();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      plateNumber: "",
      brand: "",
      model: "",
      type: "sedan",
      status: "available",
      year: currentYear,
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        vehicle
          ? {
              plateNumber: vehicle.plateNumber,
              brand: vehicle.brand,
              model: vehicle.model,
              type: vehicle.type,
              status: vehicle.status,
              year: vehicle.year,
            }
          : {
              plateNumber: "",
              brand: "",
              model: "",
              type: "sedan",
              status: "available",
              year: currentYear,
            }
      );
    }
  }, [open, vehicle, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload: VehicleInput = values;
    try {
      if (isEdit && vehicle) {
        await update.mutateAsync({ id: vehicle.id, input: payload });
        toast.success("更新成功");
      } else {
        await create.mutateAsync(payload);
        toast.success("新增成功");
      }
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409 && err.field === "plateNumber") {
          setError("plateNumber", { message: "車牌已存在" });
          return;
        }
        toast.error(err.message);
      } else {
        toast.error("操作失敗");
      }
    }
  };

  const typeValue = watch("type");
  const statusValue = watch("status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "編輯車輛" : "新增車輛"}</DialogTitle>
          <DialogDescription>請填寫車輛資料後儲存</DialogDescription>
        </DialogHeader>
        <form
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="plateNumber">車牌</Label>
            <Input id="plateNumber" {...register("plateNumber")} />
            {errors.plateNumber && (
              <p className="text-xs text-destructive">
                {errors.plateNumber.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">品牌</Label>
            <Input id="brand" {...register("brand")} />
            {errors.brand && (
              <p className="text-xs text-destructive">{errors.brand.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">型號</Label>
            <Input id="model" {...register("model")} />
            {errors.model && (
              <p className="text-xs text-destructive">{errors.model.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>類型</Label>
            <Select
              value={typeValue}
              onValueChange={(v) =>
                setValue("type", v as FormValues["type"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇類型" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>狀態</Label>
            <Select
              value={statusValue}
              onValueChange={(v) =>
                setValue("status", v as FormValues["status"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇狀態" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">年份</Label>
            <Input
              id="year"
              type="number"
              {...register("year", { valueAsNumber: true })}
            />
            {errors.year && (
              <p className="text-xs text-destructive">{errors.year.message}</p>
            )}
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
