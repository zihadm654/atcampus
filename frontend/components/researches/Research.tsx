"use client";

import Link from "next/link";
import { Calendar, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { ResearchData } from "@/types/types";
import { useSession } from "@/lib/auth-client";
import { formatDate, formatRelativeDate } from "@/lib/utils";

import { UserAvatar } from "../shared/user-avatar";
import { Button } from "../ui/button";
import UserTooltip from "../UserTooltip";
import { sendCollaborationRequest } from "./collaboration-actions";
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
  const handleCollaborationRequest = async () => {
    const res = await sendCollaborationRequest(research.id);
    if (!res.success) {
      toast(res.message);
    } else {
      toast(res.message);
    }
  };
  return (
    <article className="group/post bg-card relative space-y-3 rounded-2xl p-5 shadow-sm border">
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
              <span>@{research.user.username}</span>{" "}
              {formatRelativeDate(research.createdAt)}
            </Link>
          </div>
        </div>
        {research.user.id === user.id && (
          <ResearchMoreButton research={research} />
        )}
      </div>
      <Link href={`/researches/${research.id}`}>
        <h3 className="text-xl font-semibold">{research.title}</h3>
        {research.collaborators.length > 0 && (
          <p className="text-muted-foreground text-sm">
            Collaborators:{" "}
            {research.collaborators.map((c) => c.name).join(", ")}
          </p>
        )}
      </Link>
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        {research.user.id !== user.id && (
          <Button
            onClick={handleCollaborationRequest}
            disabled={research.collaborators.some((c) => c.id === user.id)}
          >
            {research.collaborators.some((c) => c.id === user.id) &&
            research.collaborationRequests.some((c) => c.id === user.id)
              ? "Already Requested"
              : "Request Collaborate"}
          </Button>
        )}
        <SaveResearchButton
          researchId={research.id}
          initialState={{
            isSaveResearchByUser: research.saveResearch.some(
              (bookmark) => bookmark.userId === user.id
            ),
          }}
        />
      </div>
    </article>
  );
}
