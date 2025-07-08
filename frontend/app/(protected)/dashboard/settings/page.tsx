import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DeleteAccountSection } from '@/components/dashboard/delete-account';
import { DashboardHeader } from '@/components/dashboard/header';
import { UserNameForm } from '@/components/forms/user-name-form';
import { UserRoleForm } from '@/components/forms/user-role-form';
import { auth } from '@/lib/auth';
import { getCurrentUser } from '@/lib/session';
import { constructMetadata } from '@/lib/utils';

import UserCard from '../_components/user-card';

export const metadata = constructMetadata({
  title: 'Settings – SaaS Starter',
  description: 'Configure your account and website settings.',
});

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user?.id) redirect('/login');
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
  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />
      <div className="divide-y divide-muted pb-10">
        {/* <UserNameForm user={{ id: user.id, name: user.name || "" }} />
        <UserRoleForm user={{ id: user.id, role: user.role }} /> */}
        <UserCard
          activeSessions={JSON.parse(JSON.stringify(activeSessions))}
          session={JSON.parse(JSON.stringify(session))}
        />
        <DeleteAccountSection userId={user.id} />
      </div>
    </div>
  );
}
