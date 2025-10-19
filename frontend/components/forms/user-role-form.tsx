"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type User, UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SectionColumns } from "@/components/dashboard/section-columns";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { admin } from "@/lib/auth-client";
import { type TUserRole, userRoleSchema } from "@/lib/validations/user";

interface UserNameFormProps {
  user: Pick<User, "id" | "role">;
}

export function UserRoleForm({ user }: UserNameFormProps) {
  const [updated, setUpdated] = useState(false);
  // const [isPending, startTransition] = useTransition();
  const [isPending, setIsPending] = useState(false);

  // const updateUserRoleWithId = updateUserRole.bind(null, user.id);

  const roles = Object.values(UserRole);
  const [role, setRole] = useState(user.role);

  const form = useForm<TUserRole>({
    resolver: zodResolver(userRoleSchema),
    values: {
      role,
    },
  });
  const router = useRouter();

  const onSubmit = async (data: TUserRole) => {
    const canChangeRole = await admin.hasPermission({
      permissions: {
        user: ["set-role"],
      },
    });

    if (!canChangeRole.error) {
      return toast.error("Forbidden");
    }

    await admin.setRole({
      userId: user?.id,
      role: data.role,
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("User role updated");
          router.refresh();
        },
      },
    });
    // startTransition(async () => {
    //   const { status } = await updateUserRoleWithId(data);

    //   if (status !== "success") {
    //     toast.error("Something went wrong.", {
    //       description: "Your role was not updated. Please try again.",
    //     });
    //   } else {
    //     setUpdated(false);
    //     toast.success("Your role has been updated.");
    //   }
    // });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SectionColumns
          description="Select the role what you want for test the app."
          title="Your Role"
        >
          <div className="flex w-full items-center gap-2">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="w-full space-y-0">
                  <FormLabel className="sr-only">Role</FormLabel>
                  <Select
                    // TODO:(FIX) Option value not update. Use useState for the moment
                    defaultValue={user.role}
                    disabled={role === "INSTITUTION" || isPending}
                    name={field.name}
                    onValueChange={(value: UserRole) => {
                      setUpdated(user.role !== value);
                      setRole(value);
                      field.onChange;
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role.toString()}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-[67px] shrink-0 px-0 sm:w-[130px]"
              disabled={isPending || !updated}
              type="submit"
              variant="default"
            >
              {isPending ? (
                <Icons.spinner className="size-4 animate-spin" />
              ) : (
                <p>
                  Save
                  <span className="hidden sm:inline-flex">&nbsp;Changes</span>
                </p>
              )}
            </Button>
          </div>
          <div className="flex flex-col justify-between p-1">
            <p className="text-[13px] text-muted-foreground">
              Remove this field on real production
            </p>
          </div>
        </SectionColumns>
      </form>
    </Form>
  );
}
