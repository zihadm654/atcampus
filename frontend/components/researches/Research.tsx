"use client";

import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { timeAgo } from "@/lib/utils";
import type { ResearchData } from "@/types";
import { UserAvatar } from "../shared/user-avatar";
import UserTooltip from "../UserTooltip";
import { Button } from "../ui/button";
import { sendCollaborationRequest } from "./collaboration-actions";
import ResearchMoreButton from "./ResearchMoreButton";
import SaveResearchButton from "./SaveResearchButton";

interface ResearchProps {
  research: ResearchData;
}

export default function Research({ research }: ResearchProps) {
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  // if (!user) {
  //   return null;
  // }

  // Safely check if user is a collaborator
  const isCollaborator = research.collaborators?.some
    ? research.collaborators?.some((c: any) => c.id === session?.user.id)
    : false;

  // Use a local state to track collaboration request status
  const [hasRequested, setHasRequested] = useState<boolean>(
    research.collaborationRequests.some
      ? research.collaborationRequests?.some(
          (c: any) => c.requesterId === session?.user.id
        )
      : false
  );

  const [optimisticRequested, setOptimisticRequested] = useOptimistic<
    boolean,
    boolean
  >(hasRequested, (_, newState: boolean) => newState);

  const handleCollaborationRequest = () => {
    startTransition(async () => {
      setOptimisticRequested(true);
      try {
        const res = await sendCollaborationRequest(research.id);
        if (res.success) {
          toast.success(res.message);
          // Update the local state to persist the request
          setHasRequested(true);
        } else {
          setOptimisticRequested(false);
          toast.error(res.message);
        }
      } catch (_error) {
        setOptimisticRequested(false);
        toast.error("Failed to send collaboration request");
      }
    });
  };
  return (
    <Card className="group hover:-translate-y-1 relative overflow-hidden pt-0 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="relative px-0">
        <Image
          alt={research.user.name}
          className="h-44 w-full rounded-sm object-cover"
          height="600"
          src={research?.user.image || "/_static/avatars/shadcn.jpeg"}
          width="400"
        />
        <div className="absolute inset-0 flex items-start justify-end">
          {research.userId === session?.user.id && (
            <ResearchMoreButton research={research} />
          )}
        </div>
      </CardHeader>
      <CardContent className="gap-2">
        <Link href={`/researches/${research.id}`}>
          <CardTitle className="line-clamp-2 text-lg">
            {research.title}
          </CardTitle>
          <div className="flex items-center gap-2 py-2">
            <UserTooltip user={research.user}>
              <Link href={`/${research.user.username}`}>
                <UserAvatar user={research?.user} />
              </Link>
            </UserTooltip>
            <UserTooltip user={research?.user}>
              <Link
                className="flex items-center gap-1 font-semibold hover:underline"
                href={`/${research.user.username}`}
              >
                {research.user.name}
                {research.user.emailVerified && (
                  <ShieldCheck className="size-4 text-blue-700" />
                )}
              </Link>
            </UserTooltip>
          </div>
          <p>posted {timeAgo(research.createdAt)}</p>
        </Link>
      </CardContent>
      <CardFooter className="flex w-full items-center justify-between gap-2 pt-0">
        {research.user.id !== session?.user.id ? (
          <Button
            className="flex-1"
            disabled={
              isCollaborator || optimisticRequested || hasRequested || isPending
            }
            onClick={handleCollaborationRequest}
            variant={
              isCollaborator
                ? "secondary"
                : optimisticRequested || hasRequested
                  ? "outline"
                  : "default"
            }
          >
            {isCollaborator
              ? "Already Collaborating"
              : optimisticRequested || hasRequested
                ? "Request Sent"
                : "Request to Collaborate"}
          </Button>
        ) : (
          <Button>Own research</Button>
        )}
        <SaveResearchButton
          initialState={{
            isSaveResearchByUser: research.savedResearch?.some
              ? research.savedResearch.some(
                  (bookmark: any) => bookmark.userId === session?.user.id
                )
              : false,
          }}
          researchId={research.id}
        />
      </CardFooter>
    </Card>
  );
}
