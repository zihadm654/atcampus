import * as z from "zod";

export enum JobType {
  FULLTIME = "fulltime",
  PARTTIME = "parttime",
  CONTRACT = "contract",
  INTERSHIP = "internship",
  TEMPORARY = "temporary",
}
export enum ExperienceLevel {
  ENTRY = "entry",
  MID = "mid",
  SENIOR = "senior",
  EXECUTIVE = "executive",
}
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
  weeklyHours: z.coerce.number().max(100, "required"),
  location: z.string().max(100, "Must be at most 100 characters"),
  type: z.nativeEnum(JobType),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  duration: z.coerce.number().optional(),
  salary: z.coerce.number().min(1, "required"),
  requirements: z.array(
    z.string().max(1000, "Must be at most 1000 characters"),
  ),
  endDate: z.date(),
});

export type TJob = z.infer<typeof jobSchema>;
