import { z } from "zod";

export const entityZodSchema = z.object({
  id: z.string(),
  userId: z.string(),
  teamId: z.string(),
  workspaceId: z.string(),
  role: z.string(),
});

export type entitySchema = z.infer<typeof entityZodSchema>;
