"use server";

import { APIError } from "better-auth/api";
import { auth, type ErrorCode } from "@/lib/auth";
import streamServerClient from "@/lib/stream";
import { generateUsername } from "@/lib/utils";
import { registerSchema, type TRegister } from "@/lib/validations/auth";

export async function signUpEmailAction(data: TRegister) {
  const result = registerSchema.safeParse(data);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!result.success) {
    return { error: result.error.format() };
  }

  const { name, email, password, institution, phone, role, instituteId } =
    result.data;
  const generatedUsername = generateUsername(name);

  try {
    // Register the user with Better Auth and get the response
    const res = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        role, // Ensure role is explicitly passed with correct type
        username: generatedUsername,
        phone: phone ?? undefined,
        institution: institution ?? undefined,
        instituteId: instituteId ?? undefined,
        callbackURL: "/dashboard",
      },
    });

    // If we have a userId in the response, register with Stream
    if (res?.user.id) {
      await streamServerClient.upsertUser({
        id: res.user.id,
        name: res.user.name,
      });
    }

    return {
      res,
      success: true,
      message: "Registration successful. Welcome to our site.",
    };
  } catch (err) {
    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : "UNKNOWN";

      switch (errCode) {
        case "USER_ALREADY_EXISTS":
          return {
            error:
              "A user with this email already exists. Please try logging in instead.",
          };
        case "INVALID_EMAIL":
          return {
            error: "Please provide a valid institutional email address.",
          };
        default:
          return { error: err.message };
      }
    }

    console.error("Registration error:", err);
    return { error: "Internal Server Error. Please try again later." };
  }
}
