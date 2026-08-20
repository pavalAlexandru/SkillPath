import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  const mockGetUser = vi.fn();
  const mockSignInWithPassword = vi.fn();
  const mockSignOut = vi.fn();
  const mockMaybeSingle = vi.fn();
  const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockSupabase = {
    auth: {
      getSession: mockGetSession,
      getUser: mockGetUser,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
    from: vi.fn(() => ({ select: mockSelect })),
  };

  return {
    mockGetSession,
    mockGetUser,
    mockSignInWithPassword,
    mockSignOut,
    mockMaybeSingle,
    mockEq,
    mockSelect,
    mockSupabase,
  };
});

vi.mock("@/server/supabase/client", () => ({
  supabase: mocks.mockSupabase,
}));

import {
  getSession,
  getUser,
  getUserRole,
  normalizeAppRole,
  signInWithEmail,
  signOut,
} from "@/server/supabase/auth";

describe("server/supabase/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockMaybeSingle.mockReset();
    mocks.mockGetSession.mockResolvedValue({ data: { session: { access_token: "token" } }, error: null });
    mocks.mockGetUser.mockResolvedValue({ data: { user: { id: "user-123" } }, error: null });
    mocks.mockSignInWithPassword.mockResolvedValue({ data: { user: { id: "user-123" } }, error: null });
    mocks.mockSignOut.mockResolvedValue({ error: null });
    mocks.mockMaybeSingle.mockResolvedValue({ data: { role: "Student" }, error: null });
  });

  it("gets the current session", async () => {
    const session = await getSession();

    expect(mocks.mockGetSession).toHaveBeenCalledTimes(1);
    expect(session).toEqual({ access_token: "token" });
  });

  it("gets the current user", async () => {
    const user = await getUser();

    expect(mocks.mockGetUser).toHaveBeenCalledTimes(1);
    expect(user).toEqual({ id: "user-123" });
  });

  it("normalizes student and mentor roles", () => {
    expect(normalizeAppRole("Student")).toBe("STUDENT");
    expect(normalizeAppRole("Mentor")).toBe("MENTOR");
    expect(normalizeAppRole("ADMIN")).toBeNull();
  });

  it("returns a user role from the profiles table", async () => {
    const role = await getUserRole("user-123");

    expect(mocks.mockSupabase.from).toHaveBeenCalledWith("profiles");
    expect(mocks.mockSelect).toHaveBeenCalledWith("role");
    expect(mocks.mockEq).toHaveBeenCalledWith("id", "user-123");
    expect(role).toBe("STUDENT");
  });

  it("signs a user in with email and password", async () => {
    const result = await signInWithEmail("student@skillpath.ro", "password123");

    expect(mocks.mockSignInWithPassword).toHaveBeenCalledWith({
      email: "student@skillpath.ro",
      password: "password123",
    });
    expect(result).toEqual({ user: { id: "user-123" } });
  });

  it("signs a user out", async () => {
    await signOut();

    expect(mocks.mockSignOut).toHaveBeenCalledTimes(1);
  });
});
