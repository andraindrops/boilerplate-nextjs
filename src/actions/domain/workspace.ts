"use server";

import * as authService from "@/services/shared/auth";

import * as workspaceService from "@/services/domain/workspace";

export async function findMany() {
  const teamId = await authService.getTeamId();
  const userId = await authService.getUserId();

  const result = await workspaceService.findMany({ teamId, userId });

  return result;
}
