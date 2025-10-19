import { BookOpen, Building2, GraduationCap, Users2 } from "lucide-react";
import { Icons } from "@/components/shared/icons";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ExtendedFaculty {
  id: string;
  name: string;
  description?: string;
  courses?: any[];
  _count?: { courses: number; members: number };
}

interface ExtendedSchool {
  id: string;
  name: string;
  description?: string;
  faculties?: ExtendedFaculty[];
  _count?: { faculties: number };
}

interface ExtendedOrganization {
  id: string;
  name: string;
  schools: ExtendedSchool[];
  _count?: { schools: number; members: number };
}

interface AnalyticsTabProps {
  user: any;
  permissions: any;
  loading?: boolean;
}

export default function AnalyticsTab({
  user,
  permissions,
  loading = false,
}: AnalyticsTabProps) {
  // Check if user has permission to view analytics
  const canView = permissions.canViewPrivate || permissions.canEdit;

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Icons.laptop className="mb-4 size-16 text-gray-400" />
        <h3 className="mb-2 font-medium text-gray-700 text-xl">
          Access Restricted
        </h3>
        <p className="max-w-md text-center text-gray-500">
          You don't have permission to view analytics for this institution.
        </p>
      </div>
    );
  }

  // Show loading skeleton if data is loading
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card className="p-4" key={i}>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-8" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <Skeleton className="mb-4 h-5 w-48" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div className="rounded-lg border p-4" key={i}>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const totalSchools = user?.schools?.length || 0;
  const totalFaculties =
    user?.schools?.reduce(
      (sum: number, school: any) => sum + (school.faculties?.length || 0),
      0
    ) || 0;
  const totalCourses =
    user?.schools?.reduce(
      (sum: number, school: any) =>
        sum +
        (school.faculties?.reduce(
          (fSum: number, faculty: any) => fSum + (faculty.courses?.length || 0),
          0
        ) || 0),
      0
    ) || 0;
  const totalMembers = user?._count?.members || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Icons.chart className="size-6" />
        <h2 className="font-bold text-2xl">Institution Analytics</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Building2 className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Schools</p>
              <p className="font-bold text-2xl">{totalSchools}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <GraduationCap className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Faculties</p>
              <p className="font-bold text-2xl">{totalFaculties}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <BookOpen className="size-5 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Courses</p>
              <p className="font-bold text-2xl">{totalCourses}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Users2 className="size-5 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Members</p>
              <p className="font-bold text-2xl">{totalMembers}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold text-lg">
          Academic Structure Overview
        </h3>
        <div className="space-y-4">
          {user?.schools?.map((school: any) => (
            <div className="rounded-lg border p-4" key={school.id}>
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{school.name}</h4>
                <div className="flex gap-4 text-gray-600 text-sm">
                  <span>{school.faculties?.length || 0} Faculties</span>
                  <span>
                    {school.faculties?.reduce(
                      (sum: number, f: any) => sum + (f.courses?.length || 0),
                      0
                    ) || 0}{" "}
                    Courses
                  </span>
                </div>
              </div>
            </div>
          )) || (
            <div className="py-8 text-center text-gray-500">
              <Icons.chart className="mx-auto mb-3 size-12 opacity-50" />
              <p>No data available for analytics</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
