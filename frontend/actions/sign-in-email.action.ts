"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth, type ErrorCode } from "@/lib/auth";
import { loginSchema, type TLogin } from "@/lib/validations/auth";

export async function signInEmailAction(data: TLogin) {
  const result = loginSchema.safeParse(data);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!result.success) {
    return { error: result.error.format() };
  }
  const { email, password } = result.data;

  try {
    await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email,
        password,
      },
    });
    return {
      success: true,
      message: "Login successful. Good to have you back.",
    };
  } catch (err) {
    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : "UNKNOWN";
      console.dir(err, { depth: 5 });

      if (errCode === "EMAIL_NOT_VERIFIED") {
        redirect("/verify?error=email_not_verified");
      }
      return { error: err.message };
    }

    return { error: "Internal Server Error" };
  }
}
