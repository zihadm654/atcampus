"use client";

import * as React from "react";
import { updateStatusAction } from "@/actions/update-status.action";
import { User, UserRole, UserStatus } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { type ColumnDef } from "@tanstack/react-table";
import { Menu } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/data-table/data-table";

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
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
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

export async function UsersTable({ users }) {
  return <DataTable columns={columns} data={users} />;
}
