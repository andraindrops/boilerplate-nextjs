import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "@/lib/db";
import * as email from "@/lib/email";

import * as notificationService from "@/services/shared/notification";

import { cleanupDatabase } from "@/tests/_helpers/cleanup";

vi.mock("@/lib/email");
vi.mock("@/lib/storage/server");

describe("notificationService", () => {
  beforeEach(async () => {
    await cleanupDatabase();
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("creates notifications in the database", async () => {
      await db.$transaction(async (tx) => {
        await notificationService.create({
          tx,
          notifications: [
            {
              type: "test",
              recipientEmail: "user1@example.com",
              recipientName: "Test User 1",
              subject: "hello, world 1",
              body: "hello, world 1 body",
              attachmentKeys: [],
              idempotencyKey: "key-1",
            },
            {
              type: "test",
              recipientEmail: "user2@example.com",
              recipientName: "Test User 2",
              subject: "hello, world 2",
              body: "hello, world 2 body",
              attachmentKeys: [],
              idempotencyKey: "key-2",
            },
          ],
        });
      });

      const notifications = await db.notification.findMany();

      expect(notifications[0]).toMatchObject({
        recipientEmail: "user1@example.com",
        subject: "hello, world 1",
        status: "pending",
      });
      expect(notifications[1]).toMatchObject({
        recipientEmail: "user2@example.com",
        subject: "hello, world 2",
        status: "pending",
      });
    });
  });

  describe("run", () => {
    it("sends pending notifications and marks them as sent", async () => {
      vi.mocked(email.sendEmail).mockResolvedValue(undefined);

      await db.notification.create({
        data: {
          type: "test",
          recipientEmail: "user1@example.com",
          recipientName: "Test User 1",
          subject: "hello, world 1",
          body: "hello, world 1 body",
          attachmentKeys: [],
          idempotencyKey: "key-run-1",
          status: "pending",
          nextRetryAt: new Date(Date.now() - 1000),
        },
      });
      await db.notification.create({
        data: {
          type: "test",
          recipientEmail: "user2@example.com",
          recipientName: "Test User 2",
          subject: "hello, world 2",
          body: "hello, world 2 body",
          attachmentKeys: [],
          idempotencyKey: "key-run-2",
          status: "pending",
          nextRetryAt: new Date(Date.now() - 1000),
        },
      });

      const result = await notificationService.run();

      expect(result.processed).toBe(2);
      expect(result.passCount).toBe(2);
      expect(result.failCount).toBe(0);

      const notifications = await db.notification.findMany();

      expect(notifications[0]).toMatchObject({
        recipientEmail: "user1@example.com",
        subject: "hello, world 1",
        status: "sent",
      });
      expect(notifications[1]).toMatchObject({
        recipientEmail: "user2@example.com",
        subject: "hello, world 2",
        status: "sent",
      });
    });
  });
});
