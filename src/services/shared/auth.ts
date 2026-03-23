import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

import db from "@/lib/db";

export async function getTeamId() {
  const { userId, orgId: teamId } = await auth();

  if (userId == null || teamId == null) {
    throw new Error("Unauthorized");
  }

  return teamId;
}

export async function getUserId() {
  const { userId } = await auth();

  if (userId == null) {
    throw new Error("Unauthorized");
  }

  return userId;
}

export async function getWorkspaceId({
  workspaceId,
}: {
  workspaceId?: string;
} = {}) {
  const teamId = await getTeamId();
  const userId = await getUserId();

  let resolvedWorkspaceId = workspaceId;

  if (resolvedWorkspaceId == null) {
    const headersList = await headers();
    const referer = headersList.get("referer") ?? "";
    const nextUrl = headersList.get("next-url") ?? "";

    const match =
      referer.match(/\/workspaces\/([^/?#]+)/) ??
      nextUrl.match(/\/workspaces\/([^/?#]+)/);

    resolvedWorkspaceId = match?.[1];
  }

  if (resolvedWorkspaceId != null) {
    const workspaceUser = await db.workspaceUser.findFirst({
      where: { teamId, workspaceId: resolvedWorkspaceId, userId },
    });

    if (workspaceUser != null) {
      return workspaceUser.workspaceId;
    }
  }

  throw new Error("Unauthorized");
}
