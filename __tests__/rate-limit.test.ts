import { describe, it, expect, beforeEach } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

describe("rate-limit", () => {
  const limiter = createRateLimiter("test", 3, 5000);

  beforeEach(() => {
    limiter.reset("ip-1");
    limiter.reset("ip-2");
  });

  it("allows requests under limit", () => {
    const r1 = limiter.check("ip-1");
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = limiter.check("ip-1");
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);
  });

  it("blocks requests over limit", () => {
    limiter.check("ip-1");
    limiter.check("ip-1");
    limiter.check("ip-1");

    const r4 = limiter.check("ip-1");
    expect(r4.success).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it("tracks identifiers independently", () => {
    limiter.check("ip-1");
    limiter.check("ip-1");
    limiter.check("ip-1");

    // ip-2 is not affected
    const r = limiter.check("ip-2");
    expect(r.success).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it("reset clears history for an identifier", () => {
    limiter.check("ip-1");
    limiter.check("ip-1");
    limiter.check("ip-1");
    expect(limiter.check("ip-1").success).toBe(false);

    limiter.reset("ip-1");
    expect(limiter.check("ip-1").success).toBe(true);
  });
});
