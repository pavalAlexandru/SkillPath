import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import LoginPage from "@/app/(auth)/login/page";
import { useRouter } from "next/navigation";
import { signInWithEmail, signUpWithEmail, getUserRole } from "@/server/supabase/auth";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/server/supabase/auth", () => ({
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  getUserRole: vi.fn(),
}));

describe("LoginPage", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

  it("renders the login form initially", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: "Autentificare Skillpath" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Parolă")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Conectare" })).toBeInTheDocument();
  });

  it("toggles to sign up form when 'Înregistrare' is clicked", () => {
    render(<LoginPage />);
    const signUpToggleBtn = screen.getByRole("button", { name: "Înregistrare" });
    fireEvent.click(signUpToggleBtn);

    expect(screen.getByRole("heading", { name: "Creare cont Skillpath" })).toBeInTheDocument();
    expect(screen.getByLabelText("Prenume")).toBeInTheDocument();
    expect(screen.getByLabelText("Nume")).toBeInTheDocument();
  });

  it("handles login submission successfully", async () => {
    (signInWithEmail as any).mockResolvedValue({ user: { id: "123" } });
    (getUserRole as any).mockResolvedValue("STUDENT");

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText("Parolă"), { target: { value: "password123" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Conectare" }));

    await waitFor(() => {
      expect(signInWithEmail).toHaveBeenCalledWith("test@example.com", "password123");
      expect(getUserRole).toHaveBeenCalledWith("123");
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles sign up submission successfully and sanitizes email", async () => {
    (signUpWithEmail as any).mockResolvedValue({ user: { id: "456" } });

    render(<LoginPage />);
    
    // Switch to sign up mode
    fireEvent.click(screen.getByRole("button", { name: "Înregistrare" }));
    
    fireEvent.change(screen.getByLabelText("Prenume"), { target: { value: "Bob" } });
    fireEvent.change(screen.getByLabelText("Nume"), { target: { value: "Popescu" } });
    // Email without domain + with quotes to test sanitization
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: '"bob"' } });
    fireEvent.change(screen.getByLabelText("Parolă"), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: "Înregistrare" }));

    await waitFor(() => {
      // should append @example.com and remove quotes
      expect(signUpWithEmail).toHaveBeenCalledWith(
        "bob@example.com",
        "password123",
        "Bob",
        "Popescu",
        "STUDENT"
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("displays error message on sign up failure", async () => {
    (signUpWithEmail as any).mockRejectedValue(new Error("Eroare custom signup"));

    render(<LoginPage />);
    
    fireEvent.click(screen.getByRole("button", { name: "Înregistrare" }));
    fireEvent.change(screen.getByLabelText("Prenume"), { target: { value: "Bob" } });
    fireEvent.change(screen.getByLabelText("Nume"), { target: { value: "Popescu" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "bob@example.com" } });
    fireEvent.change(screen.getByLabelText("Parolă"), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: "Înregistrare" }));

    await waitFor(() => {
      expect(screen.getByText("Eroare custom signup")).toBeInTheDocument();
    });
  });
});
