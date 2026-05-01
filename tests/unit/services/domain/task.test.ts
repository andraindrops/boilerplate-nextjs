import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccessDeniedError } from "@/services/shared/scope";

import * as taskService from "@/services/domain/task";

import { cleanupDatabase } from "@/tests/_helpers/cleanup";
import {
  createTestTask,
  createTestWorkspace,
  createTestWorkspaceUser,
} from "@/tests/_helpers/fixtures/_index";

const mockRunJavascript = vi.fn();

vi.mock("@/services/shared/sandbox", () => ({
  runJavascript: (...args: unknown[]) => mockRunJavascript(...args),
}));

describe("taskService", () => {
  const team1Id = "team1-id";
  const team1User1Id = "team1-user1-id";
  const team1User2Id = "team1-user2-id";
  const team2Id = "team2-id";
  const team2User1Id = "team2-user1-id";

  let team1workspace1: Awaited<ReturnType<typeof createTestWorkspace>>;
  let team1workspace2: Awaited<ReturnType<typeof createTestWorkspace>>;
  let team2workspace1: Awaited<ReturnType<typeof createTestWorkspace>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await cleanupDatabase();
    team1workspace1 = await createTestWorkspace({ teamId: team1Id });
    team1workspace2 = await createTestWorkspace({ teamId: team1Id });
    team2workspace1 = await createTestWorkspace({ teamId: team2Id });
    await createTestWorkspaceUser({
      teamId: team1Id,
      workspaceId: team1workspace1.id,
      userId: team1User1Id,
    });
    await createTestWorkspaceUser({
      teamId: team1Id,
      workspaceId: team1workspace1.id,
      userId: team1User2Id,
    });
    await createTestWorkspaceUser({
      teamId: team2Id,
      workspaceId: team2workspace1.id,
      userId: team2User1Id,
    });
  });

  describe("findMany", () => {
    it("returns tasks for the specified team and workspace", async () => {
      await createTestTask(
        { teamId: team1Id, workspaceId: team1workspace1.id },
        { name: "Team 1 - Workspace 1 Task 1", content: "Content 1" },
      );
      await createTestTask(
        { teamId: team1Id, workspaceId: team1workspace1.id },
        { name: "Team 1 - Workspace 1 Task 2", content: "Content 2" },
      );
      await createTestTask(
        { teamId: team1Id, workspaceId: team1workspace2.id },
        { name: "Team 1 - Workspace 2 Task 1", content: "Content 1" },
      );

      const result = await taskService.findMany({
        teamId: team1Id,
        workspaceId: team1workspace1.id,
      });

      expect(result).toHaveLength(2);
      expect(result.map((e) => e.name)).toContain(
        "Team 1 - Workspace 1 Task 1",
      );
      expect(result.map((e) => e.name)).toContain(
        "Team 1 - Workspace 1 Task 2",
      );
    });

    it("returns empty array when no tasks exist", async () => {
      const result = await taskService.findMany({
        teamId: team1Id,
        workspaceId: team1workspace1.id,
      });

      expect(result).toEqual([]);
    });

    it("returns tasks sorted by createdAt descending", async () => {
      const task1 = await createTestTask(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Team 1 - Workspace 1 Task 1", content: "Content 1" },
      );

      await new Promise((resolve) => setTimeout(resolve, 10));

      const task2 = await createTestTask(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Team 1 - Workspace 1 Task 2", content: "Content 2" },
      );

      const result = await taskService.findMany({
        teamId: team1Id,
        workspaceId: team1workspace1.id,
      });

      expect(result[0].id).toBe(task2.id);
      expect(result[1].id).toBe(task1.id);
    });
  });

  describe("findById", () => {
    it("returns the task when it exists", async () => {
      const task = await createTestTask(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Team 1 - Workspace 1 Task", content: "Task content" },
      );

      const result = await taskService.findById({
        teamId: team1Id,
        workspaceId: team1workspace1.id,
        id: task.id,
      });

      expect(result).toMatchObject({
        id: task.id,
        name: "Team 1 - Workspace 1 Task",
        content: "Task content",
      });
    });

    it("throws error when task does not exist", async () => {
      await expect(
        taskService.findById({
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          id: "non-existent-id",
        }),
      ).rejects.toThrow();
    });

    it("throws error when task belongs to different workspace", async () => {
      const task = await createTestTask(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Team 1 - Workspace 1 Task", content: "Task content" },
      );

      await expect(
        taskService.findById({
          teamId: team2Id,
          workspaceId: team1workspace2.id,
          id: task.id,
        }),
      ).rejects.toThrow();
    });
  });

  describe("create", () => {
    it("creates a new task", async () => {
      const result = await taskService.create({
        teamId: team1Id,
        workspaceId: team1workspace1.id,
        userId: team1User1Id,
        data: { name: "Test Task", content: "Test Task Content" },
      });

      expect(result).toMatchObject({
        id: expect.any(String),
        name: "Test Task",
        content: "Test Task Content",
      });
    });

    it("creates task with correct team and workspace association", async () => {
      const result = await taskService.create({
        teamId: team1Id,
        workspaceId: team1workspace1.id,
        userId: team1User1Id,
        data: { name: "Test Task", content: "Test Task Content" },
      });

      const found = await taskService.findById({
        teamId: team1Id,
        workspaceId: team1workspace1.id,
        id: result.id,
      });

      expect(found.id).toBe(result.id);
    });
  });

  describe("update", () => {
    it("updates an existing task", async () => {
      const task = await createTestTask(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Test Task", content: "Test Task Content" },
      );

      const result = await taskService.update({
        teamId: team1Id,
        workspaceId: team1workspace1.id,
        userId: team1User1Id,
        id: task.id,
        data: {
          name: "Updated Test Task",
          content: "Updated Task Content",
        },
      });

      expect(result.name).toBe("Updated Test Task");
      expect(result.content).toBe("Updated Task Content");
    });

    it("throws error when task belongs to different workspace", async () => {
      const task = await createTestTask(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Test Task", content: "Test Task Content" },
      );

      await expect(
        taskService.update({
          teamId: team1Id,
          workspaceId: team1workspace2.id,
          userId: team1User2Id,
          id: task.id,
          data: {
            name: "Updated Test Task",
            content: "Updated Task Content",
          },
        }),
      ).rejects.toThrow(AccessDeniedError);
    });

    it("throws error when called by a different user in the same workspace", async () => {
      const task = await createTestTask(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Test Task", content: "Test Task Content" },
      );

      await expect(
        taskService.update({
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User2Id,
          id: task.id,
          data: {
            name: "Updated Test Task",
            content: "Updated Task Content",
          },
        }),
      ).rejects.toThrow(AccessDeniedError);
    });
  });

  describe("remove", () => {
    it("removes an existing task", async () => {
      const task = await createTestTask(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Test Task", content: "Test Task Content" },
      );

      await taskService.remove({
        teamId: team1Id,
        workspaceId: team1workspace1.id,
        userId: team1User1Id,
        id: task.id,
      });

      await expect(
        taskService.findById({
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          id: task.id,
        }),
      ).rejects.toThrow();
    });

    it("throws error when task belongs to different workspace", async () => {
      const task = await createTestTask(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Test Task", content: "Test Task Content" },
      );

      await expect(
        taskService.remove({
          teamId: team1Id,
          workspaceId: team1workspace2.id,
          userId: team1User2Id,
          id: task.id,
        }),
      ).rejects.toThrow(AccessDeniedError);
    });

    it("throws error when called by a different user in the same workspace", async () => {
      const task = await createTestTask(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Test Task", content: "Test Task Content" },
      );

      await expect(
        taskService.remove({
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User2Id,
          id: task.id,
        }),
      ).rejects.toThrow(AccessDeniedError);
    });
  });

  describe("run", () => {
    it("runs task content in sandbox", async () => {
      mockRunJavascript.mockResolvedValueOnce({
        exitCode: 0,
        stdout: "ok",
        stderr: "",
      });
      const task = await createTestTask(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Test Task", content: "console.log('ok')" },
      );

      await taskService.run({
        teamId: team1Id,
        workspaceId: team1workspace1.id,
        id: task.id,
      });

      expect(mockRunJavascript).toHaveBeenCalledWith({
        code: "console.log('ok')",
      });
    });

    it("throws error when task belongs to different workspace", async () => {
      const task = await createTestTask(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Test Task", content: "console.log('ok')" },
      );

      await expect(
        taskService.run({
          teamId: team1Id,
          workspaceId: team1workspace2.id,
          id: task.id,
        }),
      ).rejects.toThrow();
      expect(mockRunJavascript).not.toHaveBeenCalled();
    });
  });
});
