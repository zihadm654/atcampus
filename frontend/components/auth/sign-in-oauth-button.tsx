"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface SignInOauthButtonProps {
  provider: "google" | "github";
  signUp?: boolean;
}

export const SignInOauthButton = ({
  provider,
  signUp,
}: SignInOauthButtonProps) => {
  const [isPending, setIsPending] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  async function handleClick() {
    setIsPending(true);

    await signIn.social({
      provider,
      callbackURL: from, // Use the 'from' parameter for OAuth callback
      errorCallbackURL: "/login/error",
    });

    setIsPending(false);
  }

  const action = signUp ? "Up" : "In";
  const providerName = provider === "google" ? "Google" : "GitHub";

  return (
    <Button onClick={handleClick} disabled={isPending}>
      Sign {action} with {providerName}
    </Button>
  );
};