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

interface JobApplication {
  id: string;
  job: any; // Will be properly typed later
}

interface Research {
  id: string;
  // Add research properties as needed
}

interface ActivitySectionProps {
  jobs: JobApplication[];
  research: Research[];
  userRole: string;
  userId: string;
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
  limit,
  canEdit,
  showHeader = true,
  className = "",
  onViewAllJobs,
  onViewAllResearch,
}: ActivitySectionProps) {
  const displayJobs = limit ? jobs?.slice(0, limit) : jobs;
  const displayResearch = limit ? research.slice(0, limit) : research;
  const hasMoreJobs = limit && jobs.length > limit;
  const hasMoreResearch = limit && research.length > limit;

  if (!showHeader) {
    // Simplified view for overview
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Jobs Card */}
        <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
          <CardHeader className="flex items-center justify-between pb-4">
            <CardTitle className="flex items-center font-medium text-lg">
              <Icons.job className="mr-2 size-5" />
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
            {displayJobs.length > 0 ? (
              displayJobs.map((application) => (
                <JobComponent job={application.job} key={application.id} />
              ))
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
        </Card>

        {/* Achievements Placeholder */}
        <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
          <CardHeader className="flex items-center justify-between pb-4">
            <CardTitle className="flex items-center font-medium text-lg">
              <Icons.star className="size-7 pr-2" />
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
              {hasMoreJobs && (
                <span className="ml-1 text-gray-500 text-xs">
                  ({jobs.length})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="research">
              <Icons.bookMarked className="size-4" />
              Research
              {hasMoreResearch && (
                <span className="ml-1 text-gray-500 text-xs">
                  ({research.length})
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="p-4" value="jobs">
          <div className="space-y-3">
            {displayJobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {displayJobs.map((application) => (
                    <JobComponent job={application.job} key={application.id} />
                  ))}
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
                <p className="mt-2 text-gray-500">No job activities yet</p>
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
          </div>
        </TabsContent>

        <TabsContent className="p-4" value="research">
          <div className="space-y-3">
            {displayResearch.length > 0 ? (
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
