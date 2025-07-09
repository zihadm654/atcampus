import * as z from "zod";

export const researchSchema = z.object({
  title: z.string().trim().min(1, "Required"),
  description: z
    .string()
    .min(1, "description is required")
    .max(1000, "Must be at most 1000 characters"),
  mediaIds: z.array(z.string()).optional(),
});

export type TResearch = z.infer<typeof researchSchema>;
