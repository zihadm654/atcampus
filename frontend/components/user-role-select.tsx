"use client";

import { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { admin } from "@/lib/auth-client";

interface UserRoleSelectProps {
  userId: string;
  role: string;
}

export const UserRoleSelect = ({ userId, role }: UserRoleSelectProps) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleChange(evt: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = evt.target.value as UserRole;

    const canChangeRole = await admin.hasPermission({
      permissions: {
        user: ["set-role"],
      },
    });

    if (canChangeRole.error) {
      return toast.error("Forbidden");
    }

    await admin.setRole({
      userId,
      role: newRole as UserRole,
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
  }

  return (
    <select
      className="p-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      disabled={role === "ADMIN" || isPending}
      onChange={handleChange}
      value={role}
    >
      {Object.values(UserRole).map((item) => (
        <option className="dark:bg-accent" key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
};
