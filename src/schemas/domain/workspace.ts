import { z } from "zod";

export const entityZodSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type entitySchema = z.infer<typeof entityZodSchema>;
