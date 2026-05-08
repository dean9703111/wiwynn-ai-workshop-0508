import { Car, CheckCircle2, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { useDashboardSummary } from "./api";

const cardConfig = [
  {
    key: "totalVehicles" as const,
    label: "車輛總數",
    icon: Car,
    accent: "text-sky-600",
  },
  {
    key: "availableVehicles" as const,
    label: "可用車輛",
    icon: CheckCircle2,
    accent: "text-emerald-600",
  },
  {
    key: "totalEmployees" as const,
    label: "員工總數",
    icon: Users,
    accent: "text-violet-600",
  },
  {
    key: "newVehiclesThisMonth" as const,
    label: "本月新增",
    icon: Sparkles,
    accent: "text-amber-600",
  },
];

export function KpiCards() {
  const { data, isLoading } = useDashboardSummary();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cardConfig.map((cfg) => (
        <Card key={cfg.key} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {cfg.label}
            </CardTitle>
            <cfg.icon className={`h-5 w-5 ${cfg.accent}`} />
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="text-3xl font-bold">
                <NumberTicker value={data[cfg.key]} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
