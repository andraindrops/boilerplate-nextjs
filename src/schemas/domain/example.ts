import { z } from "zod";

export const entityZodSchema = z.object({
  id: z.string(),
  name: z.string(),
  internalImageKey: z.string().nullable(),
  internalImageUrl: z.string().nullable(),
  externalImageKey: z.string().nullable(),
  externalImageUrl: z.string().nullable(),
});

export const createZodSchema = z.object({
  name: z.string().min(1),
});

export const updateZodSchema = z.object({
  name: z.string().min(1),
  internalImageKey: z.string().nullable(),
  externalImageKey: z.string().nullable(),
});

export type entitySchema = z.infer<typeof entityZodSchema>;
export type createSchema = z.infer<typeof createZodSchema>;
export type updateSchema = z.infer<typeof updateZodSchema>;
