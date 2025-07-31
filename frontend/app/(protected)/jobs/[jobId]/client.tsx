"use client";
import { applyJob } from "@/actions/appllication";
import { Button } from "@/components/ui/button";
import React from "react";
import { toast } from "sonner";

const Client = ({ job, user }: any) => {
  const handleApply = async () => {
    const res = await applyJob(job.id);
    if (!res.success) {
      toast(res.message);
    } else {
      toast(res.message);
    }
  };
  return (
    <Button
      onClick={handleApply}
      variant="default"
      disabled={job.application.some(
        (application) => application.applicantId === user.id
      )}
    >
      {job.application.some(
        (application) => application.applicantId === user.id
      )
        ? "Already Applied"
        : "Apply Now"}
    </Button>
  );
};

export default Client;
