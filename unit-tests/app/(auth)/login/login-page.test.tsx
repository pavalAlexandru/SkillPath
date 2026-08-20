import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  pushMock: vi.fn(),
  signInWithEmailMock: vi.fn(),
  getUserRoleMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.pushMock }),
}));

vi.mock("@/server/supabase/auth", () => ({
  signInWithEmail: mocks.signInWithEmailMock,
  getUserRole: mocks.getUserRoleMock,
}));

import LoginPage from "@/app/(auth)/login/page";

describe("app/(auth)/login/page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: /autentificare skillpath/i })).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/parolă/i)).toBeDefined();
  });

  it("redirects a student user to the dashboard after a successful login", async () => {
    mocks.signInWithEmailMock.mockResolvedValue({ user: { id: "student-1" } });
    mocks.getUserRoleMock.mockResolvedValue("STUDENT");

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "student@skillpath.ro" },
    });
    fireEvent.change(screen.getByLabelText(/parolă/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /conectare/i }));

    await waitFor(() => {
      expect(mocks.signInWithEmailMock).toHaveBeenCalledWith("student@skillpath.ro", "secret123");
      expect(mocks.getUserRoleMock).toHaveBeenCalledWith("student-1");
      expect(mocks.pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("redirects a mentor user to the mentor questions page after a successful login", async () => {
    mocks.signInWithEmailMock.mockResolvedValue({ user: { id: "mentor-1" } });
    mocks.getUserRoleMock.mockResolvedValue("MENTOR");

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "mentor@skillpath.ro" } });
    fireEvent.change(screen.getByLabelText(/parolă/i), { target: { value: "mentor-pass" } });
    fireEvent.click(screen.getByRole("button", { name: /conectare/i }));

    await waitFor(() => {
      expect(mocks.pushMock).toHaveBeenCalledWith("/questions");
    });
  });

  it("shows an error message when the user role is unsupported", async () => {
    mocks.signInWithEmailMock.mockResolvedValue({ user: { id: "unknown-user" } });
    mocks.getUserRoleMock.mockResolvedValue(null);

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByLabelText(/parolă/i), { target: { value: "pass" } });
    fireEvent.click(screen.getByRole("button", { name: /conectare/i }));

    await waitFor(() => {
      expect(screen.getByText(/rol necunoscut/i)).toBeDefined();
    });
  });

  it("shows an authentication error message when sign-in fails", async () => {
    mocks.signInWithEmailMock.mockRejectedValue(new Error("Email sau parolă invalidă"));

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "bad@user.com" } });
    fireEvent.change(screen.getByLabelText(/parolă/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /conectare/i }));

    await waitFor(() => {
      expect(screen.getByText(/email sau parolă invalidă/i)).toBeDefined();
    });
  });
});
