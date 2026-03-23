"use server";

import * as authService from "@/services/shared/auth";
import * as storageService from "@/services/shared/storage";

export async function uploadImage(formData: FormData): Promise<string> {
  const file = formData.get("file");
  const prefix = formData.get("prefix");
  const workspaceId = formData.get("workspaceId");

  if (file == null || prefix == null || workspaceId == null) {
    throw new Error("Missing file, prefix, or workspaceId");
  }

  await authService.getTeamId();

  return storageService.uploadImage({
    workspaceId: workspaceId as string,
    file: file as File,
    prefix: prefix as string,
  });
}

export async function getUrl({
  workspaceId,
  key,
}: {
  workspaceId: string;
  key: string;
}) {
  await authService.getTeamId();

  return storageService.getUrl({ workspaceId, key });
}
