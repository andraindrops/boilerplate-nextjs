import { Prisma, type PrismaClient } from "@/generated/prisma/client";

import db from "@/lib/db";
import * as email from "@/lib/email";
import * as storage from "@/lib/storage/server";

import { STORAGE_TYPES } from "@/services/shared/storage";

type TransactionClient = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

const BATCH_SIZE = 10;
const STALE_PROCESSING_MINUTES = 10;

export async function create({
  tx,
  notifications,
}: {
  tx: TransactionClient;
  notifications: {
    type: string;
    recipientEmail: string;
    recipientName: string;
    subject: string;
    body: string;
    attachmentKeys: { key: string; filename: string }[];
    idempotencyKey: string;
  }[];
}) {
  if (notifications.length === 0) return;

  await tx.notification.createMany({ data: notifications });
}

export async function run() {
  const notifications = await db.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<
      {
        id: string;
        recipientEmail: string;
        recipientName: string;
        subject: string;
        body: string;
        attachmentKeys: { key: string; filename: string }[];
        idempotencyKey: string;
        attemptCount: number;
        maxAttempts: number;
      }[]
    >`
      SELECT id, "recipientEmail", "recipientName", subject, body, "attachmentKeys", "idempotencyKey", "attemptCount", "maxAttempts"
      FROM "Notification"
      WHERE (
        status IN ('pending', 'failed') AND "nextRetryAt" <= NOW()
      ) OR (
        status = 'processing' AND "updatedAt" < NOW() - INTERVAL '${Prisma.raw(String(STALE_PROCESSING_MINUTES))} minutes'
      )
      ORDER BY "nextRetryAt" ASC
      LIMIT ${BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    `;

    if (rows.length === 0) {
      return rows;
    }

    await tx.notification.updateMany({
      where: { id: { in: rows.map((r) => r.id) } },
      data: { status: "processing" },
    });

    return rows;
  });

  let passCount = 0;
  let failCount = 0;

  for (const notification of notifications) {
    try {
      const attachments: { filename: string; content: Buffer }[] = [];

      for (const { key, filename } of notification.attachmentKeys ?? []) {
        try {
          const result = await storage.getBlob({
            storageTypes: STORAGE_TYPES,
            key,
          });

          if (result == null || result.statusCode !== 200) continue;

          const buffer = Buffer.from(
            await new Response(result.stream).arrayBuffer(),
          );

          attachments.push({ filename, content: buffer });
        } catch (e) {
          console.error(`Failed to fetch attachment ${key}:`, e);
        }
      }

      await email.sendEmail({
        from: getEmailFrom(),
        to: [notification.recipientEmail],
        subject: notification.subject,
        body: notification.body,
        idempotencyKey: notification.idempotencyKey,
        attachments,
      });

      await db.notification.update({
        where: { id: notification.id },
        data: { status: "sent", sentAt: new Date() },
      });

      passCount++;
    } catch (error) {
      console.error(`Failed to send notification ${notification.id}:`, error);

      const nextAttemptCount = notification.attemptCount + 1;
      const isDeadLetter = nextAttemptCount >= notification.maxAttempts;

      const backoffMinutes = 2 ** nextAttemptCount;
      const nextRetryAt = new Date(Date.now() + backoffMinutes * 60 * 1000);

      await db.notification.update({
        where: { id: notification.id },
        data: {
          status: isDeadLetter ? "dead_letter" : "failed",
          attemptCount: nextAttemptCount,
          nextRetryAt: isDeadLetter ? undefined : nextRetryAt,
          lastError: error instanceof Error ? error.message : String(error),
        },
      });

      failCount++;
    }
  }

  return {
    processed: notifications.length,
    passCount,
    failCount,
  };
}

function getEmailFrom() {
  const emailFrom = process.env.EMAIL_FROM;

  if (emailFrom == null) {
    throw new Error("EMAIL_FROM environment variable is not set");
  }

  return emailFrom;
}
