import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import AccountSwitcher from '@/components/auth/account-switch';
import { ReturnButton } from '@/components/auth/return-button';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { constructMetadata } from '@/lib/utils';

import { OrganizationCard } from './_components/organization-card';
import UserCard from './_components/user-card';

export const metadata = constructMetadata({
  title: 'Dashboard – SaaS Starter',
  description: 'Create and manage content.',
});

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
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
      createdAt: 'desc',
    },
  });
  const FULL_POST_ACCESS = await auth.api.userHasPermission({
    body: {
      userId: user.id,
      permissions: {
        posts: ['update', 'delete'],
      },
    },
  });
  return (
    <main className="flex w-full flex-col gap-4">
      <DashboardHeader
        heading="Dashboard"
        text={'Current Role : — explore settings.'}
      />
      <div className="container mx-auto max-w-screen-lg space-y-4 p-3">
        <div className="flex items-center justify-between gap-2">
          <ReturnButton href="/" label="Home" />

          <div className="flex items-center gap-2">
            {user?.role === 'INSTITUTION' && (
              <Button asChild size="sm">
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
            )}

            <SignOutButton />
          </div>
        </div>

        <h2 className="font-bold text-2xl">Permissions</h2>

        <div className="flex items-center space-x-4">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="User Image"
              className="size-32 rounded-md border border-primary object-cover"
              src={user.image}
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-full border border-primary bg-primary text-primary-foreground">
              <span className="font-bold text-lg uppercase">
                {user.name.slice(0, 2)}
              </span>
            </div>
          )}
          <Button size="sm">MANAGE OWN POSTS</Button>
          <Button disabled={!FULL_POST_ACCESS.success} size="sm">
            MANAGE ALL POSTS
          </Button>
        </div>

        {/* <pre className="overflow-clip text-sm">
          {JSON.stringify(user, null, 2)}
        </pre> */}
        {/* {applications.length > 0 && (
          <div>
            <h2>Applications</h2>
            <table className="min-w-full table-auto whitespace-nowrap">
              <thead>
                <tr className="border-b text-left text-sm">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Applicant</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {applications.map((user) => (
                  <tr key={user.id} className="border-b text-left text-sm">
                    <td className="px-4 py-2">{user.id.slice(0, 8)}</td>
                    <td className="px-4 py-2">{user.status}</td>
                    <td className="px-4 py-2">{user.applicantId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )} */}
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
