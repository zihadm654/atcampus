"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  acceptCollaborationRequest,
  declineCollaborationRequest,
} from "./collaboration-actions";

export function AcceptCollaborationButton({
  requestId,
}: {
  requestId: string;
}) {
  const [pending, startTransition] = useTransition();

  const handleAccept = () => {
    startTransition(async () => {
      try {
        await acceptCollaborationRequest(requestId);
        toast.success("Collaboration request accepted");
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  return (
    <Button disabled={pending} onClick={handleAccept}>
      Accept
    </Button>
  );
}

export function DeclineCollaborationButton({
  requestId,
}: {
  requestId: string;
}) {
  const [pending, startTransition] = useTransition();

  const handleDecline = () => {
    startTransition(async () => {
      try {
        await declineCollaborationRequest(requestId);
        toast.success("Collaboration request declined");
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  };

  return (
    <Button disabled={pending} onClick={handleDecline} variant="destructive">
      Decline
    </Button>
  );
}
