import * as z from "zod";

import { VALID_DOMAINS } from "../utils";

export const userAuthSchema = z.object({
  email: z.email(),
});

export enum UserRole {
  STUDENT = "STUDENT",
  ORGANIZATION = "ORGANIZATION",
  INSTITUTION = "INSTITUTION",
  PROFESSOR = "PROFESSOR",
  ADMIN = "ADMIN",
}

export const registerSchema = z.object({
  role: z.enum([
    "STUDENT",
    "ORGANIZATION",
    "INSTITUTION",
    "PROFESSOR",
    "ADMIN",
  ]),
  name: z.string().trim().min(3, "username is required").max(255),
  email: z
    .email()
    .min(3, "email is required")
    .refine((email) => VALID_DOMAINS().includes(email.split("@")[1])),
  password: z.string().trim().min(8, "password is required"),
  instituteId: z.string().optional(),
  institution: z.string().optional(),
  phone: z
    .string()
    .refine((phone) => phone.length === 10 || phone.length === 11)
    .optional(),
});

export type TRegister = z.infer<typeof registerSchema>;
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, { message: "Password is required" }),
});

export type TLogin = z.infer<typeof loginSchema>;
