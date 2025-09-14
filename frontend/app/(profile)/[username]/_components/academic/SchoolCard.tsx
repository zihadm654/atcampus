import React from 'react';
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { GraduationCap, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";

import FacultyCard from "./FacultyCard";

// Types
interface ExtendedFaculty {
  id: string;
  name: string;
  description?: string;
  courses?: any[];
  _count?: { courses: number; members: number };
}

interface SchoolSummary {
  id: string;
  name: string;
  description?: string;
  faculties?: ExtendedFaculty[];
  _count?: { faculties: number };
}

interface SchoolCardProps {
  school: SchoolSummary;
  expanded: boolean;
  onToggle: () => void;
  expandedFaculties: Set<string>;
  onToggleFaculty: (facultyId: string) => void;
  canEdit: boolean;
  onEdit?: (school: SchoolSummary) => void;
  onDelete?: (schoolId: string) => void;
  onDeleteFaculty?: (facultyId: string) => void;
  onAddFaculty?: (schoolId: string) => void;
  onEditFaculty?: (faculty: ExtendedFaculty) => void;
  onAddCourse?: (facultyId: string) => void;
  onEditCourse?: (course: any) => void;
  onDeleteCourse?: (courseId: string) => void;
  onViewCourseDetails?: (courseId: string) => void;
}

export default function SchoolCard({
  school,
  expanded,
  onToggle,
  expandedFaculties,
  onToggleFaculty,
  canEdit,
  onEdit,
  onDelete,
  onDeleteFaculty,
  onAddFaculty,
  onEditFaculty,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onViewCourseDetails,
}: SchoolCardProps) {
  const facultiesCount = school.faculties?.length || 0;
  const coursesCount = school.faculties?.reduce(
    (total, faculty) => total + (faculty.courses?.length || 0),
    0
  ) || 0;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(school);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(school.id);
  };

  return (
    <Card className="overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow">
      <Collapsible open={expanded} onOpenChange={onToggle}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              {/* School Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                {school.name.charAt(0).toUpperCase()}
              </div>

              {/* School Info */}
              <div className="text-left">
                <CardTitle className="text-lg font-semibold">
                  {school.name}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {school.description || 'No description available'}
                </p>

                {/* Stats Badges */}
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <GraduationCap className="size-3 mr-1" />
                    {facultiesCount} Faculties
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <BookOpen className="size-3 mr-1" />
                    {coursesCount} Courses
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <DotsHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Icons.pencil className="size-4 mr-2" />
                      Edit School
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-red-600"
                    >
                      <Icons.trash className="size-4 mr-2" />
                      Delete School
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Expansion Indicator */}
              <Icons.chevronDown
                className={`size-5 transition-transform ${expanded ? 'rotate-180' : ''
                  }`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* {school?.faculties?.length > 0 ? (
              <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                {school?.faculties.map((faculty) => (
                  <FacultyCard
                    key={faculty.id}
                    faculty={faculty}
                    expanded={expandedFaculties.has(faculty.id)}
                    onToggle={() => onToggleFaculty(faculty.id)}
                    canEdit={canEdit}
                    onEdit={onEditFaculty}
                    onDelete={onDeleteFaculty}
                    onAddCourse={onAddCourse}
                    onEditCourse={onEditCourse}
                    onDeleteCourse={onDeleteCourse}
                    onViewCourseDetails={onViewCourseDetails}
                  />
                ))}

                {canEdit && (
                  <div className="pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddFaculty?.(school.id)}
                      className="w-full"
                    >
                      <Icons.add className="size-4 mr-2" />
                      Add Faculty to {school.name}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="size-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No faculties in this school yet</p>
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => onAddFaculty?.(school.id)}
                  >
                    <Icons.add className="size-4 mr-2" />
                    Add Faculty
                  </Button>
                )}
              </div>
            )} */}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}