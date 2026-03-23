import { Resend } from "resend";

const RATE_LIMIT_INTERVAL_MS = 500;

export async function sendEmail({
  from,
  to,
  subject,
  body,
  idempotencyKey,
  attachments,
}: {
  from: string;
  to: string[];
  subject: string;
  body: string;
  idempotencyKey?: string;
  attachments?: { filename: string; content: Buffer }[];
}) {
  await sleep({ ms: RATE_LIMIT_INTERVAL_MS });

  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from,
    to,
    subject,
    text: body,
    headers:
      idempotencyKey != null
        ? { "Idempotency-Key": idempotencyKey }
        : undefined,
    attachments:
      attachments != null && attachments.length > 0 ? attachments : undefined,
  });

  if (error != null) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

function sleep({ ms }: { ms: number }) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
