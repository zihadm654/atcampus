"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { DataTable } from "@/components/dashboard/data-table/data-table";

import { columns } from "./_components/columns";
import { admin } from "@/lib/auth-client";

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState<string | undefined>();

  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const data = await admin.listUsers(
        {
          query: {
            limit: 10,
            sortBy: "createdAt",
            sortDirection: "desc",
          },
        },
        {
          throw: true,
        }
      );
      return data?.users || [];
    },
  });

  return (
    <div className="container mx-auto space-y-5 p-2">
      <DataTable
        columns={columns as any}
        data={users || []}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </div>
  );
}
