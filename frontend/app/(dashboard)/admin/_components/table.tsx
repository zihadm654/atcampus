"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EditIcon } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/dashboard/data-table/data-table";
import { Button } from "@/components/ui/button";

export type UserColumn = {
  id: string;
  name: string;
  status: string;
};

export const columns: ColumnDef<UserColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/categories/${row.original.id}`}>
        <Button size="icon" variant="outline">
          <EditIcon className="h-4" />
        </Button>
      </Link>
    ),
  },
];

interface UserClientProps {
  data: UserColumn[];
}

export const UsersClient: React.FC<UserClientProps> = ({ data }) => (
  <DataTable columns={columns} data={data} link="users" />
);
