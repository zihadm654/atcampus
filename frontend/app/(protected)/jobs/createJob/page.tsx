import { redirect } from "next/navigation";
import { CreateJobForm } from "@/components/forms/create-job-post";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";

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
    <div className="mt-5 w-full">
      <CreateJobForm />
    </div>
  );
};

export default PostJobPage;
