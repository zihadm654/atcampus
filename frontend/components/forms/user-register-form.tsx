"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, GraduationCap, HomeIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { signUpEmailAction } from "@/actions/sign-up-email.action";
import { Icons } from "@/components/shared/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { registerSchema, type TRegister } from "@/lib/validations/auth";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { UserRole } from "@prisma/client";

interface UserRegisterFormProps {
  className?: string;
}

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const form = useForm<TRegister>({
    resolver: zodResolver(registerSchema),
    mode: "onChange", // Validate on change for better UX
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: UserRole.STUDENT,
      institution: "",
      instituteId: "",
    },
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const role = form.watch("role");
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
        form.reset();
        if (data.role === "INSTITUTION" || data.role === "ORGANIZATION") {
          router.push("/pending-approval");
        } else {
          // Redirect to the intended destination or success page
          router.push(from === "/" ? "/register/success" : from);
        }
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

    const isValidStep = await form.trigger(fieldsToValidate);
    if (isValidStep) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };
  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) =>
      console.log(value, name, type),
    );
    return () => subscription.unsubscribe();
  }, [form]);
  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            {currentStep === 1 && (
              <div className="grid gap-2 place-self-center">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-2xl" htmlFor="role">
                        Choose Your Role
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          className="grid grid-cols-2 gap-4 max-md:grid-cols-1"
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormItem className="flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-accent/50">
                            <FormControl>
                              <RadioGroupItem
                                className="mt-1"
                                value={"STUDENT"}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="flex items-center gap-2 font-medium">
                                <GraduationCap className="size-5" />
                                Student
                              </FormLabel>
                              <p className="text-muted-foreground text-sm">
                                Join as a student to access courses and learning
                                materials
                              </p>
                            </div>
                          </FormItem>
                          <FormItem className="flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-accent/50">
                            <FormControl>
                              <RadioGroupItem
                                className="mt-1"
                                value={"PROFESSOR"}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="flex items-center gap-2 font-medium">
                                <HomeIcon className="size-5" />
                                Professor
                              </FormLabel>
                              <p className="text-muted-foreground text-sm">
                                Teach courses and manage student interactions
                              </p>
                            </div>
                          </FormItem>
                          <FormItem className="flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-accent/50">
                            <FormControl>
                              <RadioGroupItem
                                className="mt-1"
                                value={"ORGANIZATION"}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="flex items-center gap-2 font-medium">
                                <Briefcase className="size-5" />
                                Organization
                              </FormLabel>
                              <p className="text-muted-foreground text-sm">
                                Register your company for recruitment and
                                partnerships
                              </p>
                            </div>
                          </FormItem>
                          <FormItem className="flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-accent/50">
                            <FormControl>
                              <RadioGroupItem
                                className="mt-1"
                                value={"INSTITUTION"}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="flex items-center gap-2 font-medium">
                                <HomeIcon className="size-5" />
                                Institution
                              </FormLabel>
                              <p className="text-muted-foreground text-sm">
                                Register your university or college for
                                institutional access
                              </p>
                            </div>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        Choose the role that best describes you. This determines
                        your access level and features.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
          {currentStep === 2 && (
            <div className="grid grid-cols-1 gap-2.5 pb-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid gap-1">
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoCapitalize="none"
                        autoComplete="name"
                        autoCorrect="off"
                        disabled={isLoading || isGoogleLoading}
                        id="name"
                        placeholder={
                          role === UserRole.STUDENT
                            ? "full name" // Assuming full name for students
                            : role === UserRole.ORGANIZATION
                              ? "organization name" // Assuming organization name for organizations
                              : role === UserRole.INSTITUTION
                                ? "institution name" // Assuming institution name for institutions
                                : role === UserRole.PROFESSOR
                                  ? "professor name" // Assuming professor name for professors
                                  : "full name" // Default case or fallback
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {(role === UserRole.STUDENT || role === UserRole.PROFESSOR) && (
                <FormField
                  control={form.control}
                  name="instituteId"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel htmlFor="instituteId">
                        {role === UserRole.STUDENT
                          ? "Student Id"
                          : "Professor Id"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoCapitalize="none"
                          autoComplete="instituteId"
                          autoCorrect="off"
                          disabled={isLoading || isGoogleLoading}
                          id="instituteId"
                          placeholder="0910203"
                          type="number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem className="grid gap-1">
                    <FormLabel htmlFor="institution">Institution</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoCapitalize="none"
                        autoComplete="institution"
                        autoCorrect="off"
                        disabled={isLoading || isGoogleLoading}
                        id="institution"
                        placeholder={`${role === UserRole.STUDENT || role === UserRole.PROFESSOR ? "college/university name" : "institute website"}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {(role === UserRole.ORGANIZATION ||
                role === UserRole.INSTITUTION) && (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="grid gap-1">
                      <FormLabel htmlFor="telephone">Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="telephone"
                          {...field}
                          autoCapitalize="none"
                          autoComplete="tel"
                          autoCorrect="off"
                          disabled={isLoading || isGoogleLoading}
                          id="telephone"
                          placeholder="05555555555"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-1">
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isLoading || isGoogleLoading}
                        id="email"
                        placeholder="example.edu@gmail.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-1">
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoCapitalize="none"
                        autoComplete="none"
                        autoCorrect="off"
                        disabled={isLoading || isGoogleLoading}
                        id="password"
                        placeholder="********"
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            {currentStep > 1 && (
              <Button
                className={cn(buttonVariants({ variant: "ghost" }))}
                disabled={isLoading}
                onClick={prevStep}
                type="button"
              >
                Previous
              </Button>
            )}
            {currentStep < 2 && (
              <Button
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "self-end",
                )}
                disabled={isLoading || (currentStep === 1 && !role)}
                onClick={nextStep}
                type="button"
              >
                Next
              </Button>
            )}
            {currentStep === 2 && (
              <Button
                className={cn(buttonVariants())}
                disabled={isLoading}
                type="submit" // Disable if form is not valid
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                )}
                Sign up
              </Button>
            )}
          </div>
        </form>
      </Form>
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
      <Button
        className={cn(buttonVariants({ variant: "outline" }))}
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
