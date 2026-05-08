import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStatusDistribution, useTypeDistribution } from "./api";
import type { VehicleStatus, VehicleType } from "@/types";

const STATUS_LABEL: Record<VehicleStatus, string> = {
  available: "可用",
  "in-use": "使用中",
  maintenance: "維修中",
};
const STATUS_COLOR: Record<VehicleStatus, string> = {
  available: "#10b981",
  "in-use": "#3b82f6",
  maintenance: "#f59e0b",
};

const TYPE_LABEL: Record<VehicleType, string> = {
  sedan: "轎車",
  suv: "SUV",
  truck: "貨車",
  van: "廂型車",
};

function ChartShell({
  title,
  description,
  loading,
  empty,
  children,
}: {
  title: string;
  description?: string;
  loading: boolean;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="h-64">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : empty ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            目前沒有可顯示的資料
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function VehicleStatusPie() {
  const { data, isLoading } = useStatusDistribution();
  const items = (data ?? []).filter((d) => d.count > 0);
  return (
    <ChartShell
      title="車輛狀態分佈"
      description="依狀態統計目前車輛數量"
      loading={isLoading}
      empty={items.length === 0}
    >
      <PieChart>
        <Pie
          data={items.map((d) => ({
            name: STATUS_LABEL[d.status],
            value: d.count,
            status: d.status,
          }))}
          dataKey="value"
          nameKey="name"
          innerRadius={50}
          outerRadius={85}
          paddingAngle={2}
        >
          {items.map((d) => (
            <Cell key={d.status} fill={STATUS_COLOR[d.status]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ChartShell>
  );
}

export function VehicleTypeBar() {
  const { data, isLoading } = useTypeDistribution();
  const items = (data ?? []).map((d) => ({
    name: TYPE_LABEL[d.type],
    value: d.count,
  }));
  const empty = items.every((i) => i.value === 0);
  return (
    <ChartShell
      title="車輛類型分佈"
      description="依車輛類型統計數量"
      loading={isLoading}
      empty={empty}
    >
      <BarChart data={items}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartShell>
  );
}

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <VehicleStatusPie />
      <VehicleTypeBar />
    </div>
  );
}
