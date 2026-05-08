import type { AuditLog, Employee, User, Vehicle } from "@/types";
import {
  seedAuditLogs,
  seedEmployees,
  seedUsers,
  seedVehicles,
} from "./seed";

const STORAGE_KEY = "mock-db:v1";
const AUDIT_LOG_LIMIT = 1000;

interface DbShape {
  vehicles: Vehicle[];
  employees: Employee[];
  users: User[];
  auditLogs: AuditLog[];
}

const initial: DbShape = {
  vehicles: structuredClone(seedVehicles),
  employees: structuredClone(seedEmployees),
  users: structuredClone(seedUsers),
  auditLogs: structuredClone(seedAuditLogs),
};

function load(): DbShape {
  if (typeof window === "undefined") return structuredClone(initial);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(initial);
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    return {
      vehicles: parsed.vehicles ?? structuredClone(initial.vehicles),
      employees: parsed.employees ?? structuredClone(initial.employees),
      users: parsed.users ?? structuredClone(initial.users),
      auditLogs: parsed.auditLogs ?? structuredClone(initial.auditLogs),
    };
  } catch {
    return structuredClone(initial);
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state: DbShape = load();

export const db = {
  get vehicles() {
    return state.vehicles;
  },
  get employees() {
    return state.employees;
  },
  get users() {
    return state.users;
  },
  get auditLogs() {
    return state.auditLogs;
  },
  setVehicles(next: Vehicle[]) {
    state = { ...state, vehicles: next };
    persist();
  },
  setEmployees(next: Employee[]) {
    state = { ...state, employees: next };
    persist();
  },
  appendAuditLog(log: AuditLog) {
    const next = [log, ...state.auditLogs];
    if (next.length > AUDIT_LOG_LIMIT) {
      next.length = AUDIT_LOG_LIMIT;
    }
    state = { ...state, auditLogs: next };
    persist();
  },
  reset() {
    state = structuredClone(initial);
    persist();
  },
};

export function resetDb() {
  db.reset();
}

if (typeof window !== "undefined") {
  (window as unknown as { __resetMockDb: () => void }).__resetMockDb =
    resetDb;
}
