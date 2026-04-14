import { describe, it, expect } from "vitest";
import {
  isProtected,
  isGuestOnly,
  getRequiredRole,
  getHomeRedirect,
} from "@/lib/routes/route-groups";

describe("route-groups", () => {
  describe("isProtected", () => {
    it("marks /dashboard as protected", () => {
      expect(isProtected("/dashboard")).toBe(true);
      expect(isProtected("/dashboard/insights")).toBe(true);
    });

    it("marks /admin as protected", () => {
      expect(isProtected("/admin")).toBe(true);
      expect(isProtected("/admin/beta")).toBe(true);
    });

    it("marks all main app routes as protected", () => {
      const routes = [
        "/score", "/content", "/hooks", "/settings",
        "/onboarding", "/creator-score", "/ai-insights",
        "/growth", "/competitors", "/reports",
      ];
      for (const r of routes) {
        expect(isProtected(r)).toBe(true);
      }
    });

    it("does not protect public routes", () => {
      expect(isProtected("/login")).toBe(false);
      expect(isProtected("/register")).toBe(false);
      expect(isProtected("/beta")).toBe(false);
      expect(isProtected("/")).toBe(false);
    });
  });

  describe("isGuestOnly", () => {
    it("marks /login and /register as guest-only", () => {
      expect(isGuestOnly("/login")).toBe(true);
      expect(isGuestOnly("/register")).toBe(true);
    });

    it("does not mark protected routes as guest-only", () => {
      expect(isGuestOnly("/dashboard")).toBe(false);
      expect(isGuestOnly("/admin")).toBe(false);
    });
  });

  describe("getRequiredRole", () => {
    it("requires admin role for /admin routes", () => {
      const rule = getRequiredRole("/admin");
      expect(rule).not.toBeNull();
      expect(rule!.role).toBe("admin");
      expect(rule!.redirect).toBe("/dashboard");
    });

    it("requires admin role for /admin/beta", () => {
      const rule = getRequiredRole("/admin/beta");
      expect(rule).not.toBeNull();
      expect(rule!.role).toBe("admin");
    });

    it("returns null for non-role-restricted routes", () => {
      expect(getRequiredRole("/dashboard")).toBeNull();
      expect(getRequiredRole("/settings")).toBeNull();
      expect(getRequiredRole("/login")).toBeNull();
    });
  });

  describe("getHomeRedirect", () => {
    it("redirects admin to /admin", () => {
      expect(getHomeRedirect("admin")).toBe("/admin");
    });

    it("redirects non-admin to /dashboard", () => {
      expect(getHomeRedirect("free")).toBe("/dashboard");
      expect(getHomeRedirect("pro")).toBe("/dashboard");
    });
  });
});
