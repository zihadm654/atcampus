import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/change-password-form";
import { DashboardHeader } from "@/components/dashboard/header";
import { ReturnButton } from "@/components/return-button";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { SignOutButton } from "@/components/sign-out-button";
import { UpdateUserForm } from "@/components/update-user-form";

export const metadata = constructMetadata({
  title: "Dashboard – SaaS Starter",
  description: "Create and manage content.",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const FULL_POST_ACCESS = await auth.api.userHasPermission({
    body: {
      userId: user.id,
      permissions: {
        posts: ["update", "delete"],
      },
    },
  });
  return (
    <>
      <DashboardHeader
        heading="Dashboard"
        text={`Current Role : — Change your role in settings.`}
      />
      <div className="container mx-auto max-w-screen-lg space-y-4 px-8 py-16">
        <div className="space-y-4">
          <ReturnButton href="/" label="Home" />

          <h1 className="text-3xl font-bold">Profile</h1>

          <div className="flex items-center gap-2">
            {user?.role === "INSTITUTION" && (
              <Button size="sm" asChild>
                <Link href="/admin/dashboard">Admin Dashboard</Link>
              </Button>
            )}

            <SignOutButton />
          </div>
        </div>

        <h2 className="text-2xl font-bold">Permissions</h2>

        <div className="space-x-4">
          <Button size="sm">MANAGE OWN POSTS</Button>
          <Button size="sm" disabled={!FULL_POST_ACCESS.success}>
            MANAGE ALL POSTS
          </Button>
        </div>

        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt="User Image"
            className="border-primary size-32 rounded-md border object-cover"
          />
        ) : (
          <div className="border-primary bg-primary text-primary-foreground flex size-32 items-center justify-center rounded-md border">
            <span className="text-lg font-bold uppercase">
              {user.name.slice(0, 2)}
            </span>
          </div>
        )}

        <pre className="overflow-clip text-sm">
          {JSON.stringify(user, null, 2)}
        </pre>

        <div className="space-y-4 rounded-b-md border border-t-8 border-blue-600 p-4">
          <h2 className="text-2xl font-bold">Update User</h2>

          <UpdateUserForm name={user.name} image={user.image ?? ""} />
        </div>
      </div>
      {/* <EmptyPlaceholder>
        <EmptyPlaceholder.Icon name="post" />
        <EmptyPlaceholder.Title>No content created</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          You don&apos;t have any content yet. Start creating content.
        </EmptyPlaceholder.Description>
        <Button>Add Content</Button>
      </EmptyPlaceholder> */}
    </>
  );
}
