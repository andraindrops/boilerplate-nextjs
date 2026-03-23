import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ExampleForm from "@/components/domain/example/form";

const mockUpdate = vi.fn().mockResolvedValue({
  id: "example-id",
  name: "Updated Test Example",
  internalImageKey: null,
  externalImageKey: null,
});
const mockRemove = vi.fn().mockResolvedValue({
  id: "example-id",
  name: "Test Example",
  internalImageKey: null,
  externalImageKey: null,
});

vi.mock("@/actions/domain/example", () => ({
  update: (...args: unknown[]) => mockUpdate(...args),
  remove: (...args: unknown[]) => mockRemove(...args),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

describe("ExampleForm", () => {
  const defaultExample = {
    id: "example-id",
    name: "Test Example",
    internalImageKey: null,
    internalImageUrl: null,
    externalImageKey: null,
    externalImageUrl: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with example data", () => {
    const example = defaultExample;

    render(<ExampleForm workspaceId="workspace-id" example={example} />);

    expect(screen.getByRole("textbox")).toHaveValue("Test Example");
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("updates input value when user types", async () => {
    const user = userEvent.setup();
    const example = defaultExample;

    render(<ExampleForm workspaceId="workspace-id" example={example} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Updated Test Example");

    expect(input).toHaveValue("Updated Test Example");
  });

  it("calls update action when Submit button is clicked", async () => {
    const user = userEvent.setup();
    const example = defaultExample;

    render(<ExampleForm workspaceId="workspace-id" example={example} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Updated Test Example");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        id: "example-id",
        data: {
          name: "Updated Test Example",
          internalImageKey: null,
          externalImageKey: null,
        },
      });
    });
  });

  it("calls remove action when Remove button is clicked", async () => {
    const user = userEvent.setup();
    const example = defaultExample;

    render(<ExampleForm workspaceId="workspace-id" example={example} />);

    await user.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith({
        id: "example-id",
      });
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        "/workspaces/workspace-id/examples",
      );
    });
  });

  it("shows validation error", async () => {
    const user = userEvent.setup();
    const example = defaultExample;

    render(<ExampleForm workspaceId="workspace-id" example={example} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
