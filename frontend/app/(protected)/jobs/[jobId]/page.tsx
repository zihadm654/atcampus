import { JobType } from "@prisma/client";
import {
  BadgeCheckIcon,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { isEnrolledInCourse } from "@/actions/enrollment";
import { JsonToHtml } from "@/components/editor/JsonToHtml";
import JobCourse from "@/components/jobs/JobCourse";
// Add the JobMatchScore component
import JobMatchScore from "@/components/jobs/JobMatchScore";
import JobMoreButton from "@/components/jobs/JobMoreButton";
import JobSkills from "@/components/jobs/JobSkills";
import MissingSkills from "@/components/jobs/MissingSkills";
import SaveJobButton from "@/components/jobs/SaveJobButton";
import StudentSkillMatch from "@/components/jobs/StudentSkillMatch";
import { Icons } from "@/components/shared/icons";
import { UserAvatar } from "@/components/shared/user-avatar";
import UserTooltip from "@/components/UserTooltip";
import { Badge } from "@/components/ui/badge";
import {
  Card,
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
import Client from "./client";

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
    title: `${job.title}`,
    description: `${job.description}`,
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
  const _isEnrolled = await isEnrolledInCourse(
    job?.jobCourses?.[0]?.courseId || ""
  );

  // If job not found, return 404
  if (!job) {
    notFound();
  }

  // Check if the current user is a student viewing someone else's job
  const isStudentViewing = user.role === "STUDENT" && user.id !== job.userId;

  return (
    <div className="w-full">
      {/* Header with gradient background */}
      <div
        className={`grid ${isStudentViewing ? "grid-cols-2" : "grid-cols-1"} gap-2 max-md:grid-cols-1`}
      >
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
                  {job.user.emailVerified && (
                    <Badge
                      className="bg-blue-500 text-white dark:bg-blue-600"
                      variant="secondary"
                    >
                      <BadgeCheckIcon className="size-4" />
                      Verified
                    </Badge>
                  )}
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
            {job.type === JobType.INTERNSHIP && (
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
              initialState={{
                isSaveJobByUser: job.savedJobs.some(
                  (saveJob) => saveJob.userId === user.id
                ),
              }}
              jobId={job.id}
            />
            <Client job={job} user={user} />
          </CardFooter>
        </Card>
        {isStudentViewing && (
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
                    href={`/${currentUser.username}`}
                  >
                    {currentUser.name}
                    {currentUser.emailVerified && (
                      <Badge
                        className="bg-blue-500 text-white dark:bg-blue-600"
                        variant="secondary"
                      >
                        <BadgeCheckIcon className="size-4" />
                        Verified
                      </Badge>
                    )}
                  </Link>
                </UserTooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-48 overflow-auto">
              <div className="space-y-4">
                <Suspense
                  fallback={
                    <div className="space-y-4">
                      <div className="h-32 animate-pulse rounded bg-gray-200" />
                      <div className="h-32 animate-pulse rounded bg-gray-200" />
                    </div>
                  }
                >
                  <JobMatchScore jobId={job.id} />
                  <MissingSkills jobId={job.id} />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="mt-3 overflow-hidden rounded-2xl bg-card shadow-sm">
        <Tabs defaultValue="summary">
          <div className="border-b">
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
                value="academics"
              >
                <Icons.skill className="size-5" />
                <span className="hidden lg:block">Academics</span>
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
          <TabsContent className="p-2" value="academics">
            <div className="space-y-2">
              <JobSkills jobId={job.id} />
              {user.role === "STUDENT" && <StudentSkillMatch jobId={job.id} />}
              <h4 className="mb-4 flex items-center gap-2 font-semibold text-lg">
                <span className="rounded-full bg-green-100 p-1.5 text-green-700">
                  <Icons.post className="size-5" />
                </span>
                Required Courses
              </h4>
              <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
                {/* Display all associated courses */}
                {job.jobCourses?.map((jobCourse) => (
                  <JobCourse key={jobCourse.courseId} courseId={jobCourse.courseId} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
