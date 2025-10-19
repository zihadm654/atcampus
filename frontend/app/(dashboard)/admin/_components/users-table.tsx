"use client";

import { type User, type UserRole, UserStatus } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { Menu } from "lucide-react";
import { toast } from "sonner";
import { updateStatusAction } from "@/actions/update-status.action";
import { DataTable } from "@/components/dashboard/data-table/data-table";
import { Button } from "@/components/ui/button";

interface UserWithRoleAndStatus extends User {
  role: UserRole;
  status: UserStatus;
}

export const columns: ColumnDef<UserWithRoleAndStatus>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
              variant="ghost"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem
              onClick={async () => {
                await updateStatusAction(user.id, UserStatus.ACTIVE);
                toast.success("User status updated to ACTIVE");
              }}
            >
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await updateStatusAction(user.id, UserStatus.REJECTED);
                toast.success("User status updated to REJECTED");
              }}
            >
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UsersTable({ users }) {
  return <DataTable columns={columns} data={users} />;
}
