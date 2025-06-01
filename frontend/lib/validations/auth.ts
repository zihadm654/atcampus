import * as z from "zod";

export const userAuthSchema = z.object({
  email: z.string().email(),
});

export enum UserRole {
  STUDENT = "STUDENT",
  ORGANIZATION = "ORGANIZATION",
  INSTITUTION = "INSTITUTION",
}

export const registerSchema = z
  .object({
    role: z.nativeEnum(UserRole), // Make role optional initially
    name: z.string().trim().min(3, "name is required").max(255),
    email: z.string().trim().email().min(3, "email is required"),
    password: z.string().trim().min(8, "password is required"),
    confirmPassword: z.string().trim().min(8),
  })
  .refine(
    (data) => {
      // If password is provided, confirmPassword must also be provided
      if (data.password && !data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Confirm password is required",
      path: ["confirmPassword"],
    },
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type TRegister = z.infer<typeof registerSchema>;
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" }),
});

export type TLogin = z.infer<typeof loginSchema>;
