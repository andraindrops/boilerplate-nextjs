import { get, put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

const STORAGE_TOKENS: Record<string, string> = {
  external: "EXTERNAL_BLOB_READ_WRITE_TOKEN",
  internal: "INTERNAL_BLOB_READ_WRITE_TOKEN",
};

export type StorageType = {
  key: string;
  type: "external" | "internal";
};

export function getStorageType({
  storageTypes,
  key,
}: {
  storageTypes: StorageType[];
  key: string;
}) {
  const found = storageTypes.find((entry) => key.includes(`/${entry.key}/`));

  if (found == null) {
    throw new Error(`Unknown storage key: ${key}`);
  }

  return found.type;
}

export function getUrl({
  storageTypes,
  key,
}: {
  storageTypes: StorageType[];
  key: string;
}) {
  return resolveUrl({ storageTypes, key });
}

export async function getBlob({
  storageTypes,
  key,
  ifNoneMatch,
}: {
  storageTypes: StorageType[];
  key: string;
  ifNoneMatch?: string;
}) {
  return get(key, {
    access: getAccess({ storageTypes, key }),
    token: getToken({ storageTypes, key }),
    ifNoneMatch,
  });
}

export function generateKey({
  workspaceId,
  prefix,
  contentType,
}: {
  workspaceId: string;
  prefix: string;
  contentType?: string;
}): string {
  const extension =
    contentType == null ? "png" : getExtensionFromContentType({ contentType });

  return `workspaces/${workspaceId}/${prefix}/${uuidv4()}.${extension}`;
}

export async function uploadBuffer({
  storageTypes,
  key,
  body,
  contentType,
}: {
  storageTypes: StorageType[];
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<void> {
  await put(key, body, {
    access: getAccess({ storageTypes, key }),
    contentType,
    addRandomSuffix: false,
    token: getToken({ storageTypes, key }),
  });
}

function getToken({
  storageTypes,
  key,
}: {
  storageTypes: StorageType[];
  key: string;
}): string {
  const envKey = STORAGE_TOKENS[getStorageType({ storageTypes, key })];
  const token = process.env[envKey];

  if (token == null) {
    throw new Error(`Missing environment variable: ${envKey}`);
  }

  return token;
}

function getAccess({
  storageTypes,
  key,
}: {
  storageTypes: StorageType[];
  key: string;
}): "public" | "private" {
  const storageType = getStorageType({ storageTypes, key });

  if (storageType === "external") {
    return "public";
  }

  if (storageType === "internal") {
    return "private";
  }

  throw new Error(`Unknown storage type: ${storageType}`);
}

function getExtensionFromContentType({
  contentType,
}: {
  contentType: string;
}): string {
  // biome-ignore format: alignment
  const map: Record<string, string> = {
    "image/png":  "png",
    "image/jpeg": "jpg",
    "image/gif":  "gif",
    "image/webp": "webp",
    "image/bmp":  "bmp",
  };

  return map[contentType] ?? "png";
}

function resolveUrl({
  storageTypes,
  key,
}: {
  storageTypes: StorageType[];
  key: string;
}): string {
  const storageType = getStorageType({ storageTypes, key });

  if (storageType === "external") {
    const baseUrl = process.env.EXTERNAL_BLOB_BASE_URL;

    if (baseUrl == null) {
      throw new Error("Missing environment variable: EXTERNAL_BLOB_BASE_URL");
    }

    return `${baseUrl}/${key}`;
  }

  if (storageType === "internal") {
    return `/api/blob?key=${encodeURIComponent(key)}`;
  }

  throw new Error(`Unknown storage type: ${storageType}`);
}
