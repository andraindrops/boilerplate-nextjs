import { expect, test } from "@playwright/test";

test.describe("task", () => {
  test("task", async ({ page }) => {
    const workspaceId = process.env.E2E_TEST_TEAM_ID;

    await page.goto(`/workspaces/${workspaceId}/tasks`);
    await expect(page).toHaveURL(/.*\/workspaces\/.+\/tasks/);

    const createButton = page.getByTestId("task-create-button");
    await createButton.click();

    const taskItems = page.getByTestId("task-list-item");
    await expect(taskItems).toHaveCount(2);

    const createdTaskLink = taskItems.first().getByRole("link");
    await expect(createdTaskLink).toBeVisible();
    await createdTaskLink.click();

    await expect(page).toHaveURL(/.*\/workspaces\/.+\/tasks\/.+/);

    const nameInput = page.getByTestId("task-name-input");
    await nameInput.clear();
    await nameInput.fill("Updated Test Task");

    const contentInput = page.getByTestId("task-content-input");
    await contentInput.clear();
    await contentInput.fill("Updated Task Content");

    const submitButton = page.getByTestId("task-submit-button");
    await submitButton.click();

    await expect(nameInput).toHaveValue("Updated Test Task");
    await expect(contentInput).toHaveValue("Updated Task Content");
    await expect(page.getByTestId("task-run-button")).toBeVisible();

    const removeButton = page.getByTestId("task-remove-button");
    await removeButton.click();

    await expect(page).toHaveURL(/.*\/workspaces\/.+\/tasks/);
  });
});
