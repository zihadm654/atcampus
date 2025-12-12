import * as z from "zod";

export const courseSchema = z.object({
  title: z.string().trim().min(1, "Required"),
  description: z
    .string()
    .min(1, "description is required")
    .max(5000, "Must be at most 5000 characters"),
  code: z
    .string()
    .min(1, "code is required")
    .max(20, "Must be at most 20 characters"),
  difficulty: z.string().max(100, "Must be at most 100 characters").optional(),
  credits: z
    .number()
    .min(1, "Credits must be at least 1")
    .max(10, "Credits must be at most 10")
    .optional(),
  estimatedHours: z
    .number()
    .min(1, "Duration must be at least 1 week")
    .max(52, "Duration must be at most 52 weeks")
    .optional(),
  schoolId: z.string().min(1, "school is required"),
  facultyId: z.string().min(1, "Faculty is required"),
  status: z.string().min(1, "Status is required"),

  // Enhanced fields for approval workflow
  objectives: z
    .string()
    .max(500, "Objective must be at most 500 characters")
    .optional(),

  // Skills field for course skills
  skills: z.array(z.string()).optional(),
});

export type TCourse = z.infer<typeof courseSchema>;
