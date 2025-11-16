import JobComponent from "@/components/jobs/Job";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/lib/validations/auth";
import type { JobData } from "@/types/types";

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
        <Card className="overflow-hidden rounded-xl border-none p-0 shadow-sm">
          <CardHeader className="flex items-center justify-between pb-4">
            <div className="flex items-center font-medium text-lg">
              <Skeleton className="mr-3 h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div className="rounded-lg border p-4" key={i}>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <div className="mt-4 flex items-center justify-between">
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
            <Card className="overflow-hidden rounded-xl border-none p-0 shadow-sm transition-all hover:border-gray-200 hover:shadow">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  <span>Jobs & Activities</span>
                </CardTitle>
                <Button
                  className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                  size="sm"
                  variant="ghost"
                >
                  <span>See More</span>
                  <Icons.chevronRight className="size-5" />
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {jobs && jobs.length > 0 ? (
                  jobs.map((job: JobData) => (
                    <div key={job.id}>
                      {job ? (
                        <JobComponent job={job} />
                      ) : (
                        <div className="rounded-lg border p-4 text-muted-foreground text-sm">
                          Job data not available
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center py-8">
                    <Icons.job className="mb-4 size-16 text-gray-400" />
                    <h3 className="mb-2 font-medium text-gray-700 text-xl">
                      No Applied Jobs Found
                    </h3>
                    <p className="mb-4 max-w-md text-center text-gray-500">
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
            <Card className="overflow-hidden rounded-xl border-none p-0 shadow-sm transition-all hover:border-gray-200 hover:shadow">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  <span>Jobs & Activities</span>
                </CardTitle>
                <Button
                  className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                  size="sm"
                  variant="ghost"
                >
                  <span>See More</span>
                  <Icons.chevronRight className="size-5" />
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {jobs && jobs.length > 0 ? (
                  jobs.map((job: JobData) => (
                    <div key={job.id}>
                      {job ? (
                        <JobComponent job={job} />
                      ) : (
                        <div className="rounded-lg border p-4 text-muted-foreground text-sm">
                          Job data not available
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center py-8">
                    <Icons.job className="mb-4 size-16 text-gray-400" />
                    <h3 className="mb-2 font-medium text-gray-700 text-xl">
                      No Created Jobs Found
                    </h3>
                    <p className="mb-4 max-w-md text-center text-gray-500">
                      You haven't created any jobs yet.
                    </p>
                    {canEdit && (
                      <Button
                        className="mt-4 rounded-full"
                        size="sm"
                        variant="outline"
                      >
                        <Icons.add className="mr-2 size-4" />
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
            <Card className="overflow-hidden rounded-xl border-none p-0 shadow-sm transition-all hover:border-gray-200 hover:shadow">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  <span>Jobs & Activities</span>
                </CardTitle>
                <Button
                  className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                  size="sm"
                  variant="ghost"
                >
                  <span>See More</span>
                  <Icons.chevronRight className="size-5" />
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {jobs && jobs.length > 0 ? (
                  jobs.map((job: JobData) => (
                    <div key={job.id}>
                      {job ? (
                        <JobComponent job={job} />
                      ) : (
                        <div className="rounded-lg border p-4 text-muted-foreground text-sm">
                          Job data not available
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center py-8">
                    <Icons.job className="mb-4 size-16 text-gray-400" />
                    <h3 className="mb-2 font-medium text-gray-700 text-xl">
                      No Jobs or Activities Found
                    </h3>
                    <p className="mb-4 max-w-md text-center text-gray-500">
                      No jobs or activities are available at the moment.
                    </p>
                    {canEdit && (
                      <Button
                        className="mt-4 rounded-full"
                        size="sm"
                        variant="outline"
                      >
                        <Icons.add className="mr-2 size-4" />
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
