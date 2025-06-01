import { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Supplement Jobs - AtCampus",
  description:
    "Find and apply for supplement jobs to gain practical experience.",
});

export default async function JobsPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Supplement Jobs</h1>
        <p className="text-muted-foreground">
          Find and apply for supplement jobs to gain practical experience
        </p>
      </div>

      {/* Job listings will be implemented here */}
      <div className="flex flex-col gap-4">
        <div className="bg-card flex flex-col rounded-lg border p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">Research Assistant</h3>
              <p className="text-muted-foreground">
                Department of Computer Science
              </p>
            </div>
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
              Part-time
            </span>
          </div>
          <p className="my-4">
            Assist faculty with ongoing research projects in machine learning
            and data analysis.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="font-medium">Location:</span> On Campus
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">Hours:</span> 10-15 hrs/week
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">Pay:</span> $15/hr
            </span>
          </div>
        </div>

        <div className="bg-card flex flex-col rounded-lg border p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">Teaching Assistant</h3>
              <p className="text-muted-foreground">School of Business</p>
            </div>
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
              Part-time
            </span>
          </div>
          <p className="my-4">
            Support professors in grading assignments and conducting tutorial
            sessions for undergraduate courses.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="font-medium">Location:</span> Hybrid
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">Hours:</span> 8-12 hrs/week
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">Pay:</span> $18/hr
            </span>
          </div>
        </div>

        <div className="bg-card flex flex-col rounded-lg border p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">Library Assistant</h3>
              <p className="text-muted-foreground">University Library</p>
            </div>
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
              Part-time
            </span>
          </div>
          <p className="my-4">
            Help with circulation desk duties, shelving books, and assisting
            students with research resources.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="font-medium">Location:</span> On Campus
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">Hours:</span> 12-20 hrs/week
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">Pay:</span> $14/hr
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
