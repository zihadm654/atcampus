"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInEmailAction } from "@/actions/sign-in-email.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { loginSchema, TLogin } from "@/lib/validations/auth";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/shared/icons";

import { SignInOauthButton } from "../auth/sign-in-oauth-button";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: string;
}

export function UserAuthForm({ className, type, ...props }: UserAuthFormProps) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<TLogin>({
    resolver: zodResolver(loginSchema),
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);

  const router = useRouter();

  async function onSubmit(data: TLogin) {
    setIsLoading(true);

    const res = await signInEmailAction(data);
    if (res.error) {
      toast.error(
        typeof res.error === "string" ? res.error : "Registration failed",
      );
      setIsLoading(false);
    } else {
      reset();
      toast.success("Login successfully", {
        description: res.message,
      });
      router.push("/");
    }
    setIsLoading(false);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || isGoogleLoading}
              {...register("email")}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-1">
            <div className="flex items-center justify-between gap-2">
              <Label className="sr-only" htmlFor="password">
                Password
              </Label>
              <Link
                tabIndex={-1}
                href="/forgot-password"
                className="text-muted-foreground hover:text-foreground text-sm italic"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              placeholder="********"
              type="password"
              autoCapitalize="none"
              autoComplete="none"
              autoCorrect="off"
              disabled={isLoading || isGoogleLoading}
              {...register("password")}
            />
            {errors?.password && (
              <p className="px-1 text-xs text-red-600">
                {errors?.email?.message}
              </p>
            )}
          </div>
          <button className={cn(buttonVariants())} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            {type === "register" ? "Sign Up with Email" : "Sign In with Email"}
          </button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">
            Or continue with
          </span>
        </div>
      </div>
      {/* <SignInOauthButton provider="google" /> */}
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }))}
        onClick={async () => {
          setIsGoogleLoading(true);
          await signIn.social({
            provider: "google",
            callbackURL: "/",
            errorCallbackURL: "/login/error",
          });
        }}
        disabled={isLoading || isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Icons.spinner className="mr-2 size-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 size-4" />
        )}{" "}
        Google
      </button>
    </div>
  );
}
