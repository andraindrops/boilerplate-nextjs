import { describe, expect, it, vi } from "vitest";

const mockUploadImage = vi.fn();
vi.mock("@/actions/shared/storage", () => ({
  uploadImage: (...args: unknown[]) => mockUploadImage(...args),
}));

import { uploadImage } from "@/lib/storage/client";

describe("storageClient.uploadImage", () => {
  it("builds FormData from named parameters and calls server action", async () => {
    mockUploadImage.mockResolvedValue(
      "workspaces/workspace-id/example-external/abc.png",
    );

    const file = new File(["dummy"], "photo.png", { type: "image/png" });

    const result = await uploadImage({
      workspaceId: "workspace-id",
      file,
      prefix: "example-external",
    });

    expect(mockUploadImage).toHaveBeenCalledTimes(1);

    const formData = mockUploadImage.mock.calls[0][0] as FormData;

    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("file")).toBe(file);
    expect(formData.get("prefix")).toBe("example-external");
    expect(formData.get("workspaceId")).toBe("workspace-id");
    expect(result).toBe("workspaces/workspace-id/example-external/abc.png");
  });
});
