"use client";
import { toast } from "sonner";
import { applyJob } from "@/actions/appllication";
import { Button } from "@/components/ui/button";

const Client = ({ job, user }: any) => {
  const handleApply = async () => {
    const res = await applyJob(job.id);
    if (res.success) {
      toast(res.message);
    } else {
      toast(res.message);
    }
  };
  return (
    <Button
      disabled={
        job.application?.some(
          (application) => application.applicantId === user.id
        ) || user.role !== "STUDENT"
      }
      onClick={handleApply}
      variant="default"
    >
      {job.application?.some(
        (application) => application.applicantId === user.id
      )
        ? "Already Applied"
        : "Apply Now"}
    </Button>
  );
};

export default Client;
