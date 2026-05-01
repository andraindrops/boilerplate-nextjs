import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TaskForm from "@/components/domain/task/form";

const mockUpdate = vi.fn().mockResolvedValue({
  id: "task-id",
  name: "Updated Test Task",
  content: "Updated Task Content",
});
const mockRemove = vi.fn().mockResolvedValue({
  id: "task-id",
  name: "Test Task",
  content: "Test Task Content",
});
const mockRun = vi.fn().mockResolvedValue(undefined);

vi.mock("@/actions/domain/task", () => ({
  update: (...args: unknown[]) => mockUpdate(...args),
  remove: (...args: unknown[]) => mockRemove(...args),
  run: (...args: unknown[]) => mockRun(...args),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

describe("TaskForm", () => {
  const defaultTask = {
    id: "task-id",
    name: "Test Task",
    content: "Test Task Content",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with task data", () => {
    const task = defaultTask;

    render(<TaskForm workspaceId="workspace-id" task={task} />);

    expect(screen.getByTestId("task-name-input")).toHaveValue("Test Task");
    expect(screen.getByTestId("task-content-input")).toHaveValue(
      "Test Task Content",
    );
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run" })).toBeInTheDocument();
  });

  it("updates input value when user types", async () => {
    const user = userEvent.setup();
    const task = defaultTask;

    render(<TaskForm workspaceId="workspace-id" task={task} />);

    const nameInput = screen.getByTestId("task-name-input");
    const contentInput = screen.getByTestId("task-content-input");

    await user.clear(nameInput);
    await user.type(nameInput, "Updated Test Task");
    await user.clear(contentInput);
    await user.type(contentInput, "Updated Task Content");

    expect(nameInput).toHaveValue("Updated Test Task");
    expect(contentInput).toHaveValue("Updated Task Content");
  });

  it("calls update action when Submit button is clicked", async () => {
    const user = userEvent.setup();
    const task = defaultTask;

    render(<TaskForm workspaceId="workspace-id" task={task} />);

    const nameInput = screen.getByTestId("task-name-input");
    const contentInput = screen.getByTestId("task-content-input");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Test Task");
    await user.clear(contentInput);
    await user.type(contentInput, "Updated Task Content");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        id: "task-id",
        data: {
          name: "Updated Test Task",
          content: "Updated Task Content",
        },
      });
    });
  });

  it("calls remove action when Remove button is clicked", async () => {
    const user = userEvent.setup();
    const task = defaultTask;

    render(<TaskForm workspaceId="workspace-id" task={task} />);

    await user.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith({
        id: "task-id",
      });
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/workspaces/workspace-id/tasks");
    });
  });

  it("shows validation error", async () => {
    const user = userEvent.setup();
    const task = defaultTask;

    render(<TaskForm workspaceId="workspace-id" task={task} />);

    const nameInput = screen.getByTestId("task-name-input");
    const contentInput = screen.getByTestId("task-content-input");
    await user.clear(nameInput);
    await user.clear(contentInput);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  it("calls run action when Run button is clicked", async () => {
    const user = userEvent.setup();
    const task = defaultTask;

    render(<TaskForm workspaceId="workspace-id" task={task} />);

    await user.click(screen.getByRole("button", { name: "Run" }));

    await waitFor(() => {
      expect(mockRun).toHaveBeenCalledWith({
        id: "task-id",
      });
    });
  });
});
