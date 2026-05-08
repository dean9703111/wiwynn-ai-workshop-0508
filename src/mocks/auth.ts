import type { User } from "@/types";
import { db } from "./db";
import { makeToken, parseToken, TOKEN_PREFIX } from "@/lib/token";

export { makeToken, parseToken, TOKEN_PREFIX };

export function getRequestUser(request: Request): User | null {
  const auth = request.headers.get("Authorization");
  const userId = parseToken(auth);
  if (!userId) return null;
  return db.users.find((u) => u.id === userId) ?? null;
}
