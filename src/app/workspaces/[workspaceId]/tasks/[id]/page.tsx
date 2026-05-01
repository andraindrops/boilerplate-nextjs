import * as authService from "@/services/shared/auth";

import * as taskService from "@/services/domain/task";

import TaskForm from "@/components/domain/task/form";

export default async function Page({
  params,
}: {
  params: Promise<{ workspaceId: string; id: string }>;
}) {
  const { workspaceId: workspaceIdParam, id } = await params;

  const teamId = await authService.getTeamId();
  const workspaceId = await authService.getWorkspaceId({
    workspaceId: workspaceIdParam,
  });

  const task = await taskService.findById({
    id,
    teamId,
    workspaceId,
  });

  return <TaskForm workspaceId={workspaceId} task={task} />;
}

export const dynamic = "force-dynamic";
