import db from "@/lib/db";

export async function createTestWorkspaceUser(
  context: { teamId?: string; workspaceId: string; userId?: string },
  data: { role?: string } = {},
) {
  const workspaceUser = await db.workspaceUser.create({
    data: {
      teamId: context.teamId ?? crypto.randomUUID(),
      workspaceId: context.workspaceId,
      userId: context.userId ?? crypto.randomUUID(),
      role: data.role ?? "member",
    },
  });

  return workspaceUser;
}
