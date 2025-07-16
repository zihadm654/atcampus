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
import { registerSchema, TRegister, UserRole } from "@/lib/validations/auth";
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
  const form = useForm<TRegister>({
    resolver: zodResolver(registerSchema),
    mode: "onChange", // Validate on change for better UX
    defaultValues: {
      email: "",
      password: "",
      name: "",
      role: UserRole.STUDENT, // Default to undefined or a specific role if preferred
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
                          defaultValue={field.value}
                          className="flex items-center justify-center space-x-3 max-md:space-x-1.5 flex-wrap"
                        >
                          <FormItem className="flex items-center gap-3 border p-5 rounded-xl">
                            <FormControl>
                              <RadioGroupItem value="STUDENT" />
                            </FormControl>
                            <FormLabel className="font-normal flex flex-col items-center justify-center">
                              <GraduationCap className="size-7" />
                              STUDENT
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-3 border p-5 rounded-xl">
                            <FormControl>
                              <RadioGroupItem value="ORGANIZATION" />
                            </FormControl>
                            <FormLabel className="font-normal flex flex-col items-center justify-center">
                              <Briefcase className="size-7" />
                              ORGANIZATION
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center gap-3 border p-5 rounded-xl">
                            <FormControl>
                              <RadioGroupItem value="INSTITUTION" />
                            </FormControl>
                            <FormLabel className="font-normal flex flex-col items-center justify-center">
                              <HomeIcon className="size-7" />
                              INSTITUTION
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>Select your role</FormDescription>
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
                            ? "full name"
                            : "organization name"
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
              {role === UserRole.STUDENT && (
                <React.Fragment>
                  <FormField
                    control={form.control}
                    name="instituteId"
                    render={({ field }) => (
                      <FormItem className="grid gap-1">
                        <FormLabel htmlFor="instituteId">Student Id</FormLabel>
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
                            placeholder="college/university name"
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
                </React.Fragment>
              )}
              {/* {role === UserRole.ORGANIZATION && (
                <FormField
                  control={form.control}
                  name="phoneNumber"
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
              )} */}
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
