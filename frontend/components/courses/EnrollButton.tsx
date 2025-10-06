"use client";

import { useSession } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { enrollCourse } from "@/actions/enrollment";
import { useTransition } from "react";

export default function EnrollButton({ courseId, initialEnrolled = false }) {
  const { data: session } = useSession();
  const user = session?.user;
  if (!user) return null;

  const [isPending, startTransition] = useTransition();

  const handleEnroll = () => {
    startTransition(async () => {
      const res = await enrollCourse(courseId);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Button
      onClick={handleEnroll}
      variant="default"
      disabled={initialEnrolled || isPending || user.role !== "STUDENT"}
    >
      {isPending ? "Enrolling..." : initialEnrolled ? "Already Enrolled" : "Enroll Now"}
    </Button>
  );
}
