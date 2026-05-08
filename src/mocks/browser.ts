import { setupWorker } from "msw/browser";
import { authHandlers } from "./handlers/auth";
import { dashboardHandlers } from "./handlers/dashboard";
import { vehicleHandlers } from "./handlers/vehicles";
import { employeeHandlers } from "./handlers/employees";

export const worker = setupWorker(
  ...authHandlers,
  ...dashboardHandlers,
  ...vehicleHandlers,
  ...employeeHandlers
);
