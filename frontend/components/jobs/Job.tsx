"use client";

import Link from "next/link";
import { applyJob } from "@/actions/appllication";
import { Media } from "@prisma/client";
import { Calendar, Clock, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { JobData } from "@/types/types";
import { useSession } from "@/lib/auth-client";
import { cn, formatDate, formatRelativeDate } from "@/lib/utils";

import JobMoreButton from "../jobs/JobMoreButton";
import SaveJobButton from "../jobs/SaveJobButton";
import BlurImage from "../shared/blur-image";
import { UserAvatar } from "../shared/user-avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import UserTooltip from "../UserTooltip";

interface JobProps {
  job: JobData;
}

export default function Job({ job }: JobProps) {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user) {
    return null;
  }
  const handleApply = async () => {
    const res = await applyJob(job.id);
    if (!res.success) {
      toast(res.message);
    } else {
      toast(res.message);
    }
  };
  return (
    <article className="group/post bg-card relative space-y-3 rounded-2xl border p-5 shadow-sm">
      {/* Department badge */}
      <div className="absolute top-1 right-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        Profile match
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserTooltip user={job.user}>
            <Link href={`/${job.user.username}`}>
              <UserAvatar user={job?.user} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={job?.user}>
              <Link
                href={`/${job.user.username}`}
                className="text-md flex items-center gap-1 font-medium hover:underline"
              >
                {job.user.name}
                <ShieldCheck className="size-5 text-blue-700" />
              </Link>
            </UserTooltip>
            <Link
              href={`/jobs/${job.id}`}
              className="text-muted-foreground block text-sm hover:underline space-x-1"
              suppressHydrationWarning
            >
              <span className="text-gray-600">@{job.user.username}</span>{" "}
              {formatRelativeDate(job.createdAt)}
            </Link>
          </div>
        </div>
        {job.user.id === user.id && <JobMoreButton job={job} />}
      </div>
      <h3 className="text-xl font-semibold">
        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
      </h3>
      <p>{job.summary}</p>
      {!!job.attachments.length && (
        <MediaPreviews attachments={job.attachments} />
      )}
      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-4 text-gray-500" />
          <span>{job.location}</span>
        </div>
        {/* Job type badge */}
        <Badge className="bg-primary/10 text-primary text-sm font-medium">
          {job.type}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <h4 className="flex items-center gap-1">
          <Clock className="size-4 text-gray-500" />
          <span>{job.weeklyHours} hrs/week</span>
        </h4>
        <h4 className="flex items-center gap-1">
          Salary: <span>${job.salary}</span>
        </h4>
      </div>
      <div className="flex items-center gap-1 px-1 py-1">
        <Calendar className="size-4" />
        <span>Deadline: {formatDate(job.endDate, "MM/dd/yyyy")}</span>
      </div>
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <SaveJobButton
          jobId={job.id}
          initialState={{
            isSaveJobByUser: job.saveJob.some(
              (saveJob) => saveJob.userId === user.id,
            ),
          }}
        />
        <Button
          onClick={handleApply}
          variant="default"
          disabled={job.application.some(
            (application) => application.applicantId === user.id,
          )}
        >
          {job.application.some(
            (application) => application.applicantId === user.id,
          )
            ? "Already Applied"
            : "Apply Now"}
        </Button>
      </div>
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((m) => (
        <MediaPreview key={m.id} media={m} />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
}

function MediaPreview({ media }: MediaPreviewProps) {
  console.log(media.url, "url");
  if (media.type === "IMAGE") {
    return (
      <BlurImage
        src={media.url}
        alt="Attachment"
        width={500}
        height={500}
        className="mx-auto size-fit max-h-[30rem] rounded-2xl"
      />
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div>
        <video
          src={media?.url}
          controls
          className="mx-auto size-fit max-h-[30rem] rounded-2xl"
        />
      </div>
    );
  }

  return <p className="text-destructive">Unsupported media type</p>;
}
