"use client";
import { useRouter } from "next/navigation";
import ResearchComponent from "@/components/researches/Research";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResearchData, UserData } from "@/types/types"; // Import the correct type

interface ResearchTabProps {
  researches: ResearchData[] | ResearchData | null; // Handle both array and single object cases
  userRole: string;
  loggedInUserId: string;
  permissions: any;
  loading?: boolean;
  user?: UserData;
}

export default function ResearchTab({
  researches,
  loggedInUserId,
  permissions,
  loading = false,
}: ResearchTabProps) {
  const canEdit = loggedInUserId && permissions.canEdit;
  const router = useRouter();

  // Show loading skeleton if data is loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3">
        <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="flex items-center justify-between pb-4">
            <div className="flex items-center font-medium text-lg">
              <Skeleton className="mr-3 h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-32" />
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

  return (
    <div className="grid grid-cols-1 gap-3">
      <Card className="overflow-hidden rounded-xl border-none p-0 shadow-sm transition-all hover:border-gray-200 hover:shadow">
        <CardHeader className="flex items-center justify-between pb-4">
          <CardTitle className="text-lg">
            <span>Research</span>
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
          {researches && (researches as ResearchData[]).length > 0 ? (
            (researches as ResearchData[]).map((item: ResearchData) => (
              <ResearchComponent key={item.id} research={item} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center py-8">
              <Icons.bookMarked className="mb-4 size-16 text-gray-400" />
              <h3 className="mb-2 font-medium text-gray-700 text-xl">
                No research added yet
              </h3>
              <p className="mb-4 max-w-md text-center text-gray-500">
                No research projects are available at the moment.
              </p>
              {canEdit && (
                <Button
                  className="mt-4 cursor-pointer rounded-full"
                  onClick={() => router.push("/researches/createResearch")}
                  size="sm"
                  variant="outline"
                >
                  <Icons.add className="mr-2 size-4" />
                  Add Research
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
