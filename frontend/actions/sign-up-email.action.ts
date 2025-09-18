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

  // Status is now handled by auth.ts database hooks based on role
  // No need to set it here - keeping the logic centralized

  // Add logging for debugging purposes
  console.log("Registration data being sent:", {
    name,
    email,
    role,
    institution,
    instituteId,
    phone
  });

  try {
    // Register the user with Better Auth and get the response
    const res = await auth.api.signUpEmail({
      body: {
        name,
        username: generatedUsername,
        email,
        password,
        role: role, // Ensure role is explicitly passed
        phone: phone ?? "",
        institution: institution ?? "",
        instituteId: instituteId ?? "",
        callbackURL: "/dashboard"
      },
    });

    // If we have a userId in the response, register with Stream
    // if (res?.user.id) {
    //   await streamServerClient.upsertUser({
    //     id: res.user.id,
    //     name: res.user.name,
    //   });
    // }

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
          return { error: "Oops! Something went wrong. Please try again." };
        default:
          return { error: err.message };
      }
    }

    return { error: "Internal Server Error" };
  }
}
