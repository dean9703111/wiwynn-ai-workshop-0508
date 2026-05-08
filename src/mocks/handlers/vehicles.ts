import { http, HttpResponse } from "msw";
import type { Vehicle, VehicleStatus, VehicleType } from "@/types";
import { db } from "../db";
import { getRequestUser } from "../auth";
import { appendAuditLog, buildUpdateSummary } from "../auditLogger";

interface VehicleInput {
  plateNumber: string;
  brand: string;
  model: string;
  type: VehicleType;
  status: VehicleStatus;
  year: number;
}

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  sedan: "轎車",
  suv: "SUV",
  truck: "卡車",
  van: "廂型車",
};

const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  available: "available",
  "in-use": "in-use",
  maintenance: "maintenance",
};

function unauthorized() {
  return HttpResponse.json({ message: "unauthorized" }, { status: 401 });
}
function forbidden() {
  return HttpResponse.json({ message: "forbidden" }, { status: 403 });
}
function notFound() {
  return HttpResponse.json({ message: "not found" }, { status: 404 });
}
function conflict(field: string) {
  return HttpResponse.json(
    { message: "conflict", field },
    { status: 409 }
  );
}

function describeVehicle(v: Pick<Vehicle, "plateNumber" | "brand" | "model">) {
  return `${v.plateNumber} (${v.brand} ${v.model})`;
}

export const vehicleHandlers = [
  http.get("/api/vehicles", ({ request }) => {
    const user = getRequestUser(request);
    if (!user) return unauthorized();
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
    const status = url.searchParams.get("status") ?? "";
    let result = db.vehicles.slice();
    if (q) {
      result = result.filter(
        (v) =>
          v.plateNumber.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q)
      );
    }
    if (status && status !== "all") {
      result = result.filter((v) => v.status === status);
    }
    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return HttpResponse.json(result);
  }),

  http.post("/api/vehicles", async ({ request }) => {
    const user = getRequestUser(request);
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();
    const body = (await request.json()) as VehicleInput;
    const exists = db.vehicles.some(
      (v) => v.plateNumber.toLowerCase() === body.plateNumber.toLowerCase()
    );
    if (exists) return conflict("plateNumber");
    const next: Vehicle = {
      id: `veh-${crypto.randomUUID()}`,
      plateNumber: body.plateNumber,
      brand: body.brand,
      model: body.model,
      type: body.type,
      status: body.status,
      year: body.year,
      createdAt: new Date().toISOString(),
    };
    db.setVehicles([next, ...db.vehicles]);
    appendAuditLog({
      actor: user,
      resource: "vehicle",
      resourceId: next.id,
      action: "create",
      summary: `新增車輛 ${describeVehicle(next)}`,
    });
    return HttpResponse.json(next, { status: 201 });
  }),

  http.put("/api/vehicles/:id", async ({ params, request }) => {
    const user = getRequestUser(request);
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();
    const id = params.id as string;
    const idx = db.vehicles.findIndex((v) => v.id === id);
    if (idx < 0) return notFound();
    const before = db.vehicles[idx];
    const body = (await request.json()) as VehicleInput;
    const duplicate = db.vehicles.some(
      (v) =>
        v.id !== id &&
        v.plateNumber.toLowerCase() === body.plateNumber.toLowerCase()
    );
    if (duplicate) return conflict("plateNumber");
    const updated: Vehicle = {
      ...before,
      ...body,
    };
    const next = db.vehicles.slice();
    next[idx] = updated;
    db.setVehicles(next);
    const changes = diffVehicle(before, updated);
    appendAuditLog({
      actor: user,
      resource: "vehicle",
      resourceId: updated.id,
      action: "update",
      summary: buildUpdateSummary(changes),
    });
    return HttpResponse.json(updated);
  }),

  http.delete("/api/vehicles/:id", ({ params, request }) => {
    const user = getRequestUser(request);
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();
    const id = params.id as string;
    const target = db.vehicles.find((v) => v.id === id);
    if (!target) return notFound();
    db.setVehicles(db.vehicles.filter((v) => v.id !== id));
    appendAuditLog({
      actor: user,
      resource: "vehicle",
      resourceId: target.id,
      action: "delete",
      summary: `刪除車輛 ${describeVehicle(target)}`,
    });
    return new HttpResponse(null, { status: 204 });
  }),
];

function diffVehicle(before: Vehicle, after: Vehicle) {
  const changes: { label: string; before: unknown; after: unknown }[] = [];
  if (before.plateNumber !== after.plateNumber) {
    changes.push({
      label: "車牌",
      before: before.plateNumber,
      after: after.plateNumber,
    });
  }
  if (before.brand !== after.brand || before.model !== after.model) {
    changes.push({
      label: "品牌型號",
      before: `${before.brand} ${before.model}`,
      after: `${after.brand} ${after.model}`,
    });
  }
  if (before.type !== after.type) {
    changes.push({
      label: "類型",
      before: VEHICLE_TYPE_LABELS[before.type],
      after: VEHICLE_TYPE_LABELS[after.type],
    });
  }
  if (before.status !== after.status) {
    changes.push({
      label: "狀態",
      before: VEHICLE_STATUS_LABELS[before.status],
      after: VEHICLE_STATUS_LABELS[after.status],
    });
  }
  if (before.year !== after.year) {
    changes.push({ label: "年份", before: before.year, after: after.year });
  }
  return changes;
}
