import { describe, it, expect } from "vitest";
import { z } from "zod";

// Mirror the password schema from auth.ts to test independently
const PASSWORD_MIN = 8;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).+$/;

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Le mot de passe doit contenir au moins ${PASSWORD_MIN} caractères.`)
  .refine((pw) => PASSWORD_REGEX.test(pw), {
    message: "Le mot de passe doit contenir au moins une lettre et un chiffre.",
  });

describe("password-validation", () => {
  it("rejects passwords shorter than 8 characters", () => {
    const result = passwordSchema.safeParse("abc1");
    expect(result.success).toBe(false);
  });

  it("rejects passwords with only letters", () => {
    const result = passwordSchema.safeParse("abcdefgh");
    expect(result.success).toBe(false);
  });

  it("rejects passwords with only numbers", () => {
    const result = passwordSchema.safeParse("12345678");
    expect(result.success).toBe(false);
  });

  it("accepts valid password with letters and numbers", () => {
    const result = passwordSchema.safeParse("monpass1");
    expect(result.success).toBe(true);
  });

  it("accepts strong password", () => {
    const result = passwordSchema.safeParse("MyStr0ngP@ss!");
    expect(result.success).toBe(true);
  });

  it("rejects empty string", () => {
    const result = passwordSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("accepts exactly 8 characters with letter and number", () => {
    const result = passwordSchema.safeParse("abcdefg1");
    expect(result.success).toBe(true);
  });
});
