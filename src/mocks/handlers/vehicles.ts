import { http, HttpResponse } from "msw";
import type { Vehicle, VehicleStatus, VehicleType } from "@/types";
import { db } from "../db";
import { getRequestUser } from "../auth";

interface VehicleInput {
  plateNumber: string;
  brand: string;
  model: string;
  type: VehicleType;
  status: VehicleStatus;
  year: number;
}

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
    return HttpResponse.json(next, { status: 201 });
  }),

  http.put("/api/vehicles/:id", async ({ params, request }) => {
    const user = getRequestUser(request);
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();
    const id = params.id as string;
    const idx = db.vehicles.findIndex((v) => v.id === id);
    if (idx < 0) return notFound();
    const body = (await request.json()) as VehicleInput;
    const duplicate = db.vehicles.some(
      (v) =>
        v.id !== id &&
        v.plateNumber.toLowerCase() === body.plateNumber.toLowerCase()
    );
    if (duplicate) return conflict("plateNumber");
    const updated: Vehicle = {
      ...db.vehicles[idx],
      ...body,
    };
    const next = db.vehicles.slice();
    next[idx] = updated;
    db.setVehicles(next);
    return HttpResponse.json(updated);
  }),

  http.delete("/api/vehicles/:id", ({ params, request }) => {
    const user = getRequestUser(request);
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();
    const id = params.id as string;
    const exists = db.vehicles.some((v) => v.id === id);
    if (!exists) return notFound();
    db.setVehicles(db.vehicles.filter((v) => v.id !== id));
    return new HttpResponse(null, { status: 204 });
  }),
];
