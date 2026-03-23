import * as authService from "@/services/shared/auth";

import * as exampleService from "@/services/domain/example";

import ExampleForm from "@/components/domain/example/form";

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

  const example = await exampleService.findById({
    id,
    teamId,
    workspaceId,
  });

  return <ExampleForm workspaceId={workspaceId} example={example} />;
}

export const dynamic = "force-dynamic";
