"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { applyJob } from "@/actions/appllication";
import { isEnrolledInCourse } from "@/actions/enrollment";
import { useSession } from "@/lib/auth-client";
import { formatDate, formatRelativeDate, timeAgo } from "@/lib/utils";
import type { JobData } from "@/types/types";
import JobMoreButton from "../jobs/JobMoreButton";
import SaveJobButton from "../jobs/SaveJobButton";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

// Add this component for the skill match display
function SkillMatchBadge({ matchData }: { matchData: any }) {
  // Extract match percentages
  // const skillMatchPercentage = matchData?.skillMatchPercentage || 0;
  // const courseMatchPercentage = matchData?.courseMatchPercentage || 0;
  const overallMatchPercentage = matchData?.matchPercentage || 0;

  // Determine color based on overall match
  let bgColor = "bg-red-500";
  const textColor = "text-white";

  if (overallMatchPercentage >= 80) {
    bgColor = "bg-green-500";
  } else if (overallMatchPercentage >= 60) {
    bgColor = "bg-yellow-500";
  } else if (overallMatchPercentage >= 40) {
    bgColor = "bg-orange-500";
  }

  return (
    <div className="flex flex-col gap-1">
      <Badge className={`${bgColor} ${textColor}`}>
        Match: {Math.round(overallMatchPercentage)}%
      </Badge>
      {/* <div className="text-muted-foreground text-xs">
        Skills: {Math.round(skillMatchPercentage)}% | Courses:{" "}
        {Math.round(courseMatchPercentage)}%
      </div> */}
    </div>
  );
}

interface JobProps {
  job: JobData;
}

export default function Job({ job }: JobProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  // Fetch job match for students
  const { data: matchData, isLoading: isMatchLoading } = useQuery({
    queryKey: ["job-match", job.id],
    queryFn: async () => {
      const response = await fetch(`/api/job-matches?jobId=${job.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch job match");
      }
      return response.json();
    },
    // enabled: user.role === "STUDENT",
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Check enrollment for all job courses
  const { data: _enrolledCourses } = useQuery({
    queryKey: ["enrolled", job?.jobCourses?.map((jc) => jc.courseId)],
    queryFn: async () => {
      if (!job?.jobCourses || job.jobCourses.length === 0) return [];
      const enrollmentChecks = await Promise.all(
        job.jobCourses.map(async (jobCourse) => ({
          courseId: jobCourse.courseId,
          isEnrolled: await isEnrolledInCourse(jobCourse.courseId),
        }))
      );
      return enrollmentChecks;
    },
    // enabled:
    //   !!job?.jobCourses && job.jobCourses.length > 0 && user.role === "STUDENT",
  });
  // Determine if user is enrolled in any of the required courses
  // const isEnrolled = enrolledCourses?.some((ec) => ec.isEnrolled) || false;

  // if (!user) {
  //   return null;
  // }

  // Get the current user's application status
  const userApplication = job.applications.find(
    (application) => application.applicantId === session?.user.id
  );

  const isApplied = !!userApplication;
  const applicationStatus = userApplication?.status;

  const [optimisticApplied, setOptimisticApplied] = useOptimistic<
    { applied: boolean; status?: string },
    { applied: boolean; status?: string }
  >({ applied: isApplied, status: applicationStatus }, (_state, newState) => newState);

  const handleApply = () => {
    startTransition(async () => {
      setOptimisticApplied({ applied: true, status: "PENDING" });

      try {
        const res = await applyJob(job.id);
        if (res.success) {
          toast.success(res.message);
          // Update the local state to persist the application
        } else {
          toast.error(res.message);
          // Revert the optimistic update on failure
          setOptimisticApplied({ applied: false, status: undefined });
        }
      } catch (_error) {
        // Revert the optimistic update on error
        setOptimisticApplied({ applied: false, status: undefined });
        toast.error("Failed to apply for job");
      }
    });
  };

  return (
    <Card className="group hover:-translate-y-1 relative overflow-hidden pt-0 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="relative px-0">
        <Image
          alt={job.user.name}
          className="h-44 w-full rounded-sm object-cover"
          height="600"
          src={job.user.image || "/_static/avatars/shadcn.jpeg"}
          width="400"
        />
        {/* Display skill match for students */}
        {session?.user.role === "STUDENT" && (
          <div className="absolute top-0 right-0">
            {isMatchLoading ? (
              <Badge variant="secondary">Calculating...</Badge>
            ) : matchData ? (
              <SkillMatchBadge matchData={matchData} />
            ) : null}
          </div>
        )}
        <div className="absolute inset-0 top-4 right-2 flex items-start justify-end">
          {job.user.id === session?.user.id && <JobMoreButton job={job} />}
        </div>
      </CardHeader>
      <CardContent>
        <Link className="space-y-1.5" href={`/jobs/${job.id}`}>
          <CardTitle className="text-2xl leading-tight transition-colors hover:text-blue-600">
            {job.title}
          </CardTitle>

          <div className="grid grid-cols-2 gap-3">
            <p className="truncate">{job.location}</p>
            <Badge className="font-medium text-sm" variant="secondary">
              {job.type.replace("_", " ")}
            </Badge>
            <p className="col-span-2 text-muted-foreground">
              Posted {timeAgo(job.createdAt)}
              {"  |  "} Apply by: {formatRelativeDate(job.createdAt)}
              {", "}
              {formatDate(job.endDate, "MMM d")}
            </p>
            <p className="col-span-2">
              {job.type === "INTERNSHIP" ? "Paid Internship" : "Salary"} (
              <span className="text-sm">
                {job.salary.toLocaleString()}/monthly)
              </span>
            </p>
            {/* <div className="flex flex-wrap items-center gap-2">
              <Badge className="text-sm" variant="outline">
                <Users className="mr-1 h-3 w-3" />
                {optimisticApplied || isApplied
                  ? job._count.applications + 1
                  : job._count.applications}{" "}
                applied
              </Badge>
            </div> */}
          </div>
        </Link>
      </CardContent>

      <CardFooter className="border-t bg-muted/30">
        <div className="flex w-full items-center justify-between">
          <SaveJobButton
            initialState={{
              isSaveJobByUser: job.savedJobs.some(
                (saveJob) => saveJob.userId === session?.user.id
              ),
            }}
            jobId={job.id}
          />
          <Button
            className="min-w-[120px]"
            disabled={
              optimisticApplied.applied ||
              isApplied ||
              session?.user.role !== "STUDENT" ||
              isPending
            }
            onClick={handleApply}
            size="sm"
            variant={
              optimisticApplied.status === "ACCEPTED" || applicationStatus === "ACCEPTED"
                ? "success"
                : optimisticApplied.status === "REJECTED" || applicationStatus === "REJECTED"
                  ? "destructive"
                  : optimisticApplied.applied || isApplied
                    ? "success"
                    : "default"
            }
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : optimisticApplied.status === "ACCEPTED" || applicationStatus === "ACCEPTED" ? (
              "Accepted ✓"
            ) : optimisticApplied.status === "REJECTED" || applicationStatus === "REJECTED" ? (
              "Rejected"
            ) : optimisticApplied.applied || isApplied ? (
              "Applied ✓"
            ) : (
              "Apply Now"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
