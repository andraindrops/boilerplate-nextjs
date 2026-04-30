import { beforeAll } from "vitest";

import { cleanupDatabase } from "@/tests/_helpers/cleanup";

const TEST_DATABASE_NAME = "coputo-test";

function validateTestDatabase() {
  if (!process.env.DATABASE_URL?.includes(TEST_DATABASE_NAME)) {
    throw new Error("Unit tests must run against the test database.");
  }
}

beforeAll(async () => {
  validateTestDatabase();

  await cleanupDatabase();
});
