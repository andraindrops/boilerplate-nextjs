import db from "@/lib/db";

import {
  AccessDeniedError,
  type TransactionClient,
} from "@/services/shared/scope";

export async function assertUpdatable({
  teamId,
  workspaceId,
  userId,
  id,
  tx = db as TransactionClient,
}: {
  teamId: string;
  workspaceId: string;
  userId: string;
  id: string;
  tx?: TransactionClient;
}): Promise<void> {
  const task = await tx.task.findFirst({
    where: {
      id,
      teamId,
      workspaceId,
      userId,
    },
    select: { id: true },
  });

  if (task == null) {
    throw new AccessDeniedError();
  }
}

export async function assertRemovable({
  teamId,
  workspaceId,
  userId,
  id,
  tx = db as TransactionClient,
}: {
  teamId: string;
  workspaceId: string;
  userId: string;
  id: string;
  tx?: TransactionClient;
}): Promise<void> {
  const task = await tx.task.findFirst({
    where: {
      id,
      teamId,
      workspaceId,
      userId,
    },
    select: { id: true },
  });

  if (task == null) {
    throw new AccessDeniedError();
  }
}
