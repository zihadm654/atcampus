import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DeleteAccountSection } from "@/components/dashboard/delete-account";
import { DashboardHeader } from "@/components/dashboard/header";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { UserNameForm } from "@/components/forms/user-name-form";
import { UserRoleForm } from "@/components/forms/user-role-form";

export const metadata = constructMetadata({
  title: "Settings – SaaS Starter",
  description: "Configure your account and website settings.",
});

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user?.id) redirect("/login");

  return (
    <>
      {/* <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      /> */}
      <div className="divide-muted divide-y pb-10">
        <UserNameForm user={{ id: user.id, name: user.name || "" }} />
        {/* <UserRoleForm user={{ id: user.id, role: user.role }} /> */}
        <div className="border-md space-y-4 rounded-b-md border p-2">
          <h2 className="text-2xl font-bold">Change Password</h2>

          <ChangePasswordForm />
        </div>
        <DeleteAccountSection />
      </div>
    </>
  );
}
