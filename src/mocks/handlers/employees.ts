import { http, HttpResponse } from "msw";
import type { Employee, Role } from "@/types";
import { db } from "../db";
import { getRequestUser } from "../auth";

interface EmployeeInput {
  employeeNo: string;
  name: string;
  email: string;
  department: string;
  role: Role;
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
function badRequest(message: string) {
  return HttpResponse.json({ message }, { status: 400 });
}

export const employeeHandlers = [
  http.get("/api/employees", ({ request }) => {
    const user = getRequestUser(request);
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
    let result = db.employees.slice();
    if (q) {
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.employeeNo.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
      );
    }
    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return HttpResponse.json(result);
  }),

  http.post("/api/employees", async ({ request }) => {
    const user = getRequestUser(request);
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();
    const body = (await request.json()) as EmployeeInput;
    if (
      db.employees.some(
        (e) =>
          e.employeeNo.toLowerCase() === body.employeeNo.toLowerCase()
      )
    ) {
      return conflict("employeeNo");
    }
    if (
      db.employees.some(
        (e) => e.email.toLowerCase() === body.email.toLowerCase()
      )
    ) {
      return conflict("email");
    }
    const next: Employee = {
      id: `emp-${crypto.randomUUID()}`,
      employeeNo: body.employeeNo,
      name: body.name,
      email: body.email,
      department: body.department,
      role: body.role,
      createdAt: new Date().toISOString(),
    };
    db.setEmployees([next, ...db.employees]);
    return HttpResponse.json(next, { status: 201 });
  }),

  http.put("/api/employees/:id", async ({ params, request }) => {
    const user = getRequestUser(request);
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();
    const id = params.id as string;
    const idx = db.employees.findIndex((e) => e.id === id);
    if (idx < 0) return notFound();
    const body = (await request.json()) as EmployeeInput;
    if (
      db.employees.some(
        (e) =>
          e.id !== id &&
          e.employeeNo.toLowerCase() === body.employeeNo.toLowerCase()
      )
    ) {
      return conflict("employeeNo");
    }
    if (
      db.employees.some(
        (e) =>
          e.id !== id &&
          e.email.toLowerCase() === body.email.toLowerCase()
      )
    ) {
      return conflict("email");
    }
    const updated: Employee = { ...db.employees[idx], ...body };
    const next = db.employees.slice();
    next[idx] = updated;
    db.setEmployees(next);
    return HttpResponse.json(updated);
  }),

  http.delete("/api/employees/:id", ({ params, request }) => {
    const user = getRequestUser(request);
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();
    const id = params.id as string;
    const target = db.employees.find((e) => e.id === id);
    if (!target) return notFound();
    if (target.id === user.employeeId) {
      return badRequest("無法刪除目前登入的帳號");
    }
    db.setEmployees(db.employees.filter((e) => e.id !== id));
    return new HttpResponse(null, { status: 204 });
  }),
];
