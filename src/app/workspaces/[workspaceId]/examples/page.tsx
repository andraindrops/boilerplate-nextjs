import * as authService from "@/services/shared/auth";

import * as exampleService from "@/services/domain/example";

import ExampleList from "@/components/domain/example/list";

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

  const examples = await exampleService.findMany({
    teamId,
    workspaceId,
  });

  return <ExampleList workspaceId={workspaceId} examples={examples} />;
}

export const dynamic = "force-dynamic";
