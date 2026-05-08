import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  DashboardSummary,
  StatusDistribution,
  TypeDistribution,
} from "@/types";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => api.get<DashboardSummary>("/api/dashboard/summary"),
  });
}

export function useStatusDistribution() {
  return useQuery({
    queryKey: ["dashboard", "status-distribution"],
    queryFn: () =>
      api.get<StatusDistribution[]>("/api/dashboard/status-distribution"),
  });
}

export function useTypeDistribution() {
  return useQuery({
    queryKey: ["dashboard", "type-distribution"],
    queryFn: () =>
      api.get<TypeDistribution[]>("/api/dashboard/type-distribution"),
  });
}
