"use server";

import { APIError } from "better-auth/api";

import { auth, ErrorCode } from "@/lib/auth";
import { registerSchema, TRegister } from "@/lib/validations/auth";

export async function signUpEmailAction(data: TRegister) {
  const result = registerSchema.safeParse(data);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!result.success) {
    return { error: result.error.format() };
  }
  const { name, username, email, password } = result.data;

  try {
    await auth.api.signUpEmail({
      body: {
        name,
        username,
        email,
        password,
      },
    });
    return {
      success: true,
      message: "Registation successful. Welcome to our site.",
    };
  } catch (err) {
    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : "UNKNOWN";

      switch (errCode) {
        case "USER_ALREADY_EXISTS":
          return { error: "Oops! Something went wrong. Please try again." };
        default:
          return { error: err.message };
      }
    }

    return { error: "Internal Server Error" };
  }
}
