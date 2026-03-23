import "dotenv/config";

import db from "@/lib/db";

async function main() {
  const teamId = process.env.DEV_TEAM_ID;
  const userId = process.env.DEV_USER_ID;

  if (teamId == null || userId == null) {
    throw new Error("DEV_TEAM_ID and DEV_USER_ID must be set");
  }

  const workspace = await db.workspace.create({
    data: {
      name: "Default Workspace",
      teamId,
    },
  });

  await db.workspaceUser.create({
    data: {
      teamId,
      workspaceId: workspace.id,
      userId,
      role: "admin",
    },
  });

  await db.example.create({
    data: {
      name: "Example 1",
      teamId,
      workspaceId: workspace.id,
      userId,
      createdUserId: userId,
      updatedUserId: userId,
    },
  });
  await db.example.create({
    data: {
      name: "Example 2",
      teamId,
      workspaceId: workspace.id,
      userId,
      createdUserId: userId,
      updatedUserId: userId,
    },
  });
  await db.example.create({
    data: {
      name: "Example 3",
      teamId,
      workspaceId: workspace.id,
      userId,
      createdUserId: userId,
      updatedUserId: userId,
    },
  });
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
