import { CourseStatus } from "@prisma/client";
import * as z from "zod";

export const courseSchema = z.object({
  title: z.string().trim().min(1, "Required"),
  summary: z
    .string()
    .min(1, "summary is required")
    .max(500, "Must be at most 500 characters"),
  description: z
    .string()
    .min(1, "description is required")
    .max(5000, "Must be at most 5000 characters"),
  department: z
    .string()
    .min(1, "department is required")
    .max(1000, "Must be at most 1000 characters"),
  code: z
    .string()
    .min(1, "code is required")
    .max(20, "Must be at most 20 characters"),
  level: z.string().max(100, "Must be at most 100 characters").optional(),
  credits: z.coerce.number().min(1, "Credits must be at least 1").max(10, "Credits must be at most 10").optional(),
  status: z.nativeEnum(CourseStatus),
  estimatedHours: z.coerce.number().min(1, "Duration must be at least 1 week").max(52, "Duration must be at most 52 weeks").optional(),
  facultyId: z.string().min(1, "Faculty is required"),

  // Enhanced fields for approval workflow
  objectives: z.array(
    z.string().max(500, "Objective must be at most 500 characters")
  ).optional().default([]),
  outcomes: z.array(
    z.string().max(500, "Outcome must be at most 500 characters")
  ).optional().default([]),
  year: z.coerce.number().min(2020).max(2030).optional(),
});

export type TCourse = z.infer<typeof courseSchema>;