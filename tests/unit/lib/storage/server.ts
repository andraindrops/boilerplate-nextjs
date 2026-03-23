import { describe, expect, it, vi } from "vitest";

const mockGet = vi.fn();
const mockPut = vi.fn();
vi.mock("@vercel/blob", () => ({
  get: (...args: unknown[]) => mockGet(...args),
  put: (...args: unknown[]) => mockPut(...args),
}));

vi.mock("uuid", () => ({
  v4: () => "example-id",
}));

import {
  generateKey,
  getBlob,
  getUrl,
  uploadBuffer,
} from "@/lib/storage/server";

const storageTypes = [
  { key: "example-external", type: "external" as const },
  { key: "example-internal", type: "internal" as const },
];

describe("storageServer", () => {
  describe("getUrl", () => {
    it("returns full URL for external key", () => {
      const key = "teams/team/example-external/test.png";
      process.env.EXTERNAL_BLOB_BASE_URL = "https://example.com";

      const result = getUrl({ storageTypes, key });

      expect(result).toBe(
        "https://example.com/teams/team/example-external/test.png",
      );
    });

    it("returns API path for internal key", () => {
      const key = "teams/team/example-internal/test.png";

      const result = getUrl({ storageTypes, key });

      expect(result).toBe(`/api/blob?key=${encodeURIComponent(key)}`);
    });
  });

  describe("getBlob", () => {
    it("calls get with correct parameters for external key", async () => {
      const key = "teams/team/example-external/test.png";
      process.env.EXTERNAL_BLOB_READ_WRITE_TOKEN = "external-token";
      mockGet.mockResolvedValue({ url: key });

      const result = await getBlob({ storageTypes, key });

      expect(mockGet).toHaveBeenCalledWith(key, {
        access: "public",
        token: "external-token",
        ifNoneMatch: undefined,
      });
      expect(result).toEqual({ url: key });
    });

    it("calls get with correct parameters for internal key", async () => {
      const key = "teams/team/example-internal/test.png";
      process.env.INTERNAL_BLOB_READ_WRITE_TOKEN = "internal-token";
      mockGet.mockResolvedValue({ url: key });

      const result = await getBlob({ storageTypes, key });

      expect(mockGet).toHaveBeenCalledWith(key, {
        access: "private",
        token: "internal-token",
        ifNoneMatch: undefined,
      });
      expect(result).toEqual({ url: key });
    });

    it("passes ifNoneMatch when provided", async () => {
      const key = "teams/team/example-external/test.png";
      process.env.EXTERNAL_BLOB_READ_WRITE_TOKEN = "external-token";
      mockGet.mockResolvedValue({ url: key });

      await getBlob({ storageTypes, key, ifNoneMatch: "etag-value" });

      expect(mockGet).toHaveBeenCalledWith(key, {
        access: "public",
        token: "external-token",
        ifNoneMatch: "etag-value",
      });
    });
  });

  describe("generateKey", () => {
    it("generates key with default png extension", () => {
      const result = generateKey({
        workspaceId: "workspace-id",
        prefix: "example-external",
      });

      expect(result).toBe(
        "workspaces/workspace-id/example-external/example-id.png",
      );
    });

    it("generates key with extension from contentType", () => {
      const result = generateKey({
        workspaceId: "workspace-id",
        prefix: "example-external",
        contentType: "image/jpeg",
      });

      expect(result).toBe(
        "workspaces/workspace-id/example-external/example-id.jpg",
      );
    });
  });

  describe("uploadBuffer", () => {
    it("calls put with correct parameters for external key", async () => {
      const key = "teams/team/example-external/test.png";
      const body = Buffer.from("test");
      process.env.EXTERNAL_BLOB_READ_WRITE_TOKEN = "external-token";
      mockPut.mockResolvedValue({ url: key });

      await uploadBuffer({ storageTypes, key, body, contentType: "image/png" });

      expect(mockPut).toHaveBeenCalledWith(key, body, {
        access: "public",
        contentType: "image/png",
        addRandomSuffix: false,
        token: "external-token",
      });
    });

    it("calls put with correct parameters for internal key", async () => {
      const key = "teams/team/example-internal/test.png";
      const body = Buffer.from("test");
      process.env.INTERNAL_BLOB_READ_WRITE_TOKEN = "internal-token";
      mockPut.mockResolvedValue({ url: key });

      await uploadBuffer({ storageTypes, key, body, contentType: "image/png" });

      expect(mockPut).toHaveBeenCalledWith(key, body, {
        access: "private",
        contentType: "image/png",
        addRandomSuffix: false,
        token: "internal-token",
      });
    });

    it("throws error when token is missing", async () => {
      const key = "teams/team/example-external/test.png";
      const body = Buffer.from("test");
      delete process.env.EXTERNAL_BLOB_READ_WRITE_TOKEN;

      await expect(
        uploadBuffer({ storageTypes, key, body, contentType: "image/png" }),
      ).rejects.toThrow(
        "Missing environment variable: EXTERNAL_BLOB_READ_WRITE_TOKEN",
      );
    });
  });
});
