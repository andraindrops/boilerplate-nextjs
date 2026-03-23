import sharp from "sharp";

import type { StorageType } from "@/lib/storage/server";
import * as storage from "@/lib/storage/server";

import { AccessDeniedError } from "@/services/shared/scope";

const ALLOWED_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/bmp",
];

// biome-ignore format: alignment
export const STORAGE_TYPES: StorageType[] = [
  { key: "example-external", type: "external" },
  { key: "example-internal", type: "internal" },
];

function assertAllowedContentType({ contentType }: { contentType: string }) {
  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    throw new Error("Invalid content type");
  }
}

function assertWorkspaceScope({
  key,
  workspaceId,
}: {
  key: string;
  workspaceId: string;
}) {
  if (!key.startsWith(`workspaces/${workspaceId}/`)) {
    throw new AccessDeniedError();
  }
}

export async function uploadImage({
  workspaceId,
  file,
  prefix,
}: {
  workspaceId: string;
  file: File;
  prefix: string;
}): Promise<string> {
  assertAllowedContentType({ contentType: file.type });

  const buffer = Buffer.from(await file.arrayBuffer());

  const pngBuffer = await sharp(buffer).png().toBuffer();

  const key = storage.generateKey({
    workspaceId,
    prefix,
    contentType: "image/png",
  });

  await storage.uploadBuffer({
    storageTypes: STORAGE_TYPES,
    key,
    body: pngBuffer,
    contentType: "image/png",
  });

  return key;
}

export function generateKey({
  workspaceId,
  prefix,
  contentType,
}: {
  workspaceId: string;
  prefix: string;
  contentType: string;
}) {
  assertAllowedContentType({ contentType });
  return storage.generateKey({ workspaceId, prefix, contentType });
}

export async function getBlob({
  workspaceId,
  key,
  ifNoneMatch,
}: {
  workspaceId: string;
  key: string;
  ifNoneMatch?: string;
}) {
  assertWorkspaceScope({ key, workspaceId });
  return storage.getBlob({ storageTypes: STORAGE_TYPES, key, ifNoneMatch });
}

export async function getUrl({
  workspaceId,
  key,
}: {
  workspaceId: string;
  key: string;
}) {
  assertWorkspaceScope({ key, workspaceId });
  return storage.getUrl({ storageTypes: STORAGE_TYPES, key });
}
