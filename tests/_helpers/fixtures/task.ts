import db from "@/lib/db";

import { createTestWorkspace } from "./workspace";

export async function createTestTask(
  context: {
    teamId?: string;
    workspaceId?: string;
    userId?: string;
    id?: string;
  } = {},
  data: { name?: string; content?: string } = {},
) {
  const teamId = context.teamId ?? crypto.randomUUID();
  const userId = context.userId ?? crypto.randomUUID();
  const workspaceId =
    context.workspaceId ?? (await createTestWorkspace({ teamId, userId })).id;

  return await db.task.create({
    data: {
      teamId,
      workspaceId,
      userId,
      id: context.id ?? crypto.randomUUID(),
      name: data.name ?? "Test Task",
      content: data.content ?? "Test Task Content",
      createdUserId: userId,
      updatedUserId: userId,
    },
  });
}
