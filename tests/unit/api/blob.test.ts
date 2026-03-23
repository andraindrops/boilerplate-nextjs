import { Readable } from "node:stream";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { AccessDeniedError } from "@/services/shared/scope";

import { GET } from "@/app/api/blob/route";

vi.mock("@/services/shared/auth", () => ({
  getTeamId: vi.fn().mockResolvedValue("team-123"),
}));

vi.mock("@/services/shared/storage", () => ({
  STORAGE_TYPES: [
    { key: "example-external", type: "external" },
    { key: "example-internal", type: "internal" },
  ],
  getBlob: vi.fn().mockResolvedValue({
    statusCode: 200,
    stream: new ReadableStream(),
    blob: { contentType: "image/png", etag: '"abc"' },
  }),
}));

const authService = await import("@/services/shared/auth");
const storageService = await import("@/services/shared/storage");

const INTERNAL_KEY = "teams/team-123/example-internal/test.png";
const EXTERNAL_KEY = "teams/team-123/example-external/test.png";

function createRequest(params?: { key?: string; ifNoneMatch?: string }) {
  const url = new URL("http://localhost/api/blob");

  if (params?.key != null) {
    url.searchParams.set("key", params.key);
  }

  const headers: Record<string, string> = {};

  if (params?.ifNoneMatch != null) {
    headers["if-none-match"] = params.ifNoneMatch;
  }

  return new NextRequest(url, { method: "GET", headers });
}

describe("GET /api/blob", () => {
  it("returns 400 when key param is missing", async () => {
    const response = await GET(createRequest());
    expect(response.status).toBe(400);
  });

  it("returns 400 when key is external", async () => {
    const response = await GET(createRequest({ key: EXTERNAL_KEY }));
    expect(response.status).toBe(400);
  });

  it("returns 401 when auth fails", async () => {
    vi.mocked(authService.getTeamId).mockRejectedValueOnce(
      new Error("Unauthorized"),
    );

    const response = await GET(createRequest({ key: INTERNAL_KEY }));
    expect(response.status).toBe(401);
  });

  it("returns 403 when workspace scope is denied", async () => {
    vi.mocked(storageService.getBlob).mockRejectedValueOnce(
      new AccessDeniedError(),
    );

    const response = await GET(createRequest({ key: INTERNAL_KEY }));
    expect(response.status).toBe(403);
  });

  it("returns 404 when blob is not found", async () => {
    vi.mocked(storageService.getBlob).mockResolvedValueOnce(
      null as unknown as Awaited<ReturnType<typeof storageService.getBlob>>,
    );

    const response = await GET(createRequest({ key: INTERNAL_KEY }));
    expect(response.status).toBe(404);
  });

  it("returns 304 when etag matches", async () => {
    vi.mocked(storageService.getBlob).mockResolvedValueOnce({
      statusCode: 304,
      blob: { etag: '"abc"' },
    } as Awaited<ReturnType<typeof storageService.getBlob>>);

    const response = await GET(
      createRequest({ key: INTERNAL_KEY, ifNoneMatch: '"abc"' }),
    );

    expect(response.status).toBe(304);
    expect(response.headers.get("ETag")).toBe('"abc"');
    expect(response.headers.get("Cache-Control")).toBe("private, no-cache");
  });

  it("returns 200 with blob stream", async () => {
    vi.mocked(storageService.getBlob).mockResolvedValueOnce({
      statusCode: 200,
      stream: Readable.toWeb(Readable.from(Buffer.from("image-data"))),
      blob: { contentType: "image/png", etag: '"xyz"' },
    } as unknown as Awaited<ReturnType<typeof storageService.getBlob>>);

    const response = await GET(createRequest({ key: INTERNAL_KEY }));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("ETag")).toBe('"xyz"');
    expect(response.headers.get("Cache-Control")).toBe("private, no-cache");
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(storageService.getBlob).mockRejectedValueOnce(
      new Error("connection lost"),
    );

    const response = await GET(createRequest({ key: INTERNAL_KEY }));
    expect(response.status).toBe(500);
  });
});
