"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheckIcon,
  Calendar,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { applyJob } from "@/actions/appllication";
import { isEnrolledInCourse } from "@/actions/enrollment";
import { useSession } from "@/lib/auth-client";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import type { JobData } from "@/types/types";
import JobMoreButton from "../jobs/JobMoreButton";
import SaveJobButton from "../jobs/SaveJobButton";
import { UserAvatar } from "../shared/user-avatar";
import UserTooltip from "../UserTooltip";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

// Add this component for the skill match display
function SkillMatchBadge({ matchData }: { matchData: any }) {
  // Extract match percentages
  const skillMatchPercentage = matchData?.skillMatchPercentage || 0;
  const courseMatchPercentage = matchData?.courseMatchPercentage || 0;
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
      <div className="text-muted-foreground text-xs">
        Skills: {Math.round(skillMatchPercentage)}% | Courses:{" "}
        {Math.round(courseMatchPercentage)}%
      </div>
    </div>
  );
}

interface JobProps {
  job: JobData;
}

export default function Job({ job }: JobProps) {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user) {
    return null;
  }

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
    enabled: user.role === "STUDENT",
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: isEnrolled } = useQuery({
    queryKey: ["enrolled", job.jobCourses[0]?.courseId],
    queryFn: () => isEnrolledInCourse(job.jobCourses[0]?.courseId || ""),
    enabled: !!job.jobCourses[0]?.courseId && user.role === "STUDENT",
  });

  // Use a local state to track application status
  const [isApplied, setIsApplied] = useState<boolean>(
    job.applications.some((application) => application.applicantId === user.id)
  );

  const [optimisticApplied, setOptimisticApplied] = useOptimistic<
    boolean,
    boolean
  >(isApplied, (state, newState: boolean) => newState);

  const handleApply = () => {
    startTransition(async () => {
      setOptimisticApplied(true);

      try {
        const res = await applyJob(job.id);
        if (res.success) {
          toast.success(res.message);
          // Update the local state to persist the application
          setIsApplied(true);
        } else {
          toast.error(res.message);
          // Revert the optimistic update on failure
          setOptimisticApplied(false);
        }
      } catch (error) {
        // Revert the optimistic update on error
        setOptimisticApplied(false);
        toast.error("Failed to apply for job");
      }
    });
  };

  return (
    <Card className="group hover:-translate-y-1 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Match Badge */}
      {job.jobCourses[0]?.courseId && (
        <Badge
          className={`absolute top-3 right-3 z-10 ${
            isEnrolled
              ? "bg-green-500/90 text-white"
              : "bg-orange-500/90 text-white"
          }`}
        >
          {isEnrolled ? "Profile Match" : "Course Required"}
        </Badge>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <UserTooltip user={job.user}>
              <Link href={`/${job.user.username}`}>
                <UserAvatar className="h-12 w-12" user={job.user} />
              </Link>
            </UserTooltip>
            <div>
              <UserTooltip user={job.user}>
                <Link
                  className="flex items-center gap-1.5 font-semibold text-md hover:underline"
                  href={`/${job.user.username}`}
                >
                  {job.user.name}
                  {job.user.emailVerified ?? (
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
                className="text-muted-foreground text-sm hover:underline"
                href={`/jobs/${job.id}`}
              >
                @{job.user.username} • {formatRelativeDate(job.createdAt)}
              </Link>
            </div>
          </div>
          {job.user.id === user.id && <JobMoreButton job={job} />}
        </div>
      </CardHeader>

      <CardContent>
        <Link className="space-y-1.5" href={`/jobs/${job.id}`}>
          <CardTitle className="text-2xl leading-tight transition-colors hover:text-blue-600">
            {job.title}
          </CardTitle>

          <CardDescription className="line-clamp-3 text-md leading-relaxed">
            {job.summary}
          </CardDescription>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="size-5 text-muted-foreground" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="size-5 text-muted-foreground" />
              <span>{job.weeklyHours} hrs/week</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                ${job.salary.toLocaleString()}/month
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Due {formatDate(job.endDate, "MMM dd")}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="font-medium text-sm" variant="secondary">
              {job.type.replace("_", " ")}
            </Badge>
            <Badge className="text-sm" variant="outline">
              <Users className="mr-1 h-3 w-3" />
              {optimisticApplied || isApplied
                ? job.applications.length + 1
                : job.applications.length}{" "}
              applied
            </Badge>
            {/* Display skill match for students */}
            {user.role === "STUDENT" && (
              <div className="mt-2">
                {isMatchLoading ? (
                  <Badge variant="secondary">Calculating...</Badge>
                ) : matchData ? (
                  <SkillMatchBadge matchData={matchData} />
                ) : null}
              </div>
            )}
          </div>
        </Link>
      </CardContent>

      <CardFooter className="border-t bg-muted/30">
        <div className="flex w-full items-center justify-between">
          <SaveJobButton
            initialState={{
              isSaveJobByUser: job.savedJobs.some(
                (saveJob) => saveJob.userId === user.id
              ),
            }}
            jobId={job.id}
          />
          <Button
            className="min-w-[120px]"
            disabled={
              optimisticApplied ||
              isApplied ||
              user.role !== "STUDENT" ||
              isPending
            }
            onClick={handleApply}
            size="sm"
            variant={optimisticApplied || isApplied ? "outline" : "default"}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : optimisticApplied || isApplied ? (
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
