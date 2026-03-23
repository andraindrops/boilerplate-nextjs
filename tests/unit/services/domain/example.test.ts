import { beforeEach, describe, expect, it } from "vitest";

import { AccessDeniedError } from "@/services/shared/scope";

import * as exampleService from "@/services/domain/example";

import { cleanupDatabase } from "@/tests/_helpers/cleanup";
import {
  createTestExample,
  createTestWorkspace,
  createTestWorkspaceUser,
} from "@/tests/_helpers/fixtures/_index";

describe("exampleService", () => {
  const team1Id = "team1-id";
  const team1User1Id = "team1-user1-id";
  const team1User2Id = "team1-user2-id";
  const team2Id = "team2-id";
  const team2User1Id = "team2-user1-id";

  let team1workspace1: Awaited<ReturnType<typeof createTestWorkspace>>;
  let team1workspace2: Awaited<ReturnType<typeof createTestWorkspace>>;
  let team2workspace1: Awaited<ReturnType<typeof createTestWorkspace>>;

  beforeEach(async () => {
    await cleanupDatabase();
    team1workspace1 = await createTestWorkspace({ teamId: team1Id });
    team1workspace2 = await createTestWorkspace({ teamId: team1Id });
    team2workspace1 = await createTestWorkspace({ teamId: team2Id });
    await createTestWorkspaceUser({
      userId: team1User1Id,
      teamId: team1Id,
      workspaceId: team1workspace1.id,
    });
    await createTestWorkspaceUser({
      userId: team1User2Id,
      teamId: team1Id,
      workspaceId: team1workspace1.id,
    });
    await createTestWorkspaceUser({
      userId: team2User1Id,
      teamId: team2Id,
      workspaceId: team2workspace1.id,
    });
  });

  describe("findMany", () => {
    it("returns examples for the specified team and workspace", async () => {
      await createTestExample(
        { teamId: team1Id, workspaceId: team1workspace1.id },
        { name: "Team 1 - Workspace 1 Example 1" },
      );
      await createTestExample(
        { teamId: team1Id, workspaceId: team1workspace1.id },
        { name: "Team 1 - Workspace 1 Example 2" },
      );
      await createTestExample(
        { teamId: team1Id, workspaceId: team1workspace2.id },
        { name: "Team 1 - Workspace 2 Example" },
      );

      const result = await exampleService.findMany({
        teamId: team1Id,
        workspaceId: team1workspace1.id,
      });

      expect(result).toHaveLength(2);
      expect(result.map((e) => e.name)).toContain(
        "Team 1 - Workspace 1 Example 1",
      );
      expect(result.map((e) => e.name)).toContain(
        "Team 1 - Workspace 1 Example 2",
      );
    });

    it("returns empty array when no examples exist", async () => {
      const result = await exampleService.findMany({
        teamId: team1Id,
        workspaceId: team1workspace1.id,
      });

      expect(result).toEqual([]);
    });

    it("returns examples sorted by createdAt descending", async () => {
      const example1 = await createTestExample(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Team 1 - Workspace 1 Example 1" },
      );

      await new Promise((resolve) => setTimeout(resolve, 10));

      const example2 = await createTestExample(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Team 1 - Workspace 1 Example 2" },
      );

      const result = await exampleService.findMany({
        teamId: team1Id,
        workspaceId: team1workspace1.id,
      });

      expect(result[0].id).toBe(example2.id);
      expect(result[1].id).toBe(example1.id);
    });
  });

  describe("findById", () => {
    it("returns the example when it exists", async () => {
      const example = await createTestExample(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Team 1 - Workspace 1 Example" },
      );

      const result = await exampleService.findById({
        id: example.id,
        teamId: team1Id,
        workspaceId: team1workspace1.id,
      });

      expect(result).toMatchObject({
        id: example.id,
        name: "Team 1 - Workspace 1 Example",
      });
    });

    it("throws error when example does not exist", async () => {
      await expect(
        exampleService.findById({
          id: "non-existent-id",
          teamId: team1Id,
          workspaceId: team1workspace1.id,
        }),
      ).rejects.toThrow();
    });

    it("throws error when example belongs to different workspace", async () => {
      const example = await createTestExample(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Team 1 - Workspace 1 Example" },
      );

      await expect(
        exampleService.findById({
          id: example.id,
          teamId: team2Id,
          workspaceId: team1workspace2.id,
        }),
      ).rejects.toThrow();
    });
  });

  describe("create", () => {
    it("creates a new example", async () => {
      const result = await exampleService.create({
        teamId: team1Id,
        workspaceId: team1workspace1.id,
        userId: team1User1Id,
        data: { name: "Test Example" },
      });

      expect(result).toMatchObject({
        id: expect.any(String),
        name: "Test Example",
      });
    });

    it("creates example with correct team and workspace association", async () => {
      const result = await exampleService.create({
        teamId: team1Id,
        workspaceId: team1workspace1.id,
        userId: team1User1Id,
        data: { name: "Test Example" },
      });

      const found = await exampleService.findById({
        id: result.id,
        teamId: team1Id,
        workspaceId: team1workspace1.id,
      });

      expect(found.id).toBe(result.id);
    });
  });

  describe("update", () => {
    it("updates an existing example", async () => {
      const example = await createTestExample(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Test Example" },
      );

      const result = await exampleService.update({
        id: example.id,
        teamId: team1Id,
        workspaceId: team1workspace1.id,
        userId: team1User1Id,
        data: {
          name: "Updated Test Example",
          internalImageKey: null,
          externalImageKey: null,
        },
      });

      expect(result.name).toBe("Updated Test Example");
    });

    it("throws error when example belongs to different workspace", async () => {
      const example = await createTestExample(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Test Example" },
      );

      await expect(
        exampleService.update({
          id: example.id,
          teamId: team1Id,
          workspaceId: team1workspace2.id,
          userId: team1User2Id,
          data: {
            name: "Updated Test Example",
            internalImageKey: null,
            externalImageKey: null,
          },
        }),
      ).rejects.toThrow(AccessDeniedError);
    });

    it("throws error when called by a different user in the same workspace", async () => {
      const example = await createTestExample(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Test Example" },
      );

      await expect(
        exampleService.update({
          id: example.id,
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User2Id,
          data: {
            name: "Updated Test Example",
            internalImageKey: null,
            externalImageKey: null,
          },
        }),
      ).rejects.toThrow(AccessDeniedError);
    });
  });

  describe("remove", () => {
    it("removes an existing example", async () => {
      const example = await createTestExample(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Test Example" },
      );

      await exampleService.remove({
        id: example.id,
        teamId: team1Id,
        workspaceId: team1workspace1.id,
        userId: team1User1Id,
      });

      await expect(
        exampleService.findById({
          id: example.id,
          teamId: team1Id,
          workspaceId: team1workspace1.id,
        }),
      ).rejects.toThrow();
    });

    it("throws error when example belongs to different workspace", async () => {
      const example = await createTestExample(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Test Example" },
      );

      await expect(
        exampleService.remove({
          id: example.id,
          teamId: team1Id,
          workspaceId: team1workspace2.id,
          userId: team1User2Id,
        }),
      ).rejects.toThrow(AccessDeniedError);
    });

    it("throws error when called by a different user in the same workspace", async () => {
      const example = await createTestExample(
        {
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User1Id,
        },
        { name: "Test Example" },
      );

      await expect(
        exampleService.remove({
          id: example.id,
          teamId: team1Id,
          workspaceId: team1workspace1.id,
          userId: team1User2Id,
        }),
      ).rejects.toThrow(AccessDeniedError);
    });
  });
});
