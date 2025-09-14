import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";
import { Building2, GraduationCap, BookOpen, Users2 } from "lucide-react";
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
  organizationData: ExtendedOrganization[];
  user: any;
  permissions: any;
  loading?: boolean;
}

export default function AnalyticsTab({ organizationData, user, permissions, loading = false }: AnalyticsTabProps) {
  // Check if user has permission to view analytics
  const canView = permissions.canViewPrivate || permissions.canEdit;

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Icons.laptop className="size-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">Access Restricted</h3>
        <p className="text-gray-500 text-center max-w-md">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-8" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <Skeleton className="h-5 w-48 mb-4" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-lg p-4">
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

  const organization = organizationData[0];

  const totalSchools = organization?.schools?.length || 0;
  const totalFaculties = organization?.schools?.reduce((sum: number, school: any) => sum + (school.faculties?.length || 0), 0) || 0;
  const totalCourses = organization?.schools?.reduce((sum: number, school: any) =>
    sum + (school.faculties?.reduce((fSum: number, faculty: any) => fSum + (faculty.courses?.length || 0), 0) || 0), 0) || 0;
  const totalMembers = organization?._count?.members || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Icons.chart className="size-6" />
        <h2 className="text-2xl font-bold">Institution Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Schools</p>
              <p className="text-2xl font-bold">{totalSchools}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Faculties</p>
              <p className="text-2xl font-bold">{totalFaculties}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="size-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold">{totalCourses}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users2 className="size-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold">{totalMembers}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Academic Structure Overview</h3>
        <div className="space-y-4">
          {organization?.schools?.map((school: any) => (
            <div key={school.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{school.name}</h4>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>{school.faculties?.length || 0} Faculties</span>
                  <span>
                    {school.faculties?.reduce((sum: number, f: any) => sum + (f.courses?.length || 0), 0) || 0} Courses
                  </span>
                </div>
              </div>
            </div>
          )) || (
              <div className="text-center py-8 text-gray-500">
                <Icons.chart className="size-12 mx-auto mb-3 opacity-50" />
                <p>No data available for analytics</p>
              </div>
            )}
        </div>
      </Card>
    </div>
  );
}