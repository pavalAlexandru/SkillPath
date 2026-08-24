import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy, normalizeAppRole } from "@/proxy";
import { createServerClient } from "@supabase/ssr";

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

describe("middleware role normalization", () => {
  it("normalizes Student and Mentor values for route checks", () => {
    expect(normalizeAppRole("student")).toBe("STUDENT");
    expect(normalizeAppRole("STUDENT")).toBe("STUDENT");
    expect(normalizeAppRole("mentor")).toBe("MENTOR");
    expect(normalizeAppRole("MENTOR")).toBe("MENTOR");
    expect(normalizeAppRole("admin")).toBeNull();
    expect(normalizeAppRole(undefined)).toBeNull();
  });
});

describe("middleware", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error - overriding for test
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    // @ts-expect-error - restoring original
    process.env.NODE_ENV = originalEnv;
  });

  function createMockSupabase(user: { id: string } | null, role: string | null, completedCount = 1) {
    return {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user },
        }),
      },
      from: vi.fn((table: string) => {
        const chain: Record<string, unknown> = {};
        chain.select = vi.fn().mockReturnValue(chain);
        chain.eq = vi.fn().mockReturnValue(chain);
        chain.maybeSingle = vi.fn().mockResolvedValue({
          data: role ? { role } : null,
        });
        // Suport pentru interogarea cu { count } pe tabela assessments
        chain.then = (resolve: (val: { count: number; error: null }) => void) =>
            resolve({ count: completedCount, error: null });

        return chain;
      }),
    };
  }

  it("redirects unauthenticated users away from protected student routes", async () => {
    const mockSupabase = createMockSupabase(null, null);
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const req = new NextRequest("http://localhost:3000/dashboard");
    const res = await proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("allows authenticated student users to access student routes if onboarding is completed", async () => {
    const mockSupabase = createMockSupabase({ id: "student-id" }, "STUDENT", 1);
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const req = new NextRequest("http://localhost:3000/dashboard");
    const res = await proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects students away from mentor routes", async () => {
    const mockSupabase = createMockSupabase({ id: "student-id" }, "STUDENT", 1);
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const req = new NextRequest("http://localhost:3000/questions");
    const res = await proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("allows authenticated mentor users to access mentor routes", async () => {
    const mockSupabase = createMockSupabase({ id: "mentor-id" }, "MENTOR");
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const req = new NextRequest("http://localhost:3000/questions");
    const res = await proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects users with missing roles away from protected routes", async () => {
    const mockSupabase = createMockSupabase({ id: "user-id" }, null);
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const req = new NextRequest("http://localhost:3000/dashboard");
    const res = await proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("leaves public routes untouched", async () => {
    const mockSupabase = createMockSupabase(null, null);
    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const req = new NextRequest("http://localhost:3000/login");
    const res = await proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("executes the cookie update callback from the Supabase middleware config", async () => {
    let capturedCookieConfig: any = null;

    vi.mocked(createServerClient).mockImplementation((_url, _key, options) => {
      capturedCookieConfig = options.cookies;
      return createMockSupabase({ id: "student-id" }, "STUDENT", 1) as unknown as ReturnType<typeof createServerClient>;
    });

    const req = new NextRequest("http://localhost:3000/dashboard");
    await proxy(req);

    expect(capturedCookieConfig).toBeDefined();

    capturedCookieConfig.setAll([
      { name: "test-cookie", value: "123", options: { path: "/" } },
    ]);
  });
});