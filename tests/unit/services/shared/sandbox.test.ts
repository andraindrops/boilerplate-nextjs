import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as sandboxService from "@/services/shared/sandbox";

const mockCreate = vi.fn();
const mockWriteFiles = vi.fn();
const mockRunCommand = vi.fn();
const mockStop = vi.fn();

vi.mock("@vercel/sandbox", () => ({
  Sandbox: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

describe("sandboxService", () => {
  const originalOidcToken = process.env.VERCEL_OIDC_TOKEN;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VERCEL_OIDC_TOKEN = "test-token";
    mockCreate.mockResolvedValue({
      writeFiles: mockWriteFiles,
      runCommand: mockRunCommand,
      stop: mockStop,
    });
  });

  it("runs javascript in sandbox", async () => {
    mockRunCommand.mockResolvedValue({
      exitCode: 0,
      stdout: vi.fn().mockResolvedValue("hello"),
      stderr: vi.fn().mockResolvedValue(""),
    });

    await sandboxService.runJavascript({
      code: "console.log('hello')",
    });

    expect(mockCreate).toHaveBeenCalledWith({
      runtime: "node24",
      timeout: 60_000,
    });
    expect(mockWriteFiles).toHaveBeenCalledWith([
      {
        path: "main.js",
        content: Buffer.from("console.log('hello')"),
      },
    ]);
    expect(mockRunCommand).toHaveBeenCalledWith("node", ["main.js"]);
    expect(mockStop).toHaveBeenCalled();
  });

  it("stops sandbox when command throws error", async () => {
    mockRunCommand.mockRejectedValueOnce(new Error("run failed"));

    await expect(
      sandboxService.runJavascript({
        code: "throw new Error('run failed')",
      }),
    ).rejects.toThrow("run failed");

    expect(mockStop).toHaveBeenCalled();
  });

  it("throws error when oidc token is missing", async () => {
    delete process.env.VERCEL_OIDC_TOKEN;

    await expect(
      sandboxService.runJavascript({
        code: "console.log('hello')",
      }),
    ).rejects.toThrow("VERCEL_OIDC_TOKEN environment variable is not set");

    expect(mockCreate).not.toHaveBeenCalled();
  });

  afterEach(() => {
    if (originalOidcToken == null) {
      delete process.env.VERCEL_OIDC_TOKEN;
      return;
    }

    process.env.VERCEL_OIDC_TOKEN = originalOidcToken;
  });
});
