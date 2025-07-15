import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import AccountSwitcher from "@/components/auth/account-switch";
import { DeleteAccountSection } from "@/components/dashboard/delete-account";
import { DashboardHeader } from "@/components/dashboard/header";

import UserCard from "../_components/user-card";

export const metadata = constructMetadata({
  title: "Settings – Atcampus",
  description: "Configure your account and website settings.",
});

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user?.id) redirect("/login");
  const [session, activeSessions, deviceSessions] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listSessions({
      headers: await headers(),
    }),
    auth.api.listDeviceSessions({
      headers: await headers(),
    }),
  ]).catch((e) => {
    console.log(e);
    // toast.error("Failed to fetch user data.");
    throw new Error(e);
  });
  const FULL_POST_ACCESS = await auth.api.userHasPermission({
    body: {
      userId: user.id,
      permissions: {
        posts: ["update", "delete"],
      },
    },
  });
  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />
      <h2 className="text-2xl font-bold">Permissions</h2>

      <div className="flex items-center space-x-4">
        <Button size="sm">MANAGE OWN POSTS</Button>
        <Button disabled={!FULL_POST_ACCESS.success} size="sm">
          MANAGE ALL POSTS
        </Button>
        <AccountSwitcher
          sessions={JSON.parse(JSON.stringify(deviceSessions))}
        />
      </div>
      <div className="divide-y divide-muted pb-10">
        <UserCard
          activeSessions={JSON.parse(JSON.stringify(activeSessions))}
          session={JSON.parse(JSON.stringify(session))}
        />
        <DeleteAccountSection userId={user.id} />
      </div>
    </div>
  );
}
