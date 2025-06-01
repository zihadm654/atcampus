"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signUpEmailAction } from "@/actions/sign-up-email.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, GraduationCap, HomeIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { registerSchema, TRegister, UserRole } from "@/lib/validations/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/shared/icons";

interface UserRegisterFormProps {
  className?: string;
}

const roleIcons: Record<UserRole, React.ElementType> = {
  STUDENT: GraduationCap,
  ORGANIZATION: Briefcase,
  INSTITUTION: HomeIcon, // Or UsersIcon if HomeIcon is not suitable
};

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const {
    control, // Added control for Select component
    register,
    reset,
    handleSubmit,
    formState: { errors, isValid }, // Added isValid for step validation
    trigger, // Added trigger to manually trigger validation
    watch, // Added watch to observe form values
  } = useForm<TRegister>({
    resolver: zodResolver(registerSchema),
    mode: "onChange", // Validate on change for better UX
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      role: undefined, // Default to undefined or a specific role if preferred
    },
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);

  const router = useRouter();

  const role = watch("role");

  async function onSubmit(data: TRegister) {
    setIsLoading(true);

    try {
      const result = await signUpEmailAction(data);

      if (result.error) {
        if (typeof result.error === "string") {
          toast.error(result.error);
        } else {
          toast.error("Please check the form for errors");
        }
      } else if (result.success) {
        reset();
        router.push("/register/success");
        toast.success(
          result.message || "Verification link has been sent to your mail",
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof TRegister)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["role"];
    }
    // Add more steps and fields to validate as needed

    const isValidStep = await trigger(fieldsToValidate);
    if (isValidStep) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          {currentStep === 1 && (
            <div className="grid gap-1 place-self-center">
              <Label htmlFor="role">Choose Your Role</Label>
              <Controller
                name="role"
                control={control}
                rules={{ required: "Role is required" }} // Add required rule
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading || isGoogleLoading}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(UserRole).map((roleValue) => {
                        const IconComponent = roleIcons[roleValue];
                        return (
                          <SelectItem key={roleValue} value={roleValue}>
                            <div className="flex items-center">
                              {IconComponent && (
                                <IconComponent className="mr-2 h-4 w-4" />
                              )}
                              {roleValue.charAt(0).toUpperCase() +
                                roleValue.slice(1).toLowerCase()}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors?.role && (
                <p className="px-1 text-xs text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <>
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
                  {...register("name", { required: "Name is required" })}
                />
                {errors?.name && (
                  <p className="px-1 text-xs text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="example@gamil.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading || isGoogleLoading}
                  {...register("email", { required: "Email is required" })}
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
                  autoComplete="new-password" // Use new-password for password managers
                  autoCorrect="off"
                  disabled={isLoading || isGoogleLoading}
                  {...register("password", {
                    required: "Password is required",
                  })}
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
                  autoComplete="new-password"
                  autoCorrect="off"
                  disabled={isLoading || isGoogleLoading}
                  {...register("confirmPassword", {
                    required: "Confirm password is required",
                  })}
                />
                {errors?.confirmPassword && (
                  <p className="px-1 text-xs text-red-600">
                    {errors?.confirmPassword?.message}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="flex items-center justify-between gap-1">
            {currentStep > 1 && (
              <Button
                type="button"
                onClick={prevStep}
                className={cn(buttonVariants({ variant: "outline" }))}
                disabled={isLoading}
              >
                Previous
              </Button>
            )}
            {currentStep < 2 && (
              <Button
                type="button"
                onClick={nextStep}
                className={cn(buttonVariants())}
                disabled={isLoading || (currentStep === 1 && !role)}
              >
                Next
              </Button>
            )}
            {currentStep === 2 && (
              <Button
                type="submit"
                className={cn(buttonVariants())}
                disabled={isLoading || !isValid} // Disable if form is not valid
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                )}
                Sign up with Email
              </Button>
            )}
          </div>
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
