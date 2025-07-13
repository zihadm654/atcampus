"use client";

import Link from "next/link";
import { Media } from "@prisma/client";
import { ShieldCheck } from "lucide-react";

import { ResearchData } from "@/types/types";
import { useSession } from "@/lib/auth-client";
import { cn, formatRelativeDate } from "@/lib/utils";

import BlurImage from "../shared/blur-image";
import { UserAvatar } from "../shared/user-avatar";
import UserTooltip from "../UserTooltip";
import ResearchMoreButton from "./ResearchMoreButton";
import SaveResearchButton from "./SaveResearchButton";

interface ResearchProps {
  research: ResearchData;
}

export default function Research({ research }: ResearchProps) {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user) {
    return null;
  }

  return (
    <article className="group/post bg-card relative space-y-3 rounded-2xl p-5 shadow-sm">
      {/* Color strip at top */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserTooltip user={research.user}>
            <Link href={`/${research.user.username}`}>
              <UserAvatar user={research?.user} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={research?.user}>
              <Link
                href={`/${research.user.username}`}
                className="text-md flex items-center gap-1 font-medium hover:underline"
              >
                {research.user.name}
                <ShieldCheck className="size-5 text-blue-700" />
              </Link>
            </UserTooltip>
            <Link
              href={`/researches/${research.id}`}
              className="text-muted-foreground block text-sm hover:underline"
              suppressHydrationWarning
            >
              {/* <span className="text-black">@{research.user.username}</span>{" "} */}
              {formatRelativeDate(research.createdAt)}
            </Link>
          </div>
        </div>
        {research.user.id === user.id && (
          <ResearchMoreButton research={research} />
        )}
      </div>
      <h3 className="text-xl font-semibold">
        <Link href={`/researches/${research.id}`}>{research.title}</Link>
      </h3>
      {!!research.attachments.length && (
        <MediaPreviews attachments={research.attachments} />
      )}
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <SaveResearchButton
          researchId={research.id}
          initialState={{
            isSaveResearchByUser: research.saveResearch.some(
              (bookmark) => bookmark.userId === user.id,
            ),
          }}
        />
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
