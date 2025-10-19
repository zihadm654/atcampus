import { redirect } from "next/navigation";
import { CreateResearchForm } from "@/components/forms/create-research-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "Create research - AtCampus",
  description: "Create Research.",
});
const PostJobPage = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/login");
  }
  return (
    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <CreateResearchForm />

      <div className="col-span-1">
        <Card className="lg:sticky lg:top-4">
          <CardHeader>
            <CardTitle className="text-xl">
              Trusted by Industry Leaders
            </CardTitle>
            <CardDescription>
              Join thousands of companies hiring top talent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6" />
        </Card>
      </div>
    </div>
  );
};

export default PostJobPage;
