import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TaskList from "@/components/domain/task/list";

vi.mock("@/actions/domain/task", () => ({
  create: vi.fn().mockResolvedValue({
    id: "task-id",
    name: "Untitled",
    content: "Untitled content",
  }),
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

describe("TaskList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no tasks provided", () => {
    const tasks: {
      id: string;
      name: string;
      content: string;
    }[] = [];

    render(<TaskList workspaceId="workspace-id" tasks={tasks} />);

    expect(screen.getByText("Create one to get started.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("renders list of tasks", () => {
    const tasks = [
      {
        id: "task-1-id",
        name: "Test Task 1",
        content: "Task Content 1",
      },
      {
        id: "task-2-id",
        name: "Test Task 2",
        content: "Task Content 2",
      },
    ];

    render(<TaskList workspaceId="workspace-id" tasks={tasks} />);

    expect(screen.getByText("Test Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task Content 1")).toBeInTheDocument();
    expect(screen.getByText("Test Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task Content 2")).toBeInTheDocument();
    expect(
      screen.queryByText("Create one to get started."),
    ).not.toBeInTheDocument();
  });

  it("renders links to task detail pages", () => {
    const tasks = [
      {
        id: "task-id",
        name: "Test Task",
        content: "Task Content",
      },
    ];

    render(<TaskList workspaceId="workspace-id" tasks={tasks} />);

    const link = screen.getByRole("link", { name: "Test Task Task Content" });
    expect(link).toHaveAttribute(
      "href",
      "/workspaces/workspace-id/tasks/task-id",
    );
  });

  it("calls create action when Create button is clicked", async () => {
    const user = userEvent.setup();
    const { create } = await import("@/actions/domain/task");
    const tasks: {
      id: string;
      name: string;
      content: string;
    }[] = [];

    render(<TaskList workspaceId="workspace-id" tasks={tasks} />);

    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith({
        data: { name: "Untitled", content: "Untitled content" },
      });
    });
  });
});
