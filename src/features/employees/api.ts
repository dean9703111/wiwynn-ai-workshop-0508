import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Employee, Role } from "@/types";

export interface EmployeeFilters {
  q?: string;
}

export interface EmployeeInput {
  employeeNo: string;
  name: string;
  email: string;
  department: string;
  role: Role;
}

const baseKey = ["employees"] as const;

export function useEmployees(filters: EmployeeFilters) {
  return useQuery({
    queryKey: [...baseKey, "list", filters],
    queryFn: () =>
      api.get<Employee[]>("/api/employees", {
        query: { q: filters.q },
      }),
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EmployeeInput) =>
      api.post<Employee>("/api/employees", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: baseKey });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EmployeeInput }) =>
      api.put<Employee>(`/api/employees/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: baseKey });
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/employees/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: baseKey });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
