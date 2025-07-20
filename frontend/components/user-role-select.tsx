"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { toast } from "sonner";

import { admin } from "@/lib/auth-client";

interface UserRoleSelectProps {
  userId: string;
  role: UserRole;
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
      role: newRole as "STUDENT" | "PROFESSOR" | "INSTITUTION" | "ORGANIZATION",
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
      value={role}
      onChange={handleChange}
      disabled={role === "ADMIN" || isPending}
      className="p-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="STUDENT">STUDENT</option>
      <option value="INSTITUTION">INSTITUTION</option>
      <option value="ORGANIZATION">ORGANIZATION</option>
    </select>
  );
};
