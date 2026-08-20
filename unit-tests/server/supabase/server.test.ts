import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mockSet: vi.fn(),
  mockGetAll: vi.fn(() => [{ name: "sb-access-token", value: "abc" }]),
  mockCreateServerClient: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: mocks.mockGetAll,
    set: mocks.mockSet,
  })),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.mockCreateServerClient,
}));

import { createClient } from "@/server/supabase/server";

describe("server/supabase/server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockGetAll.mockReturnValue([{ name: "sb-access-token", value: "abc" }]);
    mocks.mockCreateServerClient.mockReturnValue({ client: true });
  });

  it("creates a server client from the env vars and the Next.js cookie store", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "demo-key");

    const client = await createClient();

    expect(mocks.mockCreateServerClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "demo-key",
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      }),
    );
    expect(client).toEqual({ client: true });
  });

  it("handles cookie writes gracefully when the server component cannot write cookies", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "demo-key");

    mocks.mockCreateServerClient.mockImplementation((_, __, config) => {
      expect(() => config.cookies.setAll([{ name: "token", value: "abc", options: { path: "/" } }])).not.toThrow();
      return { client: true };
    });

    const client = await createClient();

    expect(client).toEqual({ client: true });
  });
});
