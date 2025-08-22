import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { JsonToHtml } from "@/components/editor/JsonToHtml";
import JobMoreButton from "@/components/jobs/JobMoreButton";
import { Icons } from "@/components/shared/icons";
import { UserAvatar } from "@/components/shared/user-avatar";
import UserTooltip from "@/components/UserTooltip";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata, formatDate, formatRelativeDate } from "@/lib/utils";
import { getJobDataInclude, getUserDataSelect } from "@/types/types";
import SaveJobButton from "@/components/jobs/SaveJobButton";
import Client from "./client";
import { JobType } from "@/lib/validations/job";
import { Badge } from "@/components/ui/badge";
import { isEnrolledInCourse } from "@/actions/enrollment";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

const getJob = cache(async (jobId: string, loggedInUserId: string) => {
  const job = await prisma.job.findUnique({
    where: {
      id: jobId,
    },
    include: getJobDataInclude(loggedInUserId),
  });

  if (!job) notFound();

  return job;
});
const getUser = cache(async (loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: loggedInUserId,
    },
    select: {
      ...getUserDataSelect(loggedInUserId),
    },
  });

  if (!user) notFound();

  return user;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { jobId } = await params;
  const user = await getCurrentUser();

  if (!user) return {};

  const job = await getJob(jobId, user.id);

  return constructMetadata({
    title: `${job.user.displayUsername}: ${job.description.slice(0, 50)}...`,
  });
}
export default async function JobPage({ params }: PageProps) {
  const { jobId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }
  const currentUser = await getUser(user.id);
  const job = await getJob(jobId, user.id);
  const isEnrolled = await isEnrolledInCourse(job?.courseId || "");
  // If job not found, return 404
  if (!job) {
    notFound();
  }

  return (
    <div className="w-full">
      {/* Header with gradient background */}
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-2">
        <Card className="flex flex-col gap-3">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserTooltip user={job?.user}>
                <Link href={`/${job.user.username}`}>
                  <UserAvatar user={job?.user} />
                </Link>
              </UserTooltip>
              <UserTooltip user={job?.user}>
                <Link
                  className="flex items-center gap-1 font-medium text-md hover:underline"
                  href={`/${job.user.username}`}
                >
                  {job.user.name}
                  <ShieldCheck className="size-5 text-blue-700" />
                </Link>
              </UserTooltip>
              <Link
                className="block text-muted-foreground text-sm hover:underline"
                href={`/jobs/${job.id}`}
                suppressHydrationWarning
              >
                {formatRelativeDate(job.createdAt)}
              </Link>
            </div>
            {job.user.id === user.id && <JobMoreButton job={job} />}
          </CardHeader>
          <CardContent className="mt-2 gap-4 text-md">
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1">
              <MapPin className="size-5" />
              Location: <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1">
              Job Type: <Badge>{job.type}</Badge>
            </div>
            {job.type === JobType.INTERSHIP && (
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1">
                <Clock className="size-5" />
                Duration: <span>{job.duration}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1">
              <Clock className="size-5" />
              Weekly Hours: <span>{job.weeklyHours}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1">
              <DollarSign className="size-5" />
              Salary: <span>{job.salary}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1">
              <Calendar className="size-5" />
              Deadline: <span>{formatDate(job.endDate, "MM/dd/yyyy")}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-5">
            <SaveJobButton
              jobId={job.id}
              initialState={{
                isSaveJobByUser: job.saveJob.some(
                  (saveJob) => saveJob.userId === user.id
                ),
              }}
            />
            <Client user={user} job={job} />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UserTooltip user={currentUser}>
                <Link href={`/${currentUser.username}`}>
                  <UserAvatar user={currentUser} />
                </Link>
              </UserTooltip>
              <UserTooltip user={currentUser}>
                <Link
                  className="flex items-center gap-1 font-medium text-md hover:underline"
                  href={`/${user.username}`}
                >
                  {user.name}
                  <ShieldCheck className="size-5 text-blue-700" />
                </Link>
              </UserTooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>
              {job.courseId && isEnrolled
                ? "Profile Match"
                : "Profile Not Matched"}
            </Badge>
          </CardContent>
        </Card>
      </div>
      <div className="overflow-hidden mt-3 rounded-2xl bg-card shadow-sm">
        <Tabs defaultValue="summary">
          <div className=" border-b">
            <TabsList className="flex w-full justify-between p-0">
              <TabsTrigger
                className="flex-1 rounded-xl py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                value="summary"
              >
                <Icons.home className="size-5" />
                <span className="hidden lg:block">Summary</span>
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 rounded-xl py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                value="description"
              >
                <Icons.post className="size-5" />
                <span className="hidden lg:block">Description</span>
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 rounded-xl py-4 transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                value="qualifications"
              >
                <Icons.post className="size-5" />
                <span className="hidden lg:block">Qualifications</span>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent className="p-2" value="summary">
            {/* Main content */}
            <div className="flex-1 space-y-6">
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-xl">
                  <span className="rounded-full bg-blue-100 p-1.5 text-blue-700">
                    <Briefcase className="h-5 w-5" />
                  </span>
                  Summary
                </h2>
                <p className="text-muted-foreground">{job.summary}</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent className="p-2" value="description">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-xl">
                <span className="rounded-full bg-green-100 p-1.5 text-green-700">
                  <Icons.post className="size-8" />
                </span>
                Description
              </h2>
              <JsonToHtml json={JSON.parse(job.description)} />
            </div>
          </TabsContent>
          <TabsContent className="p-2" value="qualifications">
            {/* <div className="bg-card rounded-xl border p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <span className="rounded-full bg-purple-100 p-1.5 text-purple-700">
                <GraduationCap className="h-5 w-5" />
              </span>
              Qualifications
            </h2>
            <ul className="text-muted-foreground space-y-3">
              {job.qualifications.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div> */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
