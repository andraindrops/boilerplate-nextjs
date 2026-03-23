import { beforeEach, describe, expect, it } from "vitest";

import * as examplePolicy from "@/policies/domain/example";

import { AccessDeniedError } from "@/services/shared/scope";

import { cleanupDatabase } from "@/tests/_helpers/cleanup";
import {
  createTestExample,
  createTestWorkspace,
} from "@/tests/_helpers/fixtures/_index";

describe("examplePolicy", () => {
  const team1Id = "team1-id";

  let workspace1: Awaited<ReturnType<typeof createTestWorkspace>>;
  let workspace2: Awaited<ReturnType<typeof createTestWorkspace>>;

  beforeEach(async () => {
    await cleanupDatabase();
    workspace1 = await createTestWorkspace({ teamId: team1Id });
    workspace2 = await createTestWorkspace({ teamId: team1Id });
  });

  describe("assertUpdatable", () => {
    it("throws error when example belongs to different workspace", async () => {
      const example = await createTestExample({
        teamId: team1Id,
        workspaceId: workspace1.id,
      });

      await expect(
        examplePolicy.assertUpdatable({
          userId: example.userId,
          teamId: team1Id,
          workspaceId: workspace2.id,
          id: example.id,
        }),
      ).rejects.toThrow(AccessDeniedError);
    });
  });

  describe("assertRemovable", () => {
    it("throws error when example belongs to different workspace", async () => {
      const example = await createTestExample({
        teamId: team1Id,
        workspaceId: workspace1.id,
      });

      await expect(
        examplePolicy.assertRemovable({
          userId: example.userId,
          teamId: team1Id,
          workspaceId: workspace2.id,
          id: example.id,
        }),
      ).rejects.toThrow(AccessDeniedError);
    });
  });
});
