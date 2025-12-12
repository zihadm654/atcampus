import { SkillLevel } from "@prisma/client";
import { z } from "zod";

const requiredString = z.string().trim().min(1, "Required");

export const signUpSchema = z.object({
  email: z.email("Invalid email address"),
  username: requiredString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, - and _ allowed",
  ),
  password: requiredString.min(8, "Must be at least 8 characters"),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  username: requiredString,
  password: requiredString,
});

export type LoginValues = z.infer<typeof loginSchema>;

export const createPostSchema = z.object({
  content: requiredString,
  mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 attachments"),
});

export const updateUserProfileSchema = z.object({
  name: requiredString,
  bio: z.string().max(1000, "Must be at most 1000 characters"),
  currentSemester: z.number().max(100, "required").optional(),
  // institution: z.string().max(100, "Must be at most 100 characters").optional(),
  // instituteId: z.string().optional(),
  website: z.url("Invalid URL").optional(),
  summary: z.string().max(1000, "Must be at most 1000 characters").optional(),
  location: z.string().max(1000, "Must be at most 1000 characters").optional(),
});

export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

export const updateUserSchoolSchema = z.object({
  name: requiredString,
  description: requiredString,
});

export type UpdateUserSchoolValues = z.infer<typeof updateUserSchoolSchema>;

export const createCommentSchema = z.object({
  content: requiredString,
});

export const userSkillSchema = z.object({
  name: requiredString
    .min(2, "Skill name must be at least 2 characters")
    .max(100, "Skill name must be at most 100 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_&+()#@]+$/,
      "Skill name can only contain letters, numbers, spaces, and common symbols",
    ),
  category: z
    .string()
    .min(2, "Category must be at least 2 characters")
    .max(50, "Category must be at most 50 characters")
    .regex(
      /^[a-zA-Z\s\-_&]+$/,
      "Category can only contain letters, spaces, and hyphens",
    )
    .optional()
    .or(z.literal("")),
  difficulty: z.enum(SkillLevel),
  yearsOfExperience: z
    .number()
    .min(0, "Years of experience must be at least 0")
    .max(50, "Years of experience must be at most 50")
    .int("Years of experience must be a whole number"),
});

export type TUserSkillSchema = z.infer<typeof userSkillSchema>;

// Define schema for school
export const schoolSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  faculties: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1),
      description: z.string().optional(),
    }),
  ),
});
export type TSchool = z.infer<typeof schoolSchema>;
