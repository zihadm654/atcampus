import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { toast } from "sonner";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import AccountSwitcher from "@/components/auth/account-switch";
import { ReturnButton } from "@/components/auth/return-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardHeader } from "@/components/dashboard/header";

import { OrganizationCard } from "./_components/organization-card";
import UserCard from "./_components/user-card";

export const metadata = constructMetadata({
  title: "Dashboard – SaaS Starter",
  description: "Create and manage content.",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const [session, activeSessions, deviceSessions, organization] =
    await Promise.all([
      auth.api.getSession({
        headers: await headers(),
      }),
      auth.api.listSessions({
        headers: await headers(),
      }),
      auth.api.listDeviceSessions({
        headers: await headers(),
      }),
      auth.api.getFullOrganization({
        headers: await headers(),
      }),
    ]).catch((e) => {
      console.log(e);
      // toast.error("Failed to fetch user data.");
      throw new Error(e);
    });
  const applications = await prisma.application.findMany({
    where: {
      applicantId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
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
    <main className="flex w-full flex-col gap-4">
      <DashboardHeader
        heading="Dashboard"
        text={"Current Role : — explore settings."}
      />
      <div className="container mx-auto max-w-screen-lg space-y-4 p-3">
        <div className="flex items-center justify-between gap-2">
          <ReturnButton href="/" label="Home" />

          <div className="flex items-center gap-2">
            {user?.role === "INSTITUTION" && (
              <Button asChild size="sm">
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
            )}

            <SignOutButton />
          </div>
        </div>

        <h2 className="text-2xl font-bold">Permissions</h2>

        <div className="flex items-center space-x-4">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="User Image"
              className="border-primary size-32 rounded-md border object-cover"
              src={user.image}
            />
          ) : (
            <div className="border-primary bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-full border">
              <span className="text-lg font-bold uppercase">
                {user.name.slice(0, 2)}
              </span>
            </div>
          )}
          <Button size="sm">MANAGE OWN POSTS</Button>
          <Button disabled={!FULL_POST_ACCESS.success} size="sm">
            MANAGE ALL POSTS
          </Button>
        </div>

        <pre className="overflow-clip text-sm">
          {JSON.stringify(user, null, 2)}
        </pre>
        <AccountSwitcher
          sessions={JSON.parse(JSON.stringify(deviceSessions))}
        />
        <UserCard
          activeSessions={JSON.parse(JSON.stringify(activeSessions))}
          session={JSON.parse(JSON.stringify(session))}
        />
        <OrganizationCard
          activeOrganization={JSON.parse(JSON.stringify(organization))}
          session={JSON.parse(JSON.stringify(session))}
        />
      </div>
    </main>
  );
}
