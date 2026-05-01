import db from "@/lib/db";

import type * as taskSchema from "@/schemas/domain/task";

import * as taskPolicy from "@/policies/domain/task";

export async function findMany({
  teamId,
  workspaceId,
}: {
  teamId: string;
  workspaceId: string;
}) {
  return await db.task.findMany({
    where: { teamId, workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findById({
  teamId,
  workspaceId,
  id,
}: {
  teamId: string;
  workspaceId: string;
  id: string;
}) {
  return await db.task.findUniqueOrThrow({
    where: { teamId, workspaceId, id },
  });
}

export async function create({
  teamId,
  workspaceId,
  userId,
  data,
}: {
  teamId: string;
  workspaceId: string;
  userId: string;
  data: taskSchema.createSchema;
}) {
  return await db.task.create({
    data: {
      teamId,
      workspaceId,
      userId,
      createdUserId: userId,
      updatedUserId: userId,
      ...data,
    },
  });
}

export async function update({
  teamId,
  workspaceId,
  userId,
  id,
  data,
}: {
  teamId: string;
  workspaceId: string;
  userId: string;
  id: string;
  data: taskSchema.updateSchema;
}) {
  await taskPolicy.assertUpdatable({ teamId, workspaceId, userId, id });

  return await db.task.update({
    where: { teamId, workspaceId, userId, id },
    data: { ...data, updatedUserId: userId },
  });
}

export async function remove({
  teamId,
  workspaceId,
  userId,
  id,
}: {
  teamId: string;
  workspaceId: string;
  userId: string;
  id: string;
}) {
  await taskPolicy.assertRemovable({ teamId, workspaceId, userId, id });

  return await db.task.delete({
    where: { teamId, workspaceId, userId, id },
  });
}
