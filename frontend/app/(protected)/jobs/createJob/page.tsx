import React from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { CreateJobForm } from "@/components/forms/create-job-post";

export const metadata = constructMetadata({
  title: "Create Job - AtCampus",
  description: "Create Job.",
});
const PostJobPage = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/login");
  }
  return (
    <div className="mt-5">
      <CreateJobForm />
    </div>
  );
};

export default PostJobPage;
