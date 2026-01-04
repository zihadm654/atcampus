import { headers } from "next/headers";
import Link from "next/link";
import { ReturnButton } from "@/components/auth/return-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
      <div className="container mx-auto max-w-5xl space-y-4 p-3 max-md:p-2">
        <div className="flex items-center justify-between gap-2">
          <ReturnButton href="/" label="Home" />
          <div className="flex items-center gap-2">
            {user?.role === "ADMIN" && (
              <Button asChild size="sm" variant="default">
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
            )}

            <SignOutButton />
          </div>
        </div>
        {user?.role === "ORGANIZATION" && (
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/50 p-4 flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                Job Applicants
              </CardTitle>
              <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                {applications.length} Applicants
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Job Title
                      </TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Username
                      </TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Candidate
                      </TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Institution
                      </TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Email
                      </TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Status
                      </TableHead>
                      <TableHead className="whitespace-nowrap px-4 py-3 text-left font-medium">
                        Semester
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length > 0 ? (
                      applications.map((application) => (
                        <TableRow
                          className="border-border border-b transition-colors hover:bg-muted/50"
                          key={application.id}
                        >
                          <TableCell className="px-4 py-3">
                            <div className="font-medium">
                              {application.job.title}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge className="font-mono" variant="outline">
                              {application.applicant.username}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                {application.applicant.name.charAt(0)}
                              </div>
                              <span className="font-medium">
                                {application.applicant.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="max-w-[200px] truncate text-muted-foreground">
                              {application.applicant.institution}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <a
                              className="text-primary hover:underline"
                              href={`mailto:${application.applicant.email}`}
                            >
                              {application.applicant.email}
                            </a>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <ApplicationStatusSelect
                              applicationId={application.id}
                              currentStatus={application.status}
                            />
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge
                              className="bg-secondary/80"
                              variant="secondary"
                            >
                              {application.applicant.currentSemester || 1}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          className="py-8 text-center text-muted-foreground"
                          colSpan={7}
                        >
                          No job applicants found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
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
