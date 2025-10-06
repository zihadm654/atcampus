"use client";

import Link from "next/link";
import {
  Calendar,
  ShieldCheck,
  Users,
  BookOpen,
  Clock,
  Tag,
} from "lucide-react";
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
import { useTransition, useOptimistic, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonToHtml } from "../editor/JsonToHtml";

interface ResearchProps {
  research: any;
}

export default function Research({ research }: ResearchProps) {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user) {
    return null;
  }
  const [isPending, startTransition] = useTransition();

  // Safely check if user is a collaborator
  const isCollaborator = research.collaborators && research.collaborators.some
    ? research.collaborators.some((c: any) => c.id === user.id)
    : false;

  // Use a local state to track collaboration request status
  const [hasRequested, setHasRequested] = useState<boolean>(
    research.collaborationRequests && research.collaborationRequests.some
      ? research.collaborationRequests.some((c: any) => c.requesterId === user.id)
      : false
  );

  const [optimisticRequested, setOptimisticRequested] = useOptimistic<boolean, boolean>(
    hasRequested,
    (_, newState: boolean) => newState
  );

  const handleCollaborationRequest = () => {
    startTransition(async () => {
      setOptimisticRequested(true);
      try {
        const res = await sendCollaborationRequest(research.id);
        if (!res.success) {
          setOptimisticRequested(false);
          toast.error(res.message);
        } else {
          toast.success(res.message);
          // Update the local state to persist the request
          setHasRequested(true);
        }
      } catch (error) {
        setOptimisticRequested(false);
        toast.error("Failed to send collaboration request");
      }
    });
  };
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
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
                  href={`/${research.user.username}`}
                  className="flex items-center gap-1 font-semibold hover:underline"
                >
                  {research.user.name}
                  {research.user.emailVerified && (
                    <ShieldCheck className="size-4 text-blue-700" />
                  )}
                </Link>
              </UserTooltip>
              <div className="text-sm text-muted-foreground">
                <Link
                  href={`/researches/${research.id}`}
                  className="hover:underline"
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
          <CardTitle className="text-lg mb-2 line-clamp-2">
            {research.title}
          </CardTitle>
          <CardDescription className="mb-4 line-clamp-3">
            <JsonToHtml json={JSON.parse(research.description)} />
          </CardDescription>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="size-4" />
              <span className="capitalize">
                {research.category?.toLowerCase()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4" />
              {/* <span>{formatDate(research.deadline)}</span> */}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4" />
              <span>{research.collaborators ? research.collaborators.length : 0} collaborators</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="size-4" />
              <span>{research.applications?.length || 0} applications</span>
            </div>
          </div>

          {research.tags && research.tags.length > 0 && (
            <div className="mt-3">
              <span className="text-sm font-medium text-muted-foreground">
                Tags:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {research.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Link>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full gap-2">
          {research.user.id !== user.id && (
            <Button
              onClick={handleCollaborationRequest}
              variant={
                isCollaborator
                  ? "secondary"
                  : (optimisticRequested || hasRequested)
                    ? "outline"
                    : "default"
              }
              disabled={isCollaborator || optimisticRequested || hasRequested || isPending || user?.role !== "STUDENT"}
              className="flex-1"
            >
              {isCollaborator
                ? "Already Collaborating"
                : (optimisticRequested || hasRequested)
                  ? "Request Sent"
                  : "Request to Collaborate"}
            </Button>
          )}
          <SaveResearchButton
            researchId={research.id}
            initialState={{
              isSaveResearchByUser: research.savedResearch && research.savedResearch.some
                ? research.savedResearch.some((bookmark: any) => bookmark.userId === user.id)
                : false,
            }}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
