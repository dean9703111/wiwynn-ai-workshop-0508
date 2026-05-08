export type Role = "admin" | "user";

export type VehicleStatus = "available" | "in-use" | "maintenance";
export type VehicleType = "sedan" | "suv" | "truck" | "van";

export interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  type: VehicleType;
  status: VehicleStatus;
  year: number;
  createdAt: string;
}

export interface Employee {
  id: string;
  employeeNo: string;
  name: string;
  email: string;
  department: string;
  role: Role;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: Role;
  employeeId?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: Role;
}

export interface DashboardSummary {
  totalVehicles: number;
  availableVehicles: number;
  totalEmployees: number;
  newVehiclesThisMonth: number;
}

export interface StatusDistribution {
  status: VehicleStatus;
  count: number;
}

export interface TypeDistribution {
  type: VehicleType;
  count: number;
}

export type {
  AuditAction,
  AuditLog,
  AuditLogListResponse,
  AuditLogQuery,
  AuditResource,
} from "./auditLog";
