import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Building,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
} from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JobPageProps {
  params: {
    jobId: string;
  };
}

export async function generateMetadata({
  params,
}: JobPageProps): Promise<Metadata> {
  // In a real implementation, fetch job data from API/database
  return constructMetadata({
    title: `Job Details - AtCampus`,
    description: "View detailed information about this job opportunity.",
  });
}

export default async function JobPage({ params }: JobPageProps) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  // This is a placeholder. In a real implementation, you would fetch job data
  // based on the jobId parameter
  const jobId = params.jobId;

  // Mock job data for demonstration
  const job = {
    id: jobId,
    title: "Research Assistant",
    department: "Department of Computer Science",
    description:
      "Assist faculty with ongoing research projects in machine learning and data analysis. Responsibilities include data collection, preprocessing, analysis, and visualization. The ideal candidate should have basic programming skills and an interest in research methodologies.",
    responsibilities: [
      "Collect and organize research data",
      "Assist with literature reviews and documentation",
      "Develop and maintain databases",
      "Prepare reports and presentations",
      "Attend research meetings and take notes",
    ],
    qualifications: [
      "Currently enrolled student in Computer Science or related field",
      "Basic programming skills (Python preferred)",
      "Strong analytical and problem-solving abilities",
      "Good communication and documentation skills",
      "Ability to work independently and as part of a team",
    ],
    location: "On Campus",
    type: "Part-time",
    hours: "10-15 hrs/week",
    pay: "$15/hr",
    postedDate: "May 10, 2023",
    applicationDeadline: "June 30, 2023",
    contactPerson: "Dr. Robert Chen",
    contactEmail: "r.chen@university.edu",
  };

  // If job not found, show 404 page
  if (!job) {
    notFound();
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/jobs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{job.title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="border-b p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{job.title}</h2>
                  <p className="text-muted-foreground">{job.department}</p>
                </div>
                <Badge variant="secondary" className="w-fit">
                  {job.type}
                </Badge>
              </div>
            </div>

            <div className="p-6">
              <h3 className="mb-3 text-lg font-medium">Job Description</h3>
              <p className="text-muted-foreground mb-6">{job.description}</p>

              <h3 className="mb-3 text-lg font-medium">Responsibilities</h3>
              <ul className="mb-6 list-inside list-disc space-y-1">
                {job.responsibilities.map((item, index) => (
                  <li key={index} className="text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>

              <h3 className="mb-3 text-lg font-medium">Qualifications</h3>
              <ul className="mb-6 list-inside list-disc space-y-1">
                {job.qualifications.map((item, index) => (
                  <li key={index} className="text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>

              <Button className="w-full">Apply Now</Button>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium">Job Details</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-primary mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-muted-foreground">{job.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="text-primary mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Hours</p>
                  <p className="text-muted-foreground">{job.hours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="text-primary mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Pay</p>
                  <p className="text-muted-foreground">{job.pay}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="text-primary mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Application Deadline</p>
                  <p className="text-muted-foreground">
                    {job.applicationDeadline}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building className="text-primary mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Contact</p>
                  <p className="text-muted-foreground">{job.contactPerson}</p>
                  <p className="text-muted-foreground">{job.contactEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
