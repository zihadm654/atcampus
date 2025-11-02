"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { DataTable } from "@/components/dashboard/data-table/data-table";
import { admin } from "@/lib/auth-client";
import { columns } from "./_components/columns";

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState<string | undefined>();

  const { data: users } = useQuery({
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
