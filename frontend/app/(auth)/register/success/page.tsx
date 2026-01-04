import { ReturnButton } from "@/components/auth/return-button";

export default function Page() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-8 py-16">
      <div className="space-y-4">
        <ReturnButton href="/login" label="Login" />

        <h1 className="font-bold text-3xl">Success</h1>

        <p className="text-muted-foreground">
          Congratulations! You have successfully registered. Please check your
          email for the verification link.
        </p>
      </div>
    </div>
  );
}
