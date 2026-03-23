"use server";

import { revalidatePath } from "next/cache";

import type * as exampleSchema from "@/schemas/domain/example";

import * as authService from "@/services/shared/auth";

import * as exampleService from "@/services/domain/example";

export async function findMany() {
  const teamId = await authService.getTeamId();
  const workspaceId = await authService.getWorkspaceId();

  const result = await exampleService.findMany({ teamId, workspaceId });

  return result;
}

export async function findById({ id }: { id: string }) {
  const teamId = await authService.getTeamId();
  const workspaceId = await authService.getWorkspaceId();

  const result = await exampleService.findById({
    id,
    teamId,
    workspaceId,
  });

  return result;
}

export async function create({ data }: { data: exampleSchema.createSchema }) {
  const teamId = await authService.getTeamId();
  const workspaceId = await authService.getWorkspaceId();
  const userId = await authService.getUserId();

  const result = await exampleService.create({
    data,
    teamId,
    workspaceId,
    userId,
  });

  revalidatePath(`/workspaces/${workspaceId}/examples`);

  return result;
}

export async function update({
  id,
  data,
}: {
  id: string;
  data: exampleSchema.updateSchema;
}) {
  const teamId = await authService.getTeamId();
  const workspaceId = await authService.getWorkspaceId();
  const userId = await authService.getUserId();

  const result = await exampleService.update({
    id,
    data,
    teamId,
    workspaceId,
    userId,
  });

  revalidatePath(`/workspaces/${workspaceId}/examples`);
  revalidatePath(`/workspaces/${workspaceId}/examples/${id}`);

  return result;
}

export async function remove({ id }: { id: string }) {
  const teamId = await authService.getTeamId();
  const workspaceId = await authService.getWorkspaceId();
  const userId = await authService.getUserId();

  const result = await exampleService.remove({
    id,
    teamId,
    workspaceId,
    userId,
  });

  revalidatePath(`/workspaces/${workspaceId}/examples`);

  return result;
}
