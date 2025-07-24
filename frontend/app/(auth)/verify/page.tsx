import { redirect } from "next/navigation";

import { ReturnButton } from "@/components/auth/return-button";
import { SendVerificationEmailForm } from "@/components/forms/send-verification-email-form";

interface PageProps {
  searchParams: Promise<{ error: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const error = (await searchParams).error;

  if (!error) redirect("/");

  return (
    <div className="container mx-auto max-w-screen-lg space-y-8 px-8 py-16">
      <div className="space-y-4">
        <ReturnButton href="/login" label="Login" />

        <h1 className="text-3xl font-bold">Verify Email</h1>
      </div>

      <p className="text-destructive">
        <span className="capitalize">
          {error.replace(/_/g, " ").replace(/-/g, " ")}
        </span>{" "}
        - Please request a new verification email.
      </p>

      <SendVerificationEmailForm />
    </div>
  );
}
