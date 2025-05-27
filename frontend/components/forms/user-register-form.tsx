"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signUpEmailAction } from "@/actions/sign-up-email.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { signIn, signUp } from "@/lib/auth-client";
import { cn, generateUsername } from "@/lib/utils";
import { registerSchema, TRegister } from "@/lib/validations/auth";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/shared/icons";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: string;
}

export function UserAuthForm({ className, type, ...props }: UserAuthFormProps) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<TRegister>({
    resolver: zodResolver(registerSchema),
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);

  const router = useRouter();

  async function onSubmit(data: TRegister) {
    setIsLoading(true);
    const generatedUsername = generateUsername(data.name);
    // const res = await signUpEmailAction(data);
    try {
      await signUp.email(
        {
          name: data.name,
          email: data.email,
          password: data.password,
          username: generatedUsername,
          callbackURL: "/",
        },
        {
          onResponse: () => {
            setIsLoading(false);
          },
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            reset();
            router.push("/register/success");
            toast.success("Verification link has been sent to your mail");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            setIsLoading(false);
          },
        },
      );
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }

    setIsLoading(false);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              type="text"
              autoCapitalize="none"
              autoComplete="name"
              autoCorrect="off"
              disabled={isLoading || isGoogleLoading}
              {...register("name")}
            />
            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
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
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
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
                {errors?.password?.message}
              </p>
            )}
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="confirm-password">
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              placeholder="********"
              type="password"
              autoCapitalize="none"
              autoComplete="none"
              autoCorrect="off"
              disabled={isLoading || isGoogleLoading}
              {...register("confirmPassword")}
            />
            {errors?.confirmPassword && (
              <p className="px-1 text-xs text-red-600">
                {errors?.confirmPassword?.message}
              </p>
            )}
          </div>
          <button className={cn(buttonVariants())} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            Sign up with Email
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
