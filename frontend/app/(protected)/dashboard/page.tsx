import { headers } from "next/headers";
import Link from "next/link";
import { ReturnButton } from "@/components/auth/return-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";

import { ApplicationStatusSelect } from "./_components/ApplicationStatusSelect";
import { OrganizationCard } from "./_components/organization-card";

export const metadata = constructMetadata({
  title: "Dashboard – Atcampus",
  description: "Create and manage content.",
});

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  //organization
  const [session, organization] = await Promise.all([
    auth.api.getSession({
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

  //job applicatons
  const applications = await prisma.application.findMany({
    where: {
      job: { userId: user.id },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      job: true,
      applicant: true,
    },
  });
  return (
    <main className="flex w-full flex-col gap-4">
      <DashboardHeader
        heading="Dashboard"
        text={"Current Role : — explore settings."}
      />
      <div className="container mx-auto max-w-screen-lg space-y-4 p-3 max-md:p-2">
        <div className="flex items-center justify-between gap-2">
          <ReturnButton href="/" label="Home" />
          <div className="flex items-center gap-2">
            {user?.role === "ADMIN" && (
              <Button asChild size="sm">
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
            )}

            <SignOutButton />
          </div>
        </div>
        {user?.role === "ORGANIZATION" && (
          <>
            <Label className="text-2xl">Job Applicants</Label>
            <Table className="my-3 rounded-lg border p-2 max-md:p-1">
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Seamster</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>{application.id}</TableCell>
                    <TableCell>{application.job.title}</TableCell>
                    <TableCell>{application.applicant.name}</TableCell>
                    <TableCell>{application.applicant.institution}</TableCell>
                    <TableCell>
                      <ApplicationStatusSelect
                        applicationId={application.id}
                        currentStatus={application.status}
                      />
                    </TableCell>
                    <TableCell>
                      {application.applicant.currentSemester}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow />
              </TableBody>
            </Table>
          </>
        )}
        {user?.role === "INSTITUTION" && (
          <OrganizationCard
            activeOrganization={JSON.parse(JSON.stringify(organization))}
            session={JSON.parse(JSON.stringify(session))}
          />
        )}
      </div>
    </main>
  );
}
