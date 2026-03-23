import db from "@/lib/db";

export async function cleanupDatabase() {
  await db.example.deleteMany({});
  await db.notification.deleteMany({});
  await db.workspaceUser.deleteMany({});
  await db.workspace.deleteMany({});
}
