"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { signInEmailAction } from "@/actions/sign-in-email.action";
import { Icons } from "@/components/shared/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { loginSchema, type TLogin } from "@/lib/validations/auth";

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
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

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
      // Redirect to the intended destination or home page
      router.push(from);
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
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || isGoogleLoading}
              id="email"
              placeholder="name@example.com"
              type="email"
              {...register("email")}
            />
            {errors?.email && (
              <p className="px-1 text-red-600 text-xs">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-1">
            <div className="flex items-center justify-end gap-2">
              <Label className="sr-only" htmlFor="password">
                Password
              </Label>
              <Link
                className="text-muted-foreground text-sm italic hover:text-foreground"
                href="/forgot-password"
                tabIndex={-1}
              >
                Forgot password?
              </Link>
            </div>
            <Input
              autoCapitalize="none"
              autoComplete="none"
              autoCorrect="off"
              disabled={isLoading || isGoogleLoading}
              id="password"
              placeholder="********"
              type="password"
              {...register("password")}
            />
            {errors?.password && (
              <p className="px-1 text-red-600 text-xs">
                {errors?.email?.message}
              </p>
            )}
          </div>
          <Button
            className={cn(buttonVariants({ variant: "default" }))}
            disabled={isLoading}
            type="submit"
          >
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            {type === "register" ? "Sign Up with Email" : "Sign In with Email"}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      {/* <SignInOauthButton provider="google" /> */}
      <Button
        className={cn(buttonVariants({ variant: "default" }))}
        disabled={isLoading || isGoogleLoading}
        onClick={async () => {
          setIsGoogleLoading(true);
          await signIn.social({
            provider: "google",
            callbackURL: from, // Use the 'from' parameter for OAuth callback
            errorCallbackURL: "/login/error",
          });
        }}
        type="button"
      >
        {isGoogleLoading ? (
          <Icons.spinner className="mr-2 size-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 size-4" />
        )}{" "}
        Google
      </Button>
    </div>
  );
}
