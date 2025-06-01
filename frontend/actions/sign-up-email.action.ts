"use server";

import { headers } from "next/headers";
import { APIError } from "better-auth/api";

import { auth, ErrorCode } from "@/lib/auth";
import streamServerClient from "@/lib/stream";
import { generateUsername } from "@/lib/utils";
import { registerSchema, TRegister } from "@/lib/validations/auth";

export async function signUpEmailAction(data: TRegister) {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  const result = registerSchema.safeParse(data);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!result.success) {
    return { error: result.error.format() };
  }

  const { name, email, password } = result.data;
  const generatedUsername = generateUsername(name);

  try {
    // Register the user with Better Auth and get the response
    const response = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        username: generatedUsername,
      },
    });

    // If we have a userId in the response, register with Stream
    if (response?.user.id) {
      await streamServerClient.upsertUser({
        id: response.user.id,
        username: generatedUsername,
        name,
      });
    }

    return {
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
