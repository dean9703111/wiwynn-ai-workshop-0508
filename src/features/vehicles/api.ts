import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Vehicle, VehicleStatus, VehicleType } from "@/types";

export interface VehicleFilters {
  q?: string;
  status?: VehicleStatus | "all";
}

export interface VehicleInput {
  plateNumber: string;
  brand: string;
  model: string;
  type: VehicleType;
  status: VehicleStatus;
  year: number;
}

const baseKey = ["vehicles"] as const;

export function useVehicles(filters: VehicleFilters) {
  return useQuery({
    queryKey: [...baseKey, "list", filters],
    queryFn: () =>
      api.get<Vehicle[]>("/api/vehicles", {
        query: {
          q: filters.q,
          status: filters.status && filters.status !== "all"
            ? filters.status
            : undefined,
        },
      }),
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: VehicleInput) =>
      api.post<Vehicle>("/api/vehicles", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: baseKey });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VehicleInput }) =>
      api.put<Vehicle>(`/api/vehicles/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: baseKey });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/vehicles/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: baseKey });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
