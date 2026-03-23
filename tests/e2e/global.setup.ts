import path from "node:path";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

const authFile = path.join(__dirname, "../../playwright/.clerk/user.json");

setup("authenticate", async ({ page }) => {
  await clerkSetup();

  const username = process.env.E2E_CLERK_USER_USERNAME;
  const password = process.env.E2E_CLERK_USER_PASSWORD;

  if (username == null || password == null) {
    throw new Error(
      "E2E_CLERK_USER_USERNAME and E2E_CLERK_USER_PASSWORD must be set in environment variables",
    );
  }

  await page.goto("/");

  await clerk.signIn({
    page,
    signInParams: { strategy: "password", identifier: username, password },
  });

  await page.context().storageState({ path: authFile });
});
