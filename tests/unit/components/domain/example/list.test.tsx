import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ExampleList from "@/components/domain/example/list";

vi.mock("@/actions/domain/example", () => ({
  create: vi.fn().mockResolvedValue({ id: "example-id", name: "Untitled" }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("ExampleList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no examples provided", () => {
    const examples: {
      id: string;
      name: string;
      internalImageKey: string | null;
      internalImageUrl: string | null;
      externalImageKey: string | null;
      externalImageUrl: string | null;
    }[] = [];

    render(<ExampleList workspaceId="workspace-id" examples={examples} />);

    expect(screen.getByText("Create one to get started.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("renders list of examples", () => {
    const examples = [
      {
        id: "example-1-id",
        name: "Test Example 1",
        internalImageKey: null,
        internalImageUrl: null,
        externalImageKey: null,
        externalImageUrl: null,
      },
      {
        id: "example-2-id",
        name: "Test Example 2",
        internalImageKey: null,
        internalImageUrl: null,
        externalImageKey: null,
        externalImageUrl: null,
      },
    ];

    render(<ExampleList workspaceId="workspace-id" examples={examples} />);

    expect(screen.getByText("Test Example 1")).toBeInTheDocument();
    expect(screen.getByText("Test Example 2")).toBeInTheDocument();
    expect(
      screen.queryByText("Create one to get started."),
    ).not.toBeInTheDocument();
  });

  it("renders links to example detail pages", () => {
    const examples = [
      {
        id: "example-id",
        name: "Test Example",
        internalImageKey: null,
        internalImageUrl: null,
        externalImageKey: null,
        externalImageUrl: null,
      },
    ];

    render(<ExampleList workspaceId="workspace-id" examples={examples} />);

    const link = screen.getByRole("link", { name: "Test Example" });
    expect(link).toHaveAttribute(
      "href",
      "/workspaces/workspace-id/examples/example-id",
    );
  });

  it("calls create action when Create button is clicked", async () => {
    const user = userEvent.setup();
    const { create } = await import("@/actions/domain/example");
    const examples: {
      id: string;
      name: string;
      internalImageKey: string | null;
      internalImageUrl: string | null;
      externalImageKey: string | null;
      externalImageUrl: string | null;
    }[] = [];

    render(<ExampleList workspaceId="workspace-id" examples={examples} />);

    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith({
        data: { name: "Untitled" },
      });
    });
  });
});
