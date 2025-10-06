"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/shared/icons";
import ResearchComponent from "@/components/researches/Research";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { UserData } from "@/types";
import { UserRole } from "@/lib/validations/auth";

interface ResearchItem {
  id: string;
  userId: string;
  collaborators?: any[]; // Make collaborators optional
  [key: string]: any; // Allow other properties
}

interface ResearchTabProps {
  researches: any;
  userRole: string;
  loggedInUserId: string;
  permissions: any;
  loading?: boolean;
  user?: UserData; // Make user prop optional
}

export default function ResearchTab({
  researches,
  userRole,
  loggedInUserId,
  permissions,
  loading = false,
  user, // Destructure user prop
}: ResearchTabProps) {
  const canEdit = loggedInUserId && permissions.canEdit;
  const isOwnProfile = user ? loggedInUserId === user.id : false;
  const router = useRouter();

  // Filter researches based on user role and ownership
  const getFilteredResearches = () => {
    switch (userRole) {
      case UserRole.STUDENT:
        // Students see their own researches
        return researches;
      case UserRole.PROFESSOR:
        // Professors see their own researches
        return researches;
      case UserRole.INSTITUTION:
        // Institutions see researches created by them
        return researches;
      case UserRole.ORGANIZATION:
        // Organizations see their own researches
        return researches;
      case UserRole.ADMIN:
        // Admins see all researches
        return researches;
      default:
        return researches;
    }
  };

  const filteredResearches = getFilteredResearches();

  // Show loading skeleton if data is loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3">
        <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
          <CardHeader className="flex items-center justify-between pb-4">
            <div className="flex items-center text-lg font-medium">
              <Skeleton className="h-5 w-5 mr-3 rounded-full" />
              <Skeleton className="h-6 w-32" />
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

  return (
    <div className="grid grid-cols-1 gap-3">
      <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
        <CardHeader className="flex items-center justify-between pb-4">
          <CardTitle className="flex items-center text-lg font-medium">
            <Icons.bookMarked className="mr-3 size-5" />
            <span>Research</span>
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
          {filteredResearches && filteredResearches.length > 0 ? (
            filteredResearches.map((item: ResearchItem) => (
              <ResearchComponent key={item.id} research={item} />
            ))
          ) : (
            <div className="flex flex-col items-center col-span-full py-8">
              <Icons.bookMarked className="size-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No research added yet
              </h3>
              <p className="text-gray-500 text-center max-w-md mb-4">
                No research projects are available at the moment.
              </p>
              {canEdit && (
                <Button
                  onClick={() => router.push("/researches/createResearch")}
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-full cursor-pointer"
                >
                  <Icons.add className="size-4 mr-2" />
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