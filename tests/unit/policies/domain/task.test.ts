import { beforeEach, describe, expect, it } from "vitest";

import * as taskPolicy from "@/policies/domain/task";

import { AccessDeniedError } from "@/services/shared/scope";

import { cleanupDatabase } from "@/tests/_helpers/cleanup";
import {
  createTestTask,
  createTestWorkspace,
} from "@/tests/_helpers/fixtures/_index";

describe("taskPolicy", () => {
  const team1Id = "team1-id";

  let workspace1: Awaited<ReturnType<typeof createTestWorkspace>>;
  let workspace2: Awaited<ReturnType<typeof createTestWorkspace>>;

  beforeEach(async () => {
    await cleanupDatabase();
    workspace1 = await createTestWorkspace({ teamId: team1Id });
    workspace2 = await createTestWorkspace({ teamId: team1Id });
  });

  describe("assertUpdatable", () => {
    it("throws error when task belongs to different workspace", async () => {
      const task = await createTestTask({
        teamId: team1Id,
        workspaceId: workspace1.id,
      });

      await expect(
        taskPolicy.assertUpdatable({
          teamId: team1Id,
          workspaceId: workspace2.id,
          userId: task.userId,
          id: task.id,
        }),
      ).rejects.toThrow(AccessDeniedError);
    });
  });

  describe("assertRemovable", () => {
    it("throws error when task belongs to different workspace", async () => {
      const task = await createTestTask({
        teamId: team1Id,
        workspaceId: workspace1.id,
      });

      await expect(
        taskPolicy.assertRemovable({
          teamId: team1Id,
          workspaceId: workspace2.id,
          userId: task.userId,
          id: task.id,
        }),
      ).rejects.toThrow(AccessDeniedError);
    });
  });
});
