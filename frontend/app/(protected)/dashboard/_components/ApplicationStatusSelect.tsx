"use client";

import type { ApplicationStatus } from "@prisma/client";
import { useTransition } from "react";
import { updateApplicationStatus } from "@/actions/appllication";
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
      } catch (error) {
        toast({ title: "Error", description: "Failed to update status." });
      }
    });
  };

  return (
    <Select
      defaultValue={currentStatus}
      disabled={isPending}
      onValueChange={handleStatusChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="accepted">Accepted</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
      </SelectContent>
    </Select>
  );
}
