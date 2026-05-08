import { KpiCards } from "@/features/dashboard/KpiCards";
import { DashboardCharts } from "@/features/dashboard/DashboardCharts";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">儀表板</h1>
        <p className="text-sm text-muted-foreground">
          掌握車隊使用狀況與關鍵指標
        </p>
      </div>
      <KpiCards />
      <DashboardCharts />
    </div>
  );
}
