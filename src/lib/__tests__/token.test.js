import { makeToken, parseToken, TOKEN_PREFIX } from "../token.js";

describe("token utilities", () => {
  it("makeToken prefixes the user id", () => {
    expect(makeToken("usr-1")).toBe(`${TOKEN_PREFIX}usr-1`);
  });

  it("makeToken throws for empty input", () => {
    expect(() => makeToken("")).toThrow(TypeError);
    expect(() => makeToken(null)).toThrow(TypeError);
  });

  it("parseToken returns the user id for a valid Bearer header", () => {
    const userId = "usr-admin";
    const header = `Bearer ${makeToken(userId)}`;
    expect(parseToken(header)).toBe(userId);
  });

  it("parseToken returns null when header is missing or malformed", () => {
    expect(parseToken(null)).toBeNull();
    expect(parseToken("")).toBeNull();
    expect(parseToken("Bearer")).toBeNull();
    expect(parseToken("Bearer fake-jwt.")).toBeNull();
    expect(parseToken("Token fake-jwt.usr-1")).toBeNull();
  });
});
