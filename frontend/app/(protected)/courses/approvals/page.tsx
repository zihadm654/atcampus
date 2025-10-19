import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { ApprovalDashboard } from "../approvals/_components/ApprovalDashboard";

export const metadata = constructMetadata({
  title: "Course Approvals - AtCampus",
  description: "Review and approve course submissions.",
});

export default async function CourseApprovalsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between gap-2 p-2">
        <div>
          <h1 className="font-bold text-3xl max-md:text-xl">
            Course Approvals
          </h1>
          <p className="text-muted-foreground max-md:text-sm">
            Review and approve course submissions
          </p>
        </div>
      </div>
      <ApprovalDashboard user={user} />
    </div>
  );
}
