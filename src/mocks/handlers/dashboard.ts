import { http, HttpResponse } from "msw";
import type {
  DashboardSummary,
  StatusDistribution,
  TypeDistribution,
  VehicleStatus,
  VehicleType,
} from "@/types";
import { db } from "../db";
import { getRequestUser } from "../auth";

function unauthorizedResponse() {
  return HttpResponse.json(
    { message: "unauthorized" },
    { status: 401 }
  );
}

const ALL_STATUSES: VehicleStatus[] = ["available", "in-use", "maintenance"];
const ALL_TYPES: VehicleType[] = ["sedan", "suv", "truck", "van"];

export const dashboardHandlers = [
  http.get("/api/dashboard/summary", ({ request }) => {
    const user = getRequestUser(request);
    if (!user) return unauthorizedResponse();
    const now = new Date();
    const summary: DashboardSummary = {
      totalVehicles: db.vehicles.length,
      availableVehicles: db.vehicles.filter((v) => v.status === "available")
        .length,
      totalEmployees: db.employees.length,
      newVehiclesThisMonth: db.vehicles.filter((v) => {
        const created = new Date(v.createdAt);
        return (
          created.getFullYear() === now.getFullYear() &&
          created.getMonth() === now.getMonth()
        );
      }).length,
    };
    return HttpResponse.json(summary);
  }),

  http.get("/api/dashboard/status-distribution", ({ request }) => {
    const user = getRequestUser(request);
    if (!user) return unauthorizedResponse();
    const data: StatusDistribution[] = ALL_STATUSES.map((status) => ({
      status,
      count: db.vehicles.filter((v) => v.status === status).length,
    }));
    return HttpResponse.json(data);
  }),

  http.get("/api/dashboard/type-distribution", ({ request }) => {
    const user = getRequestUser(request);
    if (!user) return unauthorizedResponse();
    const data: TypeDistribution[] = ALL_TYPES.map((type) => ({
      type,
      count: db.vehicles.filter((v) => v.type === type).length,
    }));
    return HttpResponse.json(data);
  }),
];
