"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Media } from "@prisma/client";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  MessageSquare,
} from "lucide-react";

import { JobData } from "@/types/types";
import { useSession } from "@/lib/auth-client";
import { cn, formatRelativeDate } from "@/lib/utils";

import Linkify from "../feed/Linkify";
import Comments from "../jobs/comments/Comments";
import JobMoreButton from "../jobs/JobMoreButton";
import LikeButton from "../jobs/LikeButton";
import SaveJobButton from "../jobs/SaveJobButton";
import BlurImage from "../shared/blur-image";
import { UserAvatar } from "../shared/user-avatar";
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
  const [showComments, setShowComments] = useState(false);
  return (
    <article className="group/post bg-card relative space-y-3 rounded-2xl p-5 shadow-sm">
      {/* Color strip at top */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

      {/* Department badge */}
      <div className="absolute top-4 right-4 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        Computer Science
      </div>
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={job.user}>
            <Link href={`/${job.user.username}`}>
              <UserAvatar user={job?.user} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={job?.user}>
              <Link
                href={`/${job.user.username}`}
                className="block font-medium hover:underline"
              >
                {job.user.username}
              </Link>
            </UserTooltip>
            <Link
              href={`/posts/${job.id}`}
              className="text-muted-foreground block text-sm hover:underline"
              suppressHydrationWarning
            >
              {formatRelativeDate(job.createdAt)}
            </Link>
          </div>
        </div>
        {job.user.id === user.id && (
          <JobMoreButton
            job={job}
            // className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>
      {/* Job type badge */}
      <div className="mb-3">
        <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
          Part-time
        </span>
      </div>
      <Linkify>
        <div className="break-words whitespace-pre-line">{job.description}</div>
      </Linkify>
      {!!job.attachments.length && (
        <MediaPreviews attachments={job.attachments} />
      )}
      {/* Details with icons */}
      <div className="mt-auto grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-gray-500" />
          <span>On Campus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gray-500" />
          <span>10-15 hrs/week</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-gray-500" />
          <span>$15/hr</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-1 py-1">
        <Calendar className="h-4 w-4" />
        <span>Deadline: 2025-06-15</span>
      </div>
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            jobId={job.id}
            initialState={{
              likes: job._count.likes,
              isLikedByUser: job.likes.some((like) => like.userId === user.id),
            }}
          />
          <CommentButton
            job={job}
            onClick={() => setShowComments(!showComments)}
          />
        </div>
        <SaveJobButton
          jobId={job.id}
          initialState={{
            isSaveJobByUser: job.saveJob.some(
              (saveJob) => saveJob.userId === user.id,
            ),
          }}
        />
      </div>
      {showComments && <Comments job={job} />}
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

interface CommentButtonProps {
  job: JobData;
  onClick: () => void;
}

function CommentButton({ job, onClick }: CommentButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {job._count.comments} <span className="hidden sm:inline">comments</span>
      </span>
    </button>
  );
}
