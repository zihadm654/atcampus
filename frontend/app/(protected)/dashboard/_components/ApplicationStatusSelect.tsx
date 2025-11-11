"use client";

import type { ApplicationStatus } from "@prisma/client";
import { useTransition } from "react";
import { updateApplicationStatus } from "@/actions/appllication";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface ApplicationStatusSelectProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
}

export function ApplicationStatusSelect({
  applicationId,
  currentStatus,
}: ApplicationStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    startTransition(async () => {
      try {
        await updateApplicationStatus(applicationId, newStatus);
        toast({
          title: "Success",
          description: "Status updated successfully.",
        });
      } catch (_error) {
        toast({ title: "Error", description: "Failed to update status." });
      }
    });
  };

  // Function to get badge variant based on status
  const getStatusVariant = (status: ApplicationStatus) => {
    switch (status) {
      case "ACCEPTED":
        return "default";
      case "REJECTED":
        return "destructive";
      case "UNDER_REVIEW":
        return "secondary";
      case "PENDING":
        return "outline";
      case "WITHDRAWN":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Function to get display text for status
  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case "ACCEPTED":
        return "Accepted";
      case "REJECTED":
        return "Rejected";
      case "UNDER_REVIEW":
        return "Under Review";
      case "PENDING":
        return "Pending";
      case "WITHDRAWN":
        return "Withdrawn";
      default:
        return status;
    }
  };

  return (
    <Select
      defaultValue={currentStatus}
      disabled={isPending}
      onValueChange={handleStatusChange}
    >
      <SelectTrigger className="w-[160px] focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <SelectValue placeholder="Select status">
          <Badge variant={getStatusVariant(currentStatus)}>
            {getStatusText(currentStatus)}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PENDING">
          <Badge variant="outline">Pending</Badge>
        </SelectItem>
        <SelectItem value="UNDER_REVIEW">
          <Badge variant="secondary">Under Review</Badge>
        </SelectItem>
        <SelectItem value="ACCEPTED">
          <Badge variant="default">Accepted</Badge>
        </SelectItem>
        <SelectItem value="REJECTED">
          <Badge variant="destructive">Rejected</Badge>
        </SelectItem>
        <SelectItem value="WITHDRAWN">
          <Badge variant="secondary">Withdrawn</Badge>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
