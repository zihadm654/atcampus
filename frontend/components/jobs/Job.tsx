"use client";

import Link from "next/link";
import { applyJob } from "@/actions/appllication";
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  DollarSign,
  Users,
  Building,
  Clock3,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { JobData } from "@/types/types";
import { useSession } from "@/lib/auth-client";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { isEnrolledInCourse } from "@/actions/enrollment";

import JobMoreButton from "../jobs/JobMoreButton";
import SaveJobButton from "../jobs/SaveJobButton";
import { UserAvatar } from "../shared/user-avatar";
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
import UserTooltip from "../UserTooltip";
import { useTransition, useOptimistic, useState } from "react";

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

  const { data: isEnrolled } = useQuery({
    queryKey: ["enrolled", job.courseId],
    queryFn: () => isEnrolledInCourse(job.courseId || ""),
    enabled: !!job.courseId && user.role === "STUDENT",
  });

  // Use a local state to track application status
  const [isApplied, setIsApplied] = useState<boolean>(
    job.applications.some((application) => application.applicantId === user.id)
  );

  const [optimisticApplied, setOptimisticApplied] = useOptimistic<boolean, boolean>(
    isApplied,
    (state, newState: boolean) => newState
  );

  const handleApply = () => {
    startTransition(async () => {
      setOptimisticApplied(true);

      try {
        const res = await applyJob(job.id);
        if (!res.success) {
          toast.error(res.message);
          setOptimisticApplied(false);
        } else {
          toast.success(res.message);
          // Update the local state to persist the application
          setIsApplied(true);
        }
      } catch (error) {
        setOptimisticApplied(false);
        toast.error("Failed to apply for job");
      }
    });
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Match Badge */}
      {job.courseId && (
        <Badge
          className={`absolute top-3 right-3 z-10 ${isEnrolled
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
                <UserAvatar user={job.user} className="h-12 w-12" />
              </Link>
            </UserTooltip>
            <div>
              <UserTooltip user={job.user}>
                <Link
                  href={`/${job.user.username}`}
                  className="flex items-center gap-1.5 text-md font-semibold hover:underline"
                >
                  {job.user.name}
                  {job.user.emailVerified && (
                    <ShieldCheck className="size-5 text-blue-700" />
                  )}
                </Link>
              </UserTooltip>
              <Link
                href={`/jobs/${job.id}`}
                className="text-sm text-muted-foreground hover:underline"
              >
                @{job.user.username} • {formatRelativeDate(job.createdAt)}
              </Link>
            </div>
          </div>
          {job.user.id === user.id && <JobMoreButton job={job} />}
        </div>
      </CardHeader>

      <CardContent>
        <Link href={`/jobs/${job.id}`} className="space-y-1.5">
          <CardTitle className="text-2xl leading-tight hover:text-blue-600 transition-colors">
            {job.title}
          </CardTitle>

          <CardDescription className="text-md leading-relaxed line-clamp-3">
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
                ${job.salary.toLocaleString()}/year
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Due {formatDate(job.endDate, "MMM dd")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm font-medium">
              {job.type.replace("_", " ")}
            </Badge>
            {job.applications.length > 0 && (
              <Badge variant="outline" className="text-sm">
                <Users className="mr-1 h-3 w-3" />
                {job.applications.length} applied
              </Badge>
            )}
          </div>
        </Link>
      </CardContent>

      <CardFooter className="border-t bg-muted/30">
        <div className="flex w-full items-center justify-between">
          <SaveJobButton
            jobId={job.id}
            initialState={{
              isSaveJobByUser: job.savedJobs.some(
                (saveJob) => saveJob.userId === user.id
              ),
            }}
          />
          <Button
            onClick={handleApply}
            variant={(optimisticApplied || isApplied) ? "outline" : "default"}
            disabled={optimisticApplied || isApplied || user.role !== "STUDENT" || isPending}
            className="min-w-[120px]"
            size="sm"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (optimisticApplied || isApplied) ? (
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
