import { expect, test } from "@playwright/test";

test.describe("example", () => {
  test("example", async ({ page }) => {
    const workspaceId = process.env.E2E_TEST_TEAM_ID;

    await page.goto(`/workspaces/${workspaceId}/examples`);
    await expect(page).toHaveURL(/.*\/workspaces\/.+\/examples/);

    const createButton = page.getByTestId("example-create-button");
    await createButton.click();

    const exampleItems = page.getByTestId("example-list-item");
    await expect(exampleItems).toHaveCount(2);

    const createdExampleLink = exampleItems.first().getByRole("link");
    await expect(createdExampleLink).toBeVisible();
    await createdExampleLink.click();

    await expect(page).toHaveURL(/.*\/workspaces\/.+\/examples\/.+/);

    const nameInput = page.getByTestId("example-name-input");
    await nameInput.clear();
    await nameInput.fill("Updated Test Example");

    const submitButton = page.getByTestId("example-submit-button");
    await submitButton.click();

    await expect(nameInput).toHaveValue("Updated Test Example");

    const removeButton = page.getByTestId("example-remove-button");
    await removeButton.click();

    await expect(page).toHaveURL(/.*\/workspaces\/.+\/examples/);
  });
});
