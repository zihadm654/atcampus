"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signUpEmailAction } from "@/actions/sign-up-email.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, GraduationCap, HomeIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { registerSchema, TRegister } from "@/lib/validations/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/shared/icons";

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
      email: "",
      password: "",
      name: "",
      role: UserRole.STUDENT,
      institution: "",
      instituteId: "",
    },
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);

  const router = useRouter();

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
        if (
          data.role === UserRole.INSTITUTION ||
          data.role === UserRole.ORGANIZATION
        ) {
          router.push("/pending-approval");
        } else {
          router.push("/register/success");
        }
        toast.success(
          result.message || "Verification link has been sent to your mail"
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
      console.log(value, name, type)
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
                  name="role"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="role" className="text-2xl">
                        Choose Your Role
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 gap-4 max-md:grid-cols-1"
                        >
                          <FormItem className="flex items-start gap-3 border p-4 rounded-xl hover:bg-accent/50 transition-colors">
                            <FormControl>
                              <RadioGroupItem
                                value={UserRole.STUDENT}
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="font-medium flex items-center gap-2">
                                <GraduationCap className="size-5" />
                                Student
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Join as a student to access courses and learning
                                materials
                              </p>
                            </div>
                          </FormItem>
                          <FormItem className="flex items-start gap-3 border p-4 rounded-xl hover:bg-accent/50 transition-colors">
                            <FormControl>
                              <RadioGroupItem
                                value={UserRole.PROFESSOR}
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="font-medium flex items-center gap-2">
                                <HomeIcon className="size-5" />
                                Professor
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Teach courses and manage student interactions
                              </p>
                            </div>
                          </FormItem>
                          <FormItem className="flex items-start gap-3 border p-4 rounded-xl hover:bg-accent/50 transition-colors">
                            <FormControl>
                              <RadioGroupItem
                                value={UserRole.ORGANIZATION}
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="font-medium flex items-center gap-2">
                                <Briefcase className="size-5" />
                                Organization
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Register your company for recruitment and
                                partnerships
                              </p>
                            </div>
                          </FormItem>
                          <FormItem className="flex items-start gap-3 border p-4 rounded-xl hover:bg-accent/50 transition-colors">
                            <FormControl>
                              <RadioGroupItem
                                value={UserRole.INSTITUTION}
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="font-medium flex items-center gap-2">
                                <HomeIcon className="size-5" />
                                Institution
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
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
                        autoCapitalize="none"
                        autoComplete="name"
                        autoCorrect="off"
                        disabled={isLoading || isGoogleLoading}
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
                          id="instituteId"
                          placeholder="0910203"
                          type="number"
                          autoCapitalize="none"
                          autoComplete="instituteId"
                          autoCorrect="off"
                          disabled={isLoading || isGoogleLoading}
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
                        id="institution"
                        placeholder={`${role === UserRole.STUDENT || role === UserRole.PROFESSOR ? "college/university name" : "institute website"}`}
                        autoCapitalize="none"
                        autoComplete="institution"
                        autoCorrect="off"
                        disabled={isLoading || isGoogleLoading}
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
                          id="telephone"
                          placeholder="05555555555"
                          autoCapitalize="none"
                          autoComplete="tel"
                          autoCorrect="off"
                          disabled={isLoading || isGoogleLoading}
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
                        id="email"
                        placeholder="example.edu@gmail.com"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isLoading || isGoogleLoading}
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
                        id="password"
                        placeholder="********"
                        type="password"
                        autoCapitalize="none"
                        autoComplete="none"
                        autoCorrect="off"
                        disabled={isLoading || isGoogleLoading}
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
                type="button"
                onClick={prevStep}
                className={cn(buttonVariants({ variant: "ghost" }))}
                disabled={isLoading}
              >
                Previous
              </Button>
            )}
            {currentStep < 2 && (
              <Button
                type="button"
                onClick={nextStep}
                className={cn(buttonVariants({ variant: "ghost" }), "self-end")}
                disabled={isLoading || (currentStep === 1 && !role)}
              >
                Next
              </Button>
            )}
            {currentStep === 2 && (
              <Button
                type="submit"
                className={cn(buttonVariants())}
                disabled={isLoading} // Disable if form is not valid
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
