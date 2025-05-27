import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import {
  DeleteUserButton,
  PlaceholderDeleteUserButton,
} from "@/components/auth/delete-user-button";
import { ReturnButton } from "@/components/auth/return-button";

// import { UserRoleSelect } from "@/components/user-role-select";

export default async function Page() {
  const session = await getCurrentUser();
  const headersList = await headers();

  if (!session) redirect("/login");

  if (session.role !== "INSTITUTION") {
    return (
      <div className="container mx-auto max-w-screen-lg space-y-8 px-8 py-16">
        <div className="space-y-4">
          <ReturnButton href="/dashboard" label="Profile" />

          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <p className="rounded-md bg-red-600 p-2 text-lg font-bold text-white">
            FORBIDDEN
          </p>
        </div>
      </div>
    );
  }

  const { users } = await auth.api.listUsers({
    headers: headersList,
    query: {
      sortBy: "name",
    },
  });

  const sortedUsers = users.sort(
    (a: { role?: string }, b: { role?: string }) => {
      if (a?.role === "INSTITUTION" && b?.role !== "INSTITUTION") return -1;
      if (a?.role !== "INSTITUTION" && b?.role === "INSTITUTION") return 1;
      return 0;
    },
  );

  return (
    <div className="container mx-auto max-w-screen-lg space-y-8 px-8 py-16">
      <div className="space-y-4">
        <ReturnButton href="/dashboard" label="Profile" />

        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <p className="rounded-md bg-green-600 p-2 text-lg font-bold text-white">
          ACCESS GRANTED
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="min-w-full table-auto whitespace-nowrap">
          <thead>
            <tr className="border-b text-left text-sm">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2 text-center">Role</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id} className="border-b text-left text-sm">
                <td className="px-4 py-2">{user.id.slice(0, 8)}</td>
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2 text-center">
                  {/* <UserRoleSelect
                    userId={user.id}
                    role={user.role as UserRole}
                  /> */}
                </td>
                <td className="px-4 py-2 text-center">
                  {user.role === "STUDENT" ? (
                    <DeleteUserButton userId={user.id} />
                  ) : (
                    <PlaceholderDeleteUserButton />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
