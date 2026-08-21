import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  proposeQuestionActionMock: vi.fn(),
}));

vi.mock("@/server/actions/proposals", () => ({
  proposeQuestionAction: mocks.proposeQuestionActionMock,
}));

import ProposeForm from "@/components/student/ProposeForm";
import type { CategoryRow } from "@/types/assesments";

const mockCategories: CategoryRow[] = [
  { id: 1, name: "OOP Basics", description: "OOP", level: "JUNIOR", is_active: true, created_at: "", updated_at: "" },
  { id: 2, name: "Git", description: "Git concepts", level: "JUNIOR", is_active: true, created_at: "", updated_at: "" },
];

describe("ProposeForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the propose form", () => {
    render(<ProposeForm categories={mockCategories} />);

    expect(screen.getByText("Categorie")).toBeDefined();
    expect(screen.getByText("Dificultate")).toBeDefined();
    expect(screen.getByText("Tip întrebare")).toBeDefined();
    expect(screen.getByText("Enunțul Întrebării")).toBeDefined();
    
    // Default 4 options
    expect(screen.getByPlaceholderText("Opțiunea 1")).toBeDefined();
    expect(screen.getByPlaceholderText("Opțiunea 2")).toBeDefined();
    expect(screen.getByPlaceholderText("Opțiunea 3")).toBeDefined();
    expect(screen.getByPlaceholderText("Opțiunea 4")).toBeDefined();
  });

  it("shows success message on successful submission", async () => {
    mocks.proposeQuestionActionMock.mockResolvedValue({ success: true });

    render(<ProposeForm categories={mockCategories} />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Scrie textul întrebării..."), { target: { value: "Ce este polimorfismul?" } });
    
    const options = [
      screen.getByPlaceholderText("Opțiunea 1"),
      screen.getByPlaceholderText("Opțiunea 2"),
      screen.getByPlaceholderText("Opțiunea 3"),
      screen.getByPlaceholderText("Opțiunea 4")
    ];

    fireEvent.change(options[0], { target: { value: "Răspuns 1" } });
    fireEvent.change(options[1], { target: { value: "Răspuns 2" } });
    fireEvent.change(options[2], { target: { value: "Răspuns 3" } });
    fireEvent.change(options[3], { target: { value: "Răspuns 4" } });

    fireEvent.click(screen.getByRole("button", { name: /trimite spre aprobare/i }));

    await waitFor(() => {
      expect(mocks.proposeQuestionActionMock).toHaveBeenCalled();
      expect(screen.getByText("Întrebarea a fost propusă cu succes și așteaptă aprobarea!")).toBeDefined();
    });
  });

  it("shows error message on failed submission", async () => {
    mocks.proposeQuestionActionMock.mockResolvedValue({ error: "Zod validation failed" });

    render(<ProposeForm categories={mockCategories} />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Scrie textul întrebării..."), { target: { value: "Q" } });
    
    const options = [
      screen.getByPlaceholderText("Opțiunea 1"),
      screen.getByPlaceholderText("Opțiunea 2"),
      screen.getByPlaceholderText("Opțiunea 3"),
      screen.getByPlaceholderText("Opțiunea 4")
    ];

    fireEvent.change(options[0], { target: { value: "Răspuns 1" } });
    fireEvent.change(options[1], { target: { value: "Răspuns 2" } });
    fireEvent.change(options[2], { target: { value: "Răspuns 3" } });
    fireEvent.change(options[3], { target: { value: "Răspuns 4" } });
    
    // Using fireEvent.submit on the form directly to bypass HTML5 validation issues in jsdom if any, or just click.
    fireEvent.click(screen.getByRole("button", { name: /trimite spre aprobare/i }));

    await waitFor(() => {
      expect(mocks.proposeQuestionActionMock).toHaveBeenCalled();
      expect(screen.getByText("Zod validation failed")).toBeDefined();
    });
  });
});
