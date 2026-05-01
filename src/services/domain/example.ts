import db from "@/lib/db";
import * as storage from "@/lib/storage/server";

import type * as exampleSchema from "@/schemas/domain/example";

import * as examplePolicy from "@/policies/domain/example";

import * as notificationService from "@/services/shared/notification";
import { STORAGE_TYPES } from "@/services/shared/storage";

export async function findMany({
  teamId,
  workspaceId,
}: {
  teamId: string;
  workspaceId: string;
}) {
  const examples = await db.example.findMany({
    where: { teamId, workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return examples.map((example) => fromDb({ data: example }));
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
  const example = await db.example.findUniqueOrThrow({
    where: { teamId, workspaceId, id },
  });

  return fromDb({ data: example });
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
  data: exampleSchema.createSchema;
}) {
  const example = await db.example.create({
    data: {
      teamId,
      workspaceId,
      userId,
      createdUserId: userId,
      updatedUserId: userId,
      ...data,
    },
  });

  return fromDb({ data: example });
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
  data: exampleSchema.updateSchema;
}) {
  await examplePolicy.assertUpdatable({ teamId, workspaceId, userId, id });

  const example = await db.$transaction(async (tx) => {
    const example = await tx.example.update({
      where: { teamId, workspaceId, userId, id },
      data: { updatedUserId: userId, ...data },
    });

    await notificationService.create({
      tx,
      notifications: [
        {
          type: "example-updated",
          recipientEmail: "jun@andraindrops.dev",
          recipientName: "Example User",
          subject: "Example Updated",
          body: `The example "${example.name}" has been updated.`,
          attachmentKeys: [example.internalImageKey, example.externalImageKey]
            .filter((key): key is string => key != null)
            .map((key) => {
              return {
                key: key,
                filename: key,
              };
            }),
          idempotencyKey: `example-updated-${example.id}-${Date.now()}`,
        },
      ],
    });

    return example;
  });

  return fromDb({ data: example });
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
  await examplePolicy.assertRemovable({ teamId, workspaceId, userId, id });

  const example = await db.example.delete({
    where: { teamId, workspaceId, userId, id },
  });

  return fromDb({ data: example });
}

export function fromDb({
  data,
}: {
  data: {
    id: string;
    name: string;
    internalImageKey: string | null;
    externalImageKey: string | null;
  };
}) {
  let internalImageUrl: string | null = null;
  let externalImageUrl: string | null = null;

  if (data.internalImageKey != null) {
    internalImageUrl = storage.getUrl({
      storageTypes: STORAGE_TYPES,
      key: data.internalImageKey,
    });
  }

  if (data.externalImageKey != null) {
    externalImageUrl = storage.getUrl({
      storageTypes: STORAGE_TYPES,
      key: data.externalImageKey,
    });
  }

  return { ...data, internalImageUrl, externalImageUrl };
}
