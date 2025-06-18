import * as z from "zod";

export const jobSchema = z.object({
  title: z.string().trim().min(1, "Required"),
  description: z
    .string()
    .min(1, "description is required")
    .max(1000, "Must be at most 1000 characters"),
  weeklyHours: z.coerce.number().max(100, "required"),
  location: z.string().max(100, "Must be at most 100 characters"),
  type: z.string().trim().min(1, "required"),
  experienceLevel: z.string().trim().min(1, "required"),
  duration: z.coerce.number().min(1, "required"),
  salary: z.coerce.number().min(1, "required"),
  requirements: z.array(
    z.string().max(1000, "Must be at most 1000 characters"),
  ),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type TJob = z.infer<typeof jobSchema>;
