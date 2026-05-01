import db from "@/lib/db";

export async function findMany({
  teamId,
  userId,
}: {
  teamId: string;
  userId: string;
}) {
  const workspaceUsers = await db.workspaceUser.findMany({
    where: { teamId, userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });

  const workspaces = [];

  for (const workspaceUser of workspaceUsers) {
    workspaces.push(fromDb({ data: workspaceUser.workspace }));
  }

  return workspaces;
}

export function fromDb({
  data,
}: {
  data: {
    id: string;
    name: string;
  };
}) {
  return { ...data };
}
