import * as z from "zod";

import { VALID_DOMAINS } from "../utils";

export const userAuthSchema = z.object({
  email: z.string().email(),
});

export enum UserRole {
  STUDENT = "STUDENT",
  ORGANIZATION = "ORGANIZATION",
  INSTITUTION = "INSTITUTION",
  PROFESSOR = "PROFESSOR",
}

export const registerSchema = z.object({
  role: z.nativeEnum(UserRole), // Make role optional initially
  instituteId: z.coerce.string().min(3, "instituteId is required"),
  institution: z.string().trim().min(3, "institution is required"),
  name: z.string().trim().min(3, "username is required").max(255),
  email: z
    .string()
    .trim()
    .email()
    .min(3, "email is required")
    .refine((email) => VALID_DOMAINS().includes(email.split("@")[1])),
  password: z.string().trim().min(8, "password is required"),
});

export type TRegister = z.infer<typeof registerSchema>;
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" }),
});

export type TLogin = z.infer<typeof loginSchema>;
