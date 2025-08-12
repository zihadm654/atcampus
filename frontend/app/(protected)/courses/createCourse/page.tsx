import { redirect } from "next/navigation";
import React from "react";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { CreateCourseForm } from "@/components/forms/create-course";

export const metadata = constructMetadata({
  title: "Create Job - AtCampus",
  description: "Create Job.",
});
const PostCoursePage = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/login");
  }
  return (
    <div className="mt-5 w-full">
      <CreateCourseForm />
    </div>
  );
};

export default PostCoursePage;
