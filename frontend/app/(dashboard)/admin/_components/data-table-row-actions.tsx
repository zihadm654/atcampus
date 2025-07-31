"use client";

import { useRouter } from "next/navigation";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateStatusAction } from "@/actions/update-status.action";
import { UserRole, UserStatus } from "@prisma/client";
import { admin } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Trash, UserCircle } from "lucide-react";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleDeleteUser = async (id: string) => {
    // setIsLoading(`delete-${id}`);
    try {
      await Promise.all([admin.removeUser({ userId: id })]);
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      // setIsLoading(undefined);
    }
  };

  const handleRevokeSessions = async (id: string) => {
    // setIsLoading(`revoke-${id}`);
    try {
      await admin.revokeUserSessions({ userId: id });
      toast.success("Sessions revoked for user");
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke sessions");
    } finally {
      // setIsLoading(undefined);
    }
  };

  const handleImpersonateUser = async (id: string) => {
    // setIsLoading(`impersonate-${id}`);
    try {
      await admin.impersonateUser({ userId: id });
      toast.success("Impersonated user");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to impersonate user");
    } finally {
      // setIsLoading(undefined);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted flex size-8 p-0"
        >
          <DotsHorizontalIcon className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {row.getValue("role") === UserRole.ORGANIZATION && (
          <>
            <span className="text-gray-500 pl-3">Change Status</span>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await updateStatusAction(row.getValue("id"), UserStatus.ACTIVE);
                toast.success("User status updated to ACTIVE");
              }}
            >
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await updateStatusAction(
                  row.getValue("id"),
                  UserStatus.PENDING
                );
                toast.success("User status updated to pending");
              }}
            >
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await updateStatusAction(
                  row.getValue("id"),
                  UserStatus.REJECTED
                );
                toast.success("User status updated to REJECTED");
              }}
            >
              Reject
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          onClick={() => router.push(`/admin/banner/${row.getValue("id")}`)}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleImpersonateUser(row.getValue("id"))}
        >
          <UserCircle className="h-4 w-4" /> Impersonate
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleRevokeSessions(row.getValue("id"))}
        >
          <RefreshCw className="h-4 w-4" /> Revoke
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDeleteUser(row.getValue("id"))}>
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
