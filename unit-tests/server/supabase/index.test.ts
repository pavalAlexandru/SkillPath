import { describe, expect, it, vi } from "vitest";

describe("server/supabase/index", () => {
  it("re-exports the Supabase client and auth helpers", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "demo-key");
    vi.resetModules();

    const supabaseIndex = await import("@/server/supabase/index");

    expect(supabaseIndex).toHaveProperty("supabase");
    expect(supabaseIndex).toHaveProperty("getSupabaseClient");
    expect(supabaseIndex).toHaveProperty("getSession");
    expect(supabaseIndex).toHaveProperty("getUser");
    expect(supabaseIndex).toHaveProperty("signInWithEmail");
    expect(supabaseIndex).toHaveProperty("signOut");
  });
});
