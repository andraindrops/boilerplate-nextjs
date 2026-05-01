import * as authService from "@/services/shared/auth";

import * as taskService from "@/services/domain/task";

import TaskList from "@/components/domain/task/list";

export default async function Page({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId: workspaceIdParam } = await params;

  const teamId = await authService.getTeamId();
  const workspaceId = await authService.getWorkspaceId({
    workspaceId: workspaceIdParam,
  });

  const tasks = await taskService.findMany({
    teamId,
    workspaceId,
  });

  return <TaskList workspaceId={workspaceId} tasks={tasks} />;
}

export const dynamic = "force-dynamic";
