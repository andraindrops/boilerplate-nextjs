import db from "@/lib/db";

import { cleanupDatabase } from "@/tests/_helpers/cleanup";
import { createTestExample } from "@/tests/_helpers/fixtures/example";
import { createTestTask } from "@/tests/_helpers/fixtures/task";
import { createTestWorkspace } from "@/tests/_helpers/fixtures/workspace";
import { createTestWorkspaceUser } from "@/tests/_helpers/fixtures/workspaceUser";

export async function main() {
  const teamId = process.env.E2E_TEST_TEAM_ID;
  const userId = process.env.E2E_TEST_USER_ID;

  if (teamId == null || userId == null) {
    throw new Error(
      "E2E_TEST_TEAM_ID and E2E_TEST_USER_ID must be set in environment variables",
    );
  }

  await cleanupDatabase();

  const workspace = await createTestWorkspace(
    { teamId, userId, id: teamId },
    { name: "Test Workspace" },
  );

  await createTestWorkspaceUser(
    { teamId, workspaceId: workspace.id, userId },
    { role: "owner" },
  );

  await createTestExample(
    { teamId, workspaceId: workspace.id, userId },
    { name: "Test Example" },
  );
  await createTestTask(
    { teamId, workspaceId: workspace.id, userId },
    { name: "Test Task", content: "Test Task Content" },
  );
}

export async function disconnectDB() {
  await db.$disconnect();
}

if (require.main === module) {
  main()
    .then(async () => {
      await db.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await db.$disconnect();
      process.exit(1);
    });
}
