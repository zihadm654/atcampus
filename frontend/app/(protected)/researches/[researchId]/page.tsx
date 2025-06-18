import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building,
  Calendar,
  Clock,
  DollarSign,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JobPageProps {
  params: Promise<{
    jobId: string;
  }>;
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
  const { jobId } = await params;

  // Mock job data
  const job = {
    id: jobId,
    title: "Research Assistant",
    department: "Department of Computer Science",
    description:
      "Assist faculty with ongoing research projects in machine learning and data analysis.",
    responsibilities: [
      "Collect and preprocess data for research projects",
      "Implement and test machine learning algorithms",
      "Assist with literature reviews and documentation",
      "Participate in weekly research team meetings",
      "Help prepare research findings for publication",
    ],
    qualifications: [
      "Currently enrolled in Computer Science or related field",
      "Strong programming skills in Python",
      "Familiarity with machine learning frameworks (TensorFlow, PyTorch)",
      "Good understanding of statistics and data analysis",
      "Excellent communication and documentation skills",
    ],
    location: "On Campus",
    type: "Part-time",
    hours: "10-15 hrs/week",
    pay: "$15/hr",
    deadline: "2023-12-15",
    contactName: "Dr. Sarah Johnson",
    contactEmail: "sjohnson@university.edu",
    contactPhone: "(555) 123-4567",
  };

  // If job not found, return 404
  if (!job) {
    notFound();
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Back button */}
      <Link
        href="/jobs"
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all jobs
      </Link>

      {/* Header with gradient background */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500/80 to-indigo-600/80 p-6 text-white shadow-md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-2.5">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <Badge className="mb-2 bg-blue-700 text-xs font-medium text-white hover:bg-blue-800">
                {job.type}
              </Badge>
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <div className="flex items-center gap-2 text-white/80">
                <Building className="h-4 w-4" />
                <p>{job.department}</p>
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
              <Clock className="h-4 w-4" />
              <span>{job.hours}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
              <DollarSign className="h-4 w-4" />
              <span>{job.pay}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
              <Calendar className="h-4 w-4" />
              <span>Deadline: {job.deadline}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content and sidebar */}
      <div className="flex w-full flex-col gap-6 lg:flex-row">
        {/* Main content */}
        <div className="flex-1 space-y-6">
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <span className="rounded-full bg-blue-100 p-1.5 text-blue-700">
                <Briefcase className="h-5 w-5" />
              </span>
              Description
            </h2>
            <p className="text-muted-foreground">{job.description}</p>
          </div>

          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <span className="rounded-full bg-green-100 p-1.5 text-green-700">
                <Briefcase className="h-5 w-5" />
              </span>
              Responsibilities
            </h2>
            <ul className="text-muted-foreground space-y-3">
              {job.responsibilities.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <span className="rounded-full bg-purple-100 p-1.5 text-purple-700">
                <GraduationCap className="h-5 w-5" />
              </span>
              Qualifications
            </h2>
            <ul className="text-muted-foreground space-y-3">
              {job.qualifications.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full space-y-6 lg:w-80">
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <span className="rounded-full bg-blue-100 p-1.5 text-blue-700">
                <Mail className="h-5 w-5" />
              </span>
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                  <User className="h-5 w-5 text-gray-600" />
                </span>
                <div>
                  <p className="text-muted-foreground text-sm">Name</p>
                  <p className="font-medium">{job.contactName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                  <Mail className="h-5 w-5 text-gray-600" />
                </span>
                <div>
                  <p className="text-muted-foreground text-sm">Email</p>
                  <p className="font-medium">{job.contactEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                  <Phone className="h-5 w-5 text-gray-600" />
                </span>
                <div>
                  <p className="text-muted-foreground text-sm">Phone</p>
                  <p className="font-medium">{job.contactPhone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Apply Now
            </Button>
            <Button variant="outline" className="w-full">
              Save Job
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
