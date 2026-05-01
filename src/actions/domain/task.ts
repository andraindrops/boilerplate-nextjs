"use server";

import { revalidatePath } from "next/cache";

import type * as taskSchema from "@/schemas/domain/task";

import * as authService from "@/services/shared/auth";

import * as taskService from "@/services/domain/task";

export async function findMany() {
  const teamId = await authService.getTeamId();
  const workspaceId = await authService.getWorkspaceId();

  return await taskService.findMany({
    teamId,
    workspaceId,
  });
}

export async function findById({ id }: { id: string }) {
  const teamId = await authService.getTeamId();
  const workspaceId = await authService.getWorkspaceId();

  return await taskService.findById({
    teamId,
    workspaceId,
    id,
  });
}

export async function create({ data }: { data: taskSchema.createSchema }) {
  const teamId = await authService.getTeamId();
  const workspaceId = await authService.getWorkspaceId();
  const userId = await authService.getUserId();

  const result = await taskService.create({
    teamId,
    workspaceId,
    userId,
    data,
  });

  revalidatePath(`/workspaces/${workspaceId}/tasks`);

  return result;
}

export async function update({
  id,
  data,
}: {
  id: string;
  data: taskSchema.updateSchema;
}) {
  const teamId = await authService.getTeamId();
  const workspaceId = await authService.getWorkspaceId();
  const userId = await authService.getUserId();

  const result = await taskService.update({
    teamId,
    workspaceId,
    userId,
    id,
    data,
  });

  revalidatePath(`/workspaces/${workspaceId}/tasks`);
  revalidatePath(`/workspaces/${workspaceId}/tasks/${id}`);

  return result;
}

export async function remove({ id }: { id: string }) {
  const teamId = await authService.getTeamId();
  const workspaceId = await authService.getWorkspaceId();
  const userId = await authService.getUserId();

  const result = await taskService.remove({
    teamId,
    workspaceId,
    userId,
    id,
  });

  revalidatePath(`/workspaces/${workspaceId}/tasks`);

  return result;
}

export async function run({ id }: { id: string }) {
  const teamId = await authService.getTeamId();
  const workspaceId = await authService.getWorkspaceId();

  await taskService.run({
    teamId,
    workspaceId,
    id,
  });
}
