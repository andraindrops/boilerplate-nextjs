"use server";

import * as authService from "@/services/shared/auth";

import * as workspaceService from "@/services/domain/workspace";

export async function findMany() {
  const userId = await authService.getUserId();
  const teamId = await authService.getTeamId();

  const result = await workspaceService.findMany({ userId, teamId });

  return result;
}
