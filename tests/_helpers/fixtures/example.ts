import db from "@/lib/db";

import { createTestWorkspace } from "./workspace";

export async function createTestExample(
  context: {
    id?: string;
    teamId?: string;
    workspaceId?: string;
    userId?: string;
  } = {},
  data: { name?: string } = {},
) {
  const teamId = context.teamId ?? crypto.randomUUID();
  const userId = context.userId ?? crypto.randomUUID();
  const workspaceId =
    context.workspaceId ?? (await createTestWorkspace({ teamId, userId })).id;

  const example = await db.example.create({
    data: {
      id: context.id ?? crypto.randomUUID(),
      teamId,
      workspaceId,
      userId,
      name: data.name ?? "Test Example",
      createdUserId: userId,
      updatedUserId: userId,
    },
  });

  return example;
}
