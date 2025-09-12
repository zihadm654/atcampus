"use client";

import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateApplicationStatus } from "@/actions/appllication";
import { toast } from "@/components/ui/use-toast";
import { ApplicationStatus } from "@prisma/client";


interface ApplicationStatusSelectProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
}

export function ApplicationStatusSelect({ applicationId, currentStatus }: ApplicationStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    startTransition(async () => {
      try {
        await updateApplicationStatus(applicationId, newStatus);
        toast({ title: "Success", description: "Status updated successfully." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to update status." });
      }
    });
  };

  return (
    <Select onValueChange={handleStatusChange} defaultValue={currentStatus} disabled={isPending}>
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