import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";
import JobComponent from "@/components/jobs/Job";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/lib/validations/auth";
import { JobData } from "@/types/types";

interface JobApplication {
  id: string;
  job: JobData;
  applicantId?: string;
}

interface JobsTabProps {
  jobs: any;
  userRole: UserRole;
  loggedInUserId: string;
  permissions: any;
  loading?: boolean;
}

export default function JobsTab({
  jobs,
  userRole,
  loggedInUserId,
  permissions,
  loading = false,
}: JobsTabProps) {
  const canEdit = loggedInUserId && permissions.canEdit;

  // Show loading skeleton if data is loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3">
        <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="flex items-center justify-between pb-4">
            <div className="flex items-center text-lg font-medium">
              <Skeleton className="h-5 w-5 mr-3 rounded-full" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <div className="flex items-center justify-between mt-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render content based on user role
  const renderJobsContent = () => {
    switch (userRole) {
      case UserRole.STUDENT:
        // For students, show applied jobs
        return (
          <div className="grid grid-cols-1 gap-3">
            <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
              <CardHeader className="flex items-center justify-between pb-4">
                <CardTitle className="flex items-center text-lg font-medium">
                  <Icons.job className="mr-3 size-5" />
                  <span>Applied Jobs</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                >
                  <span>See More</span>
                  <Icons.chevronRight className="size-5" />
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {jobs && jobs.length > 0 ? (
                  jobs.map((job: JobData) => (
                    <JobComponent key={job.id} job={job} />
                  ))
                ) : (
                  <div className="flex flex-col items-center col-span-full py-8">
                    <Icons.job className="size-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">
                      No Applied Jobs Found
                    </h3>
                    <p className="text-gray-500 text-center max-w-md mb-4">
                      You haven't applied to any jobs yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case UserRole.ORGANIZATION:
        // For organizations, show created jobs
        return (
          <div className="grid grid-cols-1 gap-3">
            <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
              <CardHeader className="flex items-center justify-between pb-4">
                <CardTitle className="flex items-center text-lg font-medium">
                  <Icons.job className="mr-3 size-5" />
                  <span>Created Jobs</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                >
                  <span>See More</span>
                  <Icons.chevronRight className="size-5" />
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {jobs && jobs.length > 0 ? (
                  jobs.map((job: JobData) => (
                    <JobComponent key={job.id} job={job} />
                  ))
                ) : (
                  <div className="flex flex-col items-center col-span-full py-8">
                    <Icons.job className="size-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">
                      No Created Jobs Found
                    </h3>
                    <p className="text-gray-500 text-center max-w-md mb-4">
                      You haven't created any jobs yet.
                    </p>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-full"
                      >
                        <Icons.add className="size-4 mr-2" />
                        Create Job
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        // For other roles (ADMIN, INSTITUTION, PROFESSOR), show a generic message or all jobs
        return (
          <div className="grid grid-cols-1 gap-3">
            <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
              <CardHeader className="flex items-center justify-between pb-4">
                <CardTitle className="flex items-center text-lg font-medium">
                  <Icons.job className="mr-3 size-5" />
                  <span>Jobs & Activities</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                >
                  <span>See More</span>
                  <Icons.chevronRight className="size-5" />
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {jobs && jobs.length > 0 ? (
                  jobs.map((job: JobData) => (
                    <JobComponent key={job.id} job={job} />
                  ))
                ) : (
                  <div className="flex flex-col items-center col-span-full py-8">
                    <Icons.job className="size-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">
                      No Jobs or Activities Found
                    </h3>
                    <p className="text-gray-500 text-center max-w-md mb-4">
                      No jobs or activities are available at the moment.
                    </p>
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 rounded-full"
                      >
                        <Icons.add className="size-4 mr-2" />
                        Add Experience
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return renderJobsContent();
}