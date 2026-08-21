import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { useRouter } from "next/navigation";
import { signOut } from "@/server/supabase/auth";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/server/supabase/auth", () => ({
  signOut: vi.fn(),
}));

describe("LogoutButton", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

  it("renders the logout button", () => {
    render(<LogoutButton />);
    expect(screen.getByRole("button", { name: "Deconectare" })).toBeInTheDocument();
  });

  it("calls signOut and redirects to login on click", async () => {
    (signOut as any).mockResolvedValue();

    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: "Deconectare" }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("logs error to console if signOut fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockError = new Error("Failed to sign out");
    (signOut as any).mockRejectedValue(mockError);

    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: "Deconectare" }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Logout error", mockError);
      expect(mockPush).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
