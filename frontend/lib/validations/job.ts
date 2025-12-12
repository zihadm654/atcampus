import { ExperienceLevel, JobType } from "@prisma/client";
import { z } from "zod/v3";

export const jobSchema = z.object({
  title: z.string().trim().min(1, "Required"),
  description: z
    .string()
    .min(1, "description is required")
    .max(1000, "Must be at most 1000 characters"),
  summary: z
    .string()
    .min(1, "description is required")
    .max(1000, "Must be at most 1000 characters"),
  weeklyHours: z.number().max(100, "required"),
  location: z.string().max(100, "Must be at most 100 characters"),
  type: z.nativeEnum(JobType),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  duration: z.number().optional(),
  salary: z.number().min(1, "required"),
  endDate: z.date(),
  courseIds: z.array(z.string()).optional(),
  // Skills are now stored directly as an array of strings
  skills: z.array(z.string()).optional(),
});

export type TJob = z.infer<typeof jobSchema>;
