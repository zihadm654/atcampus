"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { EditIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/data-table/data-table";

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

export const UsersClient: React.FC<UserClientProps> = ({ data }) => {
  return <DataTable columns={columns} data={data} link="users" />;
};
