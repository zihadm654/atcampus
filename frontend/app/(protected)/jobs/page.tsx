import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Briefcase,
  Building,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Search,
} from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import JobFeed from "@/components/feed/JobFeed";

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
      {/* Header with gradient background */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500/80 to-indigo-600/80 p-6 text-white shadow-md">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Supplement Jobs</h1>
          </div>
          <p className="max-w-2xl text-white/90">
            Find and apply for supplement jobs to gain practical experience and
            enhance your skills while studying
          </p>

          {/* Search bar */}
          <div className="mt-4 flex w-full max-w-md items-center gap-2 rounded-lg bg-white/10 p-1 backdrop-blur-sm">
            <div className="flex h-10 w-full items-center gap-2 rounded-md bg-white px-3 text-gray-800">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search for jobs..."
                className="h-full w-full border-0 bg-transparent outline-none placeholder:text-gray-400"
              />
            </div>
            <Button
              size="sm"
              className="h-10 rounded-md bg-blue-700 hover:bg-blue-800"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="rounded-full">
          All Jobs
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          On Campus
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          Remote
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          Part-time
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          Full-time
        </Button>
      </div>

      {/* Job listings */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <JobFeed />
      </div>
    </div>
  );
}
