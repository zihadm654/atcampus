"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { enrollCourse } from "@/actions/enrollment";
import { useSession } from "@/lib/auth-client";
import { Button } from "../ui/button";

export default function EnrollButton({
  courseId,
  initialEnrolled = false,
}: {
  courseId: string;
  initialEnrolled?: boolean;
}) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const user = session?.user;
  if (!user) return null;

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
      disabled={initialEnrolled || isPending || user.role !== "STUDENT"}
      onClick={handleEnroll}
      variant="default"
    >
      {isPending
        ? "Enrolling..."
        : initialEnrolled
          ? "Already Enrolled"
          : "Enroll Now"}
    </Button>
  );
}
