import { describe, it, expect } from "vitest";
import { signSession, verifySession } from "@/lib/auth/session-crypto";

describe("session-crypto", () => {
  it("sign then verify returns original payload", async () => {
    const payload = "user123:free";
    const signed = await signSession(payload);
    const result = await verifySession(signed);
    expect(result).toBe(payload);
  });

  it("signed cookie contains payload and signature separated by dot", async () => {
    const signed = await signSession("abc:admin");
    expect(signed).toContain("abc:admin.");
    const parts = signed.split(".");
    // payload may contain colons, but signature is the last dot-segment
    expect(parts.length).toBeGreaterThanOrEqual(2);
  });

  it("rejects tampered payload", async () => {
    const signed = await signSession("user123:free");
    const tampered = signed.replace("user123", "hacker99");
    const result = await verifySession(tampered);
    expect(result).toBeNull();
  });

  it("rejects tampered signature", async () => {
    const signed = await signSession("user123:free");
    const dot = signed.lastIndexOf(".");
    const corrupted = signed.slice(0, dot) + ".AAAA";
    const result = await verifySession(corrupted);
    expect(result).toBeNull();
  });

  it("rejects cookie with no signature", async () => {
    const result = await verifySession("user123:free");
    expect(result).toBeNull();
  });

  it("rejects empty string", async () => {
    const result = await verifySession("");
    expect(result).toBeNull();
  });

  it("handles admin role payload", async () => {
    const payload = "adminUser1:admin";
    const signed = await signSession(payload);
    const result = await verifySession(signed);
    expect(result).toBe(payload);
  });
});
