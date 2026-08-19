import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("server/supabase/client", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates a Supabase client with the configured environment variables", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "demo-key");

    const clientModule = await import("@/server/supabase/client");

    expect(clientModule.supabase).toBeDefined();
    expect(clientModule.getSupabaseClient()).toBe(clientModule.supabase);
  });

  it("throws when the Supabase environment variables are missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");

    await expect(import("@/server/supabase/client")).rejects.toThrow(
      "Supabase environment variables are missing",
    );
  });
});
