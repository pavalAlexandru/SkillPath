import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fromMock: vi.fn(),
  selectMock: vi.fn(),
  eqMock: vi.fn(),
  singleMock: vi.fn(),
  inMock: vi.fn(),
  getUserMock: vi.fn(),
}));

vi.mock("@/server/supabase/server", () => ({
  createClient: () => ({
    from: mocks.fromMock,
    auth: { getUser: mocks.getUserMock },
  }),
}));

import ProposeQuestionPage from "@/app/(student)/propose/page";

describe("app/(student)/propose/page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mocks.fromMock.mockReturnValue({ select: mocks.selectMock });
    mocks.selectMock.mockReturnValue({ eq: mocks.eqMock });
    mocks.eqMock.mockReturnValue({ single: mocks.singleMock, in: mocks.inMock });
  });

  it("renders the page and passes categories to the form", async () => {
    mocks.getUserMock.mockResolvedValue({ data: { user: { id: "user1" } } });
    mocks.singleMock.mockResolvedValue({ data: { current_level: "JUNIOR" } });

    const mockCategories = [
      { id: 1, name: "OOP Basics" },
      { id: 2, name: "SQL" }
    ];
    mocks.inMock.mockResolvedValue({ data: mockCategories });

    // Since ProposeQuestionPage is an async Server Component, we need to await it
    const PageComponent = await ProposeQuestionPage();
    render(PageComponent);

    expect(screen.getByText("Propune o Întrebare")).toBeDefined();
    // Verify categories are passed by checking the DOM
    expect(screen.getByText("OOP Basics")).toBeDefined();
    expect(screen.getByText("SQL")).toBeDefined();
  });
});
