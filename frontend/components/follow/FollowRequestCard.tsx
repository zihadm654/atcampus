"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { UserPlus, UserX, Clock, CheckCircle, XCircle } from "lucide-react";
import { FollowRequest } from "@/hooks/useFollowRequests";

interface FollowRequestCardProps {
  request: FollowRequest;
  isSent?: boolean;
  onAccept?: (requesterId: string) => void;
  onReject?: (requesterId: string) => void;
  onCancel?: (targetId: string) => void;
  isLoading?: boolean;
}

export function FollowRequestCard({
  request,
  isSent = false,
  onAccept,
  onReject,
  onCancel,
  isLoading = false
}: FollowRequestCardProps) {
  const user = isSent ? request.target : request.requester;

  // Guard clause for undefined user
  if (!user) return null;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>
                {user.displayName?.charAt(0) || user.username?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/users/${user.username}`}>
                <h3 className="font-semibold hover:underline cursor-pointer">
                  {user.displayName || user.username}
                </h3>
              </Link>
              {user.headline && (
                <p className="text-sm text-muted-foreground">{user.headline}</p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                </Badge>
                {request.message && (
                  <Badge variant="secondary" className="text-xs">
                    Has message
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isSent ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel?.(request.targetId)}
                disabled={isLoading}
              >
                <UserX className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            ) : (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onAccept?.(request.requesterId)}
                  disabled={isLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject?.(request.requesterId)}
                  disabled={isLoading}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
        {request.message && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">{request.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface EmptyFollowRequestsProps {
  type: "received" | "sent";
}

export function EmptyFollowRequests({ type }: EmptyFollowRequestsProps) {
  const isReceived = type === "received";

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {isReceived ? (
          <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
        ) : (
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
        )}
        <h3 className="text-lg font-semibold mb-2">
          {isReceived ? "No pending requests" : "No sent requests"}
        </h3>
        <p className="text-muted-foreground text-center">
          {isReceived
            ? "When someone wants to follow you, their request will appear here."
            : "Your sent follow requests will appear here while they're pending."
          }
        </p>
      </CardContent>
    </Card>
  );
}