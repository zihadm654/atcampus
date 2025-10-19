import Link from "next/link";
import { Suspense } from "react";
import { UserAuthForm } from "@/components/forms/user-register-form";
import BlurImage from "@/components/shared/blur-image";
import { Icons } from "@/components/shared/icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Create an account",
  description: "Create an account to get started.",
};

export default function RegisterPage() {
  return (
    <div className="container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "absolute top-4 right-4 md:top-8 md:right-8"
        )}
        href="/login"
      >
        Login
        <Icons.chevronRight className="mr-2 h-4 w-4" />
      </Link>
      <div className="hidden h-full flex-col place-items-center items-center justify-center gap-2 bg-muted lg:flex">
        <BlurImage
          alt="logo"
          className="place-items-center justify-center"
          height={100}
          src="/_static/logo1.png"
          width={100}
        />
        <h1 className="font-semibold text-2xl tracking-tight">
          Create an account
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your email below to create your account
        </p>
        <p className="px-8 text-center text-muted-foreground text-sm">
          By clicking continue, you agree to our <br />
          <Link
            className="underline underline-offset-4 hover:text-brand"
            href="/terms"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            className="underline underline-offset-4 hover:text-brand"
            href="/privacy"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
      <div className="lg:p-6">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[40rem]">
          <Suspense>
            <UserAuthForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
