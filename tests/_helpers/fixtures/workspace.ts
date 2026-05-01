import db from "@/lib/db";

export async function createTestWorkspace(
  context: { teamId?: string; userId?: string; id?: string } = {},
  data: { name?: string } = {},
) {
  const workspace = await db.workspace.create({
    data: {
      teamId: context.teamId ?? crypto.randomUUID(),
      id: context.id ?? crypto.randomUUID(),
      name: data.name ?? "Test Workspace",
    },
  });

  return workspace;
}
