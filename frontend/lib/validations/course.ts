import * as z from "zod";

export enum Status {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived"
}

export const courseSchema = z.object({
  title: z.string().trim().min(1, "Required"),
  description: z
    .string()
    .min(1, "description is required")
    .max(1000, "Must be at most 1000 characters"),
  code: z
    .string()
    .min(1, "code is required")
    .max(1000, "Must be at most 1000 characters"),
  level: z.string().max(100, "Must be at most 100 characters").optional(),
  credits: z.coerce.number().max(100, "required").optional(),
  status: z.nativeEnum(Status),
  duration: z.coerce.number().optional(),
  prerequisites: z.array(
    z.string().max(1000, "Must be at most 1000 characters"),
  ),
  facultyId: z.string().min(1, "Faculty is required"),
});

export type TCourse = z.infer<typeof courseSchema>;
