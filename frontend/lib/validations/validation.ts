import { SkillLevel } from "@prisma/client";
import { nativeEnum, z } from "zod";

const requiredString = z.string().trim().min(1, "Required");

export const signUpSchema = z.object({
  email: requiredString.email("Invalid email address"),
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
  currentSemester: z.coerce.number().max(100, "required").optional(),
  institution: z.string().max(100, "Must be at most 100 characters").optional(),
  instituteId: z.string().optional(),
});
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
  title: requiredString,
  category: requiredString,
  level: nativeEnum(SkillLevel),
  yearsOfExperience: z.coerce
    .number()
    .min(0, "at least one year of experience"),
});

export type TUserSkillSchema = z.infer<typeof userSkillSchema>;
