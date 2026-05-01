import { z } from "zod";

export const entityZodSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
});

export const createZodSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
});

export const updateZodSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
});

export type entitySchema = z.infer<typeof entityZodSchema>;
export type createSchema = z.infer<typeof createZodSchema>;
export type updateSchema = z.infer<typeof updateZodSchema>;
