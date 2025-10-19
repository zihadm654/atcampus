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
  ADMIN = "ADMIN",
}

export const registerSchema = z.object({
  role: z.enum(
    ["STUDENT", "ORGANIZATION", "INSTITUTION", "PROFESSOR", "ADMIN"],
    {
      required_error: "You need to select a notification type.",
    }
  ),
  instituteId: z.coerce.string().optional(),
  institution: z.string().trim().optional(),
  phone: z.coerce
    .string()
    .refine((phone) => phone.length === 10 || phone.length === 11)
    .optional(),
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
