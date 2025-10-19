import { ReturnButton } from "@/components/auth/return-button";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export default function Page() {
  return (
    <div className="container mx-auto max-w-screen-lg space-y-8 px-8 py-16">
      <div className="space-y-4">
        <ReturnButton href="/login" label="Login" />

        <h1 className="font-bold text-3xl">Forgot Password</h1>

        <p className="text-muted-foreground">
          Please enter your email address to receive a password reset link.
        </p>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
