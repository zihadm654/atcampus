"use client";

import { ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { formatRelativeDate } from "@/lib/utils";
import type { ResearchData } from "@/types";
import { JsonToHtml } from "../editor/JsonToHtml";
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
  const user = session?.user;
  if (!user) {
    return null;
  }

  // Safely check if user is a collaborator
  const isCollaborator = research.collaborators?.some
    ? research.collaborators?.some((c: any) => c.id === user.id)
    : false;

  // Use a local state to track collaboration request status
  const [hasRequested, setHasRequested] = useState<boolean>(
    research.collaborationRequests.some
      ? research.collaborationRequests?.some(
          (c: any) => c.requesterId === user.id
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
    <Card className="group transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <UserTooltip user={research.user}>
              <Link href={`/${research.user.username}`}>
                <UserAvatar user={research?.user} />
              </Link>
            </UserTooltip>
            <div>
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
              <div className="text-muted-foreground text-sm">
                <Link
                  className="hover:underline"
                  href={`/researches/${research.id}`}
                  suppressHydrationWarning
                >
                  <span>@{research.user.username}</span> •{" "}
                  {formatRelativeDate(research.createdAt)}
                </Link>
              </div>
            </div>
          </div>
          {research.user.id === user.id && (
            <ResearchMoreButton research={research} />
          )}
          {/* <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {research.category}
            </Badge>
          </div> */}
        </div>
      </CardHeader>

      <Link href={`/researches/${research.id}`}>
        <CardContent className="pt-0 pb-4">
          <CardTitle className="mb-2 line-clamp-2 text-lg">
            {research.title}
          </CardTitle>
          <CardDescription className="mb-4 line-clamp-3">
            <JsonToHtml json={JSON.parse(research.description)} />
          </CardDescription>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4" />
              <span>
                {research.collaborators ? research.collaborators.length : 0}{" "}
                collaborators
              </span>
            </div>
          </div>

          {research.keywords?.length > 0 && (
            <div className="mt-3">
              <span className="font-medium text-muted-foreground text-sm">
                Tags:
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {research.keywords?.map((tag: string, index: number) => (
                  <Badge className="text-xs" key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Link>

      <CardFooter className="pt-0">
        <div className="flex w-full items-center justify-between gap-2">
          {research.user.id !== user.id ? (
            <Button
              className="flex-1"
              disabled={
                isCollaborator ||
                optimisticRequested ||
                hasRequested ||
                isPending
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
                    (bookmark: any) => bookmark.userId === user.id
                  )
                : false,
            }}
            researchId={research.id}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
