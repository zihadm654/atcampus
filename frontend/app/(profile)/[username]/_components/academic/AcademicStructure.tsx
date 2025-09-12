"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";

import SchoolCard from "./SchoolCard";

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
}

export default function AcademicStructure({
  organizationData,
  canEdit,
  onEditSchool,
  onDeleteSchool,
  onDeleteFaculty,
  onAddSchool,
}: AcademicStructureProps) {
  // const { expanded: expandedSchools, toggle: toggleSchool } = useExpansionState();
  // const { expanded: expandedFaculties, toggle: toggleFaculty } = useExpansionState();

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
            {organization.schools.length} School{organization.schools.length !== 1 ? 's' : ''}
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
        {/* {organization.schools.map((school) => (
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
          />
        ))} */}
      </div>

      {/* Summary Statistics */}
      {organization.schools.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {organization.schools.length}
              </div>
              <div className="text-sm text-gray-500">Schools</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {organization.schools.reduce((total, school) =>
                  total + (school.faculties?.length || 0), 0
                )}
              </div>
              <div className="text-sm text-gray-500">Faculties</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {organization.schools.reduce((total, school) =>
                  total + (school.faculties?.reduce((subTotal, faculty) =>
                    subTotal + (faculty.courses?.length || 0), 0
                  ) || 0), 0
                )}
              </div>
              <div className="text-sm text-gray-500">Courses</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {organization._count?.members || 0}
              </div>
              <div className="text-sm text-gray-500">Members</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}