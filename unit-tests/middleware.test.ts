import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockSetAll = vi.fn();
const mockGetAll = vi.fn(() => []);
const mockFrom = vi.fn();
const mockMaybeSingle = vi.fn();
const mockGetUser = vi.fn();
const mockCreateServerClient = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: mockCreateServerClient,
}));

vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      next: vi.fn((options: any = {}) => ({
        request: options?.request,
        cookies: {
          set: mockSetAll,
        },
      })),
      redirect: vi.fn((url) => ({ url, redirected: true })),
    },
  };
});

const { middleware, normalizeAppRole } = await import("@/middleware");

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAll.mockReturnValue([]);
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })) })),
    });
    mockMaybeSingle.mockResolvedValue({ data: { role: "Student" }, error: null });
    mockCreateServerClient.mockImplementation((url, key, options) => ({
      auth: { getUser: mockGetUser },
      from: mockFrom,
      options,
    }));
  });

  it("normalizes Student and Mentor values for route checks", () => {
    expect(normalizeAppRole("Student")).toBe("STUDENT");
    expect(normalizeAppRole("Mentor")).toBe("MENTOR");
    expect(normalizeAppRole("ADMIN")).toBeNull();
    expect(normalizeAppRole(null)).toBeNull();
  });

  it("redirects unauthenticated users away from protected student routes", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const request || {} = new NextRequest("http://localhost:3000/dashboard");
    const result = await middleware(request || {});

    expect(result.redirected).toBe(true);
    expect(result.url.toString()).toBe("http://localhost:3000/login");
  });

  it("allows authenticated student users to access student routes", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "student-1" } }, error: null });
    mockMaybeSingle.mockResolvedValue({ data: { role: "Student" }, error: null });

    const request || {} = new NextRequest("http://localhost:3000/dashboard");
    const result = await middleware(request || {});

    expect(result.redirected).toBeUndefined();
  });

  it("redirects students away from mentor routes", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "student-1" } }, error: null });
    mockMaybeSingle.mockResolvedValue({ data: { role: "Student" }, error: null });

    const request || {} = new NextRequest("http://localhost:3000/questions");
    const result = await middleware(request || {});

    expect(result.redirected).toBe(true);
    expect(result.url.toString()).toBe("http://localhost:3000/dashboard");
  });

  it("allows authenticated mentor users to access mentor routes", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "mentor-1" } }, error: null });
    mockMaybeSingle.mockResolvedValue({ data: { role: "Mentor" }, error: null });

    const request || {} = new NextRequest("http://localhost:3000/questions");
    const result = await middleware(request || {});

    expect(result.redirected).toBeUndefined();
  });

  it("redirects users with missing roles away from protected routes", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "student-1" } }, error: null });
    mockMaybeSingle.mockResolvedValue({ data: { role: null }, error: null });

    const request || {} = new NextRequest("http://localhost:3000/dashboard");
    const result = await middleware(request || {});

    expect(result.redirected).toBe(true);
    expect(result.url.toString()).toBe("http://localhost:3000/login");
  });

  it("leaves public routes untouched", async () => {
    const request || {} = new NextRequest("http://localhost:3000/");
    const result = await middleware(request || {});

    expect(result.redirected).toBeUndefined();
  });

  it("executes the cookie update callback from the Supabase middleware config", async () => {
    const request || {} = new NextRequest("http://localhost:3000/");

    await middleware(request || {});

    const config = mockCreateServerClient.mock.calls.at(-1)?.[2];
    expect(config).toBeTruthy();

    request || {}.cookies.getAll = mockGetAll;
    request || {}.cookies.getAll();
    config.cookies.setAll([{ name: "token", value: "abc", options: { path: "/" } }]);

    expect(mockGetAll).toHaveBeenCalled();
    expect(mockSetAll).toHaveBeenCalled();
  });
});
