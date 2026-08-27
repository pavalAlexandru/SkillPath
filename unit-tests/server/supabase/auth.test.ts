import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  const mockGetUser = vi.fn();
  const mockSignInWithPassword = vi.fn();
  const mockSignOut = vi.fn();
  const mockMaybeSingle = vi.fn();
  const mockSignUp = vi.fn();
  const mockUpsert = vi.fn();
  const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockSupabase = {
    auth: {
      getSession: mockGetSession,
      getUser: mockGetUser,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      signUp: mockSignUp,
    },
    from: vi.fn(() => ({ select: mockSelect, upsert: mockUpsert })),
  };

  return {
    mockGetSession,
    mockGetUser,
    mockSignInWithPassword,
    mockSignOut,
    mockMaybeSingle,
    mockEq,
    mockSelect,
    mockSignUp,
    mockUpsert,
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
  signUpWithEmail,
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

  it("signs up a new user successfully", async () => {
    mocks.mockSignUp.mockResolvedValue({ 
      data: { user: { id: "new-user-123", identities: [{}] } }, 
      error: null 
    });
    mocks.mockUpsert.mockResolvedValue({ error: null });

    const result = await signUpWithEmail("new@example.com", "pass123", "John", "Doe", "STUDENT");

    expect(mocks.mockSignUp).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "pass123",
      options: {
        data: {
          first_name: "John",
          last_name: "Doe",
          role: "STUDENT"
        }
      }
    });

    // Check profiles upsert
    expect(mocks.mockSupabase.from).toHaveBeenCalledWith("profiles");
    expect(mocks.mockUpsert).toHaveBeenCalledWith({
      id: "new-user-123",
      email: "new@example.com",
      first_name: "John",
      last_name: "Doe",
      role: "STUDENT"
    });

    // Check student_profiles upsert
    expect(mocks.mockSupabase.from).toHaveBeenCalledWith("student_profiles");
    expect(mocks.mockUpsert).toHaveBeenCalledWith({
      user_id: "new-user-123",
      current_level: "JUNIOR"
    });

    expect(result.user?.id).toBe("new-user-123");
  });

  it("throws error if signup returns an empty identities array (duplicate email)", async () => {
    mocks.mockSignUp.mockResolvedValue({ 
      data: { user: { id: "new-user-123", identities: [] } }, 
      error: null 
    });

    await expect(signUpWithEmail("dup@example.com", "pass123", "John", "Doe", "STUDENT")).rejects.toThrow("Un cont cu acest email există deja.");
  });

  it("throws error if profile creation fails", async () => {
    mocks.mockSignUp.mockResolvedValue({ 
      data: { user: { id: "new-user-123", identities: [{}] } }, 
      error: null 
    });
    mocks.mockUpsert.mockResolvedValueOnce({ error: new Error("Profile error") }); // for profiles

    await expect(signUpWithEmail("new@example.com", "pass123", "John", "Doe", "STUDENT")).rejects.toThrow("Profile error");
  });
  it("returns null if getUserRole encounters an error", async () => {
    mocks.mockMaybeSingle.mockResolvedValueOnce({ data: null, error: { message: "DB Error" } });
    
    const role = await getUserRole("user-123");
    expect(role).toBeNull();
  });

  it("throws error if student profile creation fails", async () => {
    mocks.mockSignUp.mockResolvedValue({ 
      data: { user: { id: "new-user-123", identities: [{}] } }, 
      error: null 
    });
    mocks.mockUpsert
      .mockResolvedValueOnce({ error: null }) // for profiles
      .mockResolvedValueOnce({ error: new Error("Student profile error") }); // for student_profiles

    await expect(signUpWithEmail("new@example.com", "pass123", "John", "Doe", "STUDENT")).rejects.toThrow("Student profile error");
  });

  it("returns null if normalizeAppRole receives non-string", () => {
    expect(normalizeAppRole(123)).toBeNull();
    expect(normalizeAppRole(null)).toBeNull();
    expect(normalizeAppRole({})).toBeNull();
  });
});
