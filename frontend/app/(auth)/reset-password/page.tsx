import { redirect } from "next/navigation";

import { ReturnButton } from "@/components/auth/return-button";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

interface PageProps {
  searchParams: Promise<{ token: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const token = (await searchParams).token;

  if (!token) redirect("/login");

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-8 py-16">
      <div className="space-y-4">
        <ReturnButton href="/login" label="Login" />

        <h1 className="font-bold text-3xl">Reset Password</h1>

        <p className="text-muted-foreground">
          Please enter your new password. Make sure it is at least 6 characters.
        </p>

        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
