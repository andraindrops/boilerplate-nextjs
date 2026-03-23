import db from "@/lib/db";

export async function createTestWorkspace(
  context: { teamId?: string; userId?: string; id?: string } = {},
  data: { name?: string } = {},
) {
  const workspace = await db.workspace.create({
    data: {
      id: context.id ?? crypto.randomUUID(),
      teamId: context.teamId ?? crypto.randomUUID(),
      name: data.name ?? "Test Workspace",
    },
  });

  return workspace;
}
