import * as z from "zod";

export const userAuthSchema = z.object({
  email: z.string().email(),
});
export const registerSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email().min(1, {
      message: "Email is required",
    }),
    password: z.string().min(6, { message: "Password is required" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Confirm password is required" }),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" }),
});

export type TRegister = z.infer<typeof registerSchema>;
export type TLogin = z.infer<typeof loginSchema>;
