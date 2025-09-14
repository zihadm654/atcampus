"use client";

import { useState } from "react";
import { Building2, GraduationCap, BookOpen, Users2 } from "lucide-react";
import { formatDate } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";
import { Skeleton } from "@/components/ui/skeleton";

import SchoolCard from "./SchoolCard";

// Custom hook for managing expansion state
function useExpansionState() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return { expanded, toggle };
}

// Types from the existing implementation
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

interface AcademicStructureProps {
  organizationData?: ExtendedOrganization[];
  canEdit: boolean;
  onEditSchool?: (school: ExtendedSchool) => void;
  onDeleteSchool?: (schoolId: string) => void;
  onDeleteFaculty?: (facultyId: string) => void;
  onAddSchool?: () => void;
  onAddFaculty?: (schoolId: string) => void;
  onEditFaculty?: (faculty: ExtendedFaculty) => void;
  onAddCourse?: (facultyId: string) => void;
  onEditCourse?: (course: any) => void;
  onDeleteCourse?: (courseId: string) => void;
  onViewCourseDetails?: (courseId: string) => void;
  loading?: boolean;
}

export default function AcademicStructure({
  organizationData,
  canEdit,
  onEditSchool,
  onDeleteSchool,
  onDeleteFaculty,
  onAddSchool,
  onAddFaculty,
  onEditFaculty,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onViewCourseDetails,
  loading = false,
}: AcademicStructureProps) {
  const { expanded: expandedSchools, toggle: toggleSchool } = useExpansionState();
  const { expanded: expandedFaculties, toggle: toggleFaculty } = useExpansionState();

  // Show loading skeleton if data is loading
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-20" />
            {canEdit && <Skeleton className="h-8 w-24" />}
          </div>
        </div>

        {/* Schools Grid */}
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="text-left space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <div className="flex items-center gap-4 mt-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canEdit && <Skeleton className="h-8 w-8 rounded-full" />}
                  <Skeleton className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                  {[1, 2].map((j) => (
                    <div key={j} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-8 h-8 rounded-md" />
                          <div className="text-left space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                            <div className="flex items-center gap-3 mt-1">
                              <Skeleton className="h-4 w-16" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canEdit && <Skeleton className="h-6 w-6 rounded-full" />}
                          <Skeleton className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
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

        {/* Academic Structure Overview */}
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

  // Get the primary organization (institutions typically have one)
  const organization = organizationData?.[0];

  if (!organization?.schools?.length) {
    return (
      <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
        <CardContent className="flex flex-col items-center py-12">
          <Building2 className="size-16 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-700 mt-4">No Schools Found</h3>
          <p className="text-gray-500 mt-2 text-center max-w-md">
            This institution doesn't have any schools yet. Schools help organize faculties and courses.
          </p>
          {canEdit && (
            <Button className="mt-6" variant="outline" onClick={onAddSchool}>
              <Icons.add className="size-4 mr-2" />
              Add First School
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const totalSchools = organization.schools.length;
  const totalFaculties = organization.schools.reduce((sum, school) =>
    sum + (school.faculties?.length || 0), 0);
  const totalCourses = organization.schools.reduce((sum, school) =>
    sum + (school.faculties?.reduce((fSum, faculty) =>
      fSum + (faculty.courses?.length || 0), 0) || 0), 0);
  const totalMembers = organization._count?.members || 0;

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="size-6" />
          Schools & Academic Structure
        </h2>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1">
            {totalSchools} School{totalSchools !== 1 ? 's' : ''}
          </Badge>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={onAddSchool}>
              <Icons.add className="size-4 mr-2" />
              Add School
            </Button>
          )}
        </div>
      </div>

      {/* Schools Grid */}
      <div className="grid gap-4">
        {organization.schools.map((school) => (
          <SchoolCard
            key={school.id}
            school={school}
            expanded={expandedSchools.has(school.id)}
            onToggle={() => toggleSchool(school.id)}
            expandedFaculties={expandedFaculties}
            onToggleFaculty={toggleFaculty}
            canEdit={canEdit}
            onEdit={onEditSchool}
            onDelete={onDeleteSchool}
            onDeleteFaculty={onDeleteFaculty}
            onAddFaculty={onAddFaculty}
            onEditFaculty={onEditFaculty}
            onAddCourse={onAddCourse}
            onEditCourse={onEditCourse}
            onDeleteCourse={onDeleteCourse}
            onViewCourseDetails={onViewCourseDetails}
          />
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
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

      {/* Academic Structure Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Academic Structure Overview</h3>
        <div className="space-y-4">
          {organization.schools.map((school) => (
            <div key={school.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{school.name}</h4>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>{school.faculties?.length || 0} Faculties</span>
                  <span>
                    {school.faculties?.reduce((sum, f) => sum + (f.courses?.length || 0), 0) || 0} Courses
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}