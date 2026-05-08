export const TOKEN_PREFIX = "fake-jwt.";

export function makeToken(userId) {
  if (typeof userId !== "string" || userId.length === 0) {
    throw new TypeError("userId must be a non-empty string");
  }
  return `${TOKEN_PREFIX}${userId}`;
}

export function parseToken(authHeader) {
  if (typeof authHeader !== "string" || authHeader.length === 0) {
    return null;
  }
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }
  const raw = authHeader.slice("Bearer ".length).trim();
  if (!raw.startsWith(TOKEN_PREFIX)) {
    return null;
  }
  const userId = raw.slice(TOKEN_PREFIX.length);
  return userId.length > 0 ? userId : null;
}
