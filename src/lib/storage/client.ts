import * as storageAction from "@/actions/shared/storage";

export async function uploadImage({
  workspaceId,
  file,
  prefix,
}: {
  workspaceId: string;
  file: File;
  prefix: string;
}): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("prefix", prefix);
  formData.append("workspaceId", workspaceId);

  return storageAction.uploadImage(formData);
}
