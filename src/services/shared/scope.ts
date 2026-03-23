// biome-ignore lint/suspicious/noExplicitAny: Prisma transaction client type varies by configuration
export type TransactionClient = any;

export class AccessDeniedError extends Error {
  constructor() {
    super("Access denied");
  }
}
