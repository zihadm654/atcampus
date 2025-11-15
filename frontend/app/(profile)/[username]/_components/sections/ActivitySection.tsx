import JobComponent from "@/components/jobs/Job";
import ResearchComponent from "@/components/researches/Research";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/lib/validations/auth";
import type { JobData } from "@/types/types";

interface JobApplication {
  id: string;
  job: any; // Will be properly typed later
}

interface Research {
  id: string;
  // Add research properties as needed
}

interface ActivitySectionProps {
  jobs: JobApplication[] | JobData[];
  research: Research[];
  userRole: string;
  userId: string;
  loggedInUserId: string;
  canEdit: boolean;
  limit?: number;
  showHeader?: boolean;
  className?: string;
  onViewAllJobs?: () => void;
  onViewAllResearch?: () => void;
}

export default function ActivitySection({
  jobs,
  research,
  userRole,
  userId,
  loggedInUserId,
  canEdit,
  limit,
  showHeader = true,
  className = "",
  onViewAllJobs,
  onViewAllResearch,
}: ActivitySectionProps) {
  const displayJobs = limit ? jobs?.slice(0, limit) : jobs;
  const displayResearch = limit ? research.slice(0, limit) : research;
  const hasMoreJobs = limit && jobs && jobs.length > limit;
  const hasMoreResearch = limit && research && research.length > limit;

  // Helper function to render job content based on user role
  const renderJobContent = () => {
    const isStudent = userRole === UserRole.STUDENT;
    const isOrganization = userRole === UserRole.ORGANIZATION;
    const isOwnProfile = userId === loggedInUserId;

    // For students, show applied jobs message
    if (isStudent) {
      return (
        <>
          <CardHeader className="flex items-center justify-between pb-4">
            <CardTitle className="flex items-center font-medium text-lg">
              <span>Jobs & Activities</span>
            </CardTitle>
            <CardAction>
              <Button
                className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                onClick={onViewAllJobs}
                size="sm"
                variant="ghost"
              >
                <span>See More</span>
                <Icons.chevronRight className="size-5" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 max-md:grid-cols-1">
            {displayJobs && displayJobs.length > 0 ? (
              displayJobs.map((jobItem: any) => {
                // Handle both JobApplication and JobData types
                const job = jobItem.job || jobItem;
                return (
                  <div key={jobItem.id || job.id}>
                    {job ? (
                      <JobComponent job={job} />
                    ) : (
                      <div className="p-4 text-muted-foreground text-sm">
                        Job data not available
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 flex w-full flex-col items-center justify-center">
                <Icons.job className="size-10 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  No applied jobs yet
                </p>
                {canEdit && (
                  <Button
                    className="mt-4 rounded-full"
                    size="sm"
                    variant="outline"
                  >
                    <Icons.add className="mr-1 size-4" />
                    Apply to Jobs
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </>
      );
    }

    // For organizations, show created jobs message
    if (isOrganization) {
      return (
        <>
          <CardHeader className="flex items-center justify-between pb-4">
            <CardTitle className="flex items-center font-medium text-lg">
              <span>Job & Activities</span>
            </CardTitle>
            <CardAction>
              <Button
                className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                onClick={onViewAllJobs}
                size="sm"
                variant="ghost"
              >
                <span>See More</span>
                <Icons.chevronRight className="size-5" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
            {displayJobs && displayJobs.length > 0 ? (
              displayJobs.map((jobItem: any) => {
                // Handle both JobApplication and JobData types
                const job = jobItem.job || jobItem;
                return (
                  <div key={jobItem.id || job.id}>
                    {job ? (
                      <JobComponent job={job} />
                    ) : (
                      <div className="p-4 text-muted-foreground text-sm">
                        Job data not available
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 flex w-full flex-col items-center justify-center">
                <Icons.job className="size-10 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  No created jobs yet
                </p>
                {canEdit && (
                  <Button
                    className="mt-4 rounded-full"
                    size="sm"
                    variant="outline"
                  >
                    <Icons.add className="mr-1 size-4" />
                    Create Job
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </>
      );
    }

    // For other roles, show generic jobs message
    return (
      <>
        <CardHeader className="flex items-center justify-between pb-4">
          <CardTitle className="flex items-center font-medium text-lg">
            <span>Jobs & Activities</span>
          </CardTitle>
          <CardAction>
            <Button
              className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
              onClick={onViewAllJobs}
              size="sm"
              variant="ghost"
            >
              <span>See More</span>
              <Icons.chevronRight className="size-5" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
          {displayJobs && displayJobs.length > 0 ? (
            displayJobs.map((jobItem: any) => {
              // Handle both JobApplication and JobData types
              const job = jobItem.job || jobItem;
              return (
                <div key={jobItem.id || job.id}>
                  {job ? (
                    <JobComponent job={job} />
                  ) : (
                    <div className="p-4 text-muted-foreground text-sm">
                      Job data not available
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-2 flex w-full flex-col items-center justify-center">
              <Icons.job className="size-10 text-gray-400" />
              <p className="mt-2 text-gray-500">
                No job activities added yet
              </p>
              {canEdit && (
                <Button
                  className="mt-4 rounded-full"
                  size="sm"
                  variant="outline"
                >
                  <Icons.add className="mr-1 size-4" />
                  Add Experience
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </>
    );
  };

  if (!showHeader) {
    // Simplified view for overview
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="overflow-hidden rounded-xl shadow-sm transition-all hover:border-gray-200 hover:shadow">
          {renderJobContent()}
        </Card>

        {/* Achievements Placeholder */}
        <Card className="overflow-hidden rounded-xl shadow-sm transition-all hover:border-gray-200 hover:shadow">
          <CardHeader className="flex items-center justify-between pb-4">
            <CardTitle className="flex items-center font-medium text-lg">
              Achievements
            </CardTitle>
            <CardAction>
              <Button
                className="rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                size="sm"
                variant="ghost"
              >
                <span>See More</span>
                <Icons.chevronRight className="size-5" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex h-28 items-center justify-center rounded-lg text-gray-500">
              <div className="flex flex-col items-center">
                <Icons.star className="size-10" />
                <p className="mt-2 text-sm">No achievements yet</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Full tabbed view for dedicated activity tabs
  return (
    <Card
      className={`overflow-hidden rounded-xl border border-gray-100 shadow-sm ${className}`}
    >
      <Tabs className="w-full" defaultValue="jobs">
        <div className="border-b px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger className="flex items-center gap-2" value="jobs">
              <Icons.job className="size-4" />
              Jobs & Activities
              {hasMoreJobs && jobs && (
                <span className="ml-1 text-gray-500 text-xs">
                  ({jobs.length})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="research">
              <Icons.bookMarked className="size-4" />
              Research
              {hasMoreResearch && research && (
                <span className="ml-1 text-gray-500 text-xs">
                  ({research.length})
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="p-4" value="jobs">
          <div className="space-y-3">
            {displayJobs && displayJobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {displayJobs.map((jobItem: any) => {
                    // Handle both JobApplication and JobData types
                    const job = jobItem.job || jobItem;
                    return (
                      <div key={jobItem.id || job.id}>
                        {job ? (
                          <JobComponent job={job} />
                        ) : (
                          <div className="rounded-lg border p-4 text-muted-foreground text-sm">
                            Job data not available
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {hasMoreJobs && (
                  <div className="text-center">
                    <Button
                      className="rounded-full"
                      onClick={onViewAllJobs}
                      variant="outline"
                    >
                      View All Jobs ({jobs.length})
                      <Icons.chevronRight className="ml-1 size-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center py-8">
                <Icons.job className="size-12 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  {userRole === UserRole.STUDENT
                    ? "No applied jobs yet"
                    : userRole === UserRole.ORGANIZATION
                      ? "No created jobs yet"
                      : "No job activities yet"}
                </p>
                {canEdit && (
                  <Button
                    className="mt-4 rounded-full"
                    size="sm"
                    variant="outline"
                  >
                    <Icons.add className="mr-1 size-4" />
                    {userRole === UserRole.STUDENT
                      ? "Apply to Jobs"
                      : userRole === UserRole.ORGANIZATION
                        ? "Create Job"
                        : "Add Experience"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent className="p-4" value="research">
          <div className="space-y-3">
            {displayResearch && displayResearch.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {displayResearch.map((item) => (
                    <ResearchComponent key={item.id} research={item as any} />
                  ))}
                </div>
                {hasMoreResearch && (
                  <div className="text-center">
                    <Button
                      className="rounded-full"
                      onClick={onViewAllResearch}
                      variant="outline"
                    >
                      View All Research ({research.length})
                      <Icons.chevronRight className="ml-1 size-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center py-8">
                <Icons.bookMarked className="size-12 text-gray-400" />
                <p className="mt-2 text-gray-500">No research projects yet</p>
                {canEdit && (
                  <Button
                    className="mt-4 rounded-full"
                    size="sm"
                    variant="outline"
                  >
                    <Icons.add className="mr-1 size-4" />
                    Add Research
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}