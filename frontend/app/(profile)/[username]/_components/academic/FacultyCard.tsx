import React from 'react';
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { BookOpen, Users2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

import CourseItem from "./CourseItem";

// Types
interface Course {
  id: string;
  title: string;
  code: string;
  description?: string;
  credits?: number;
  status: string;
  startDate?: Date;
  endDate?: Date;
  instructor: {
    id: string;
    name: string;
  };
  _count?: { enrollments: number };
}

interface FacultySummary {
  id: string;
  name: string;
  description?: string;
  courses?: Course[];
  _count?: { courses: number; members: number };
}

interface FacultyCardProps {
  faculty: FacultySummary;
  expanded: boolean;
  onToggle: () => void;
  canEdit: boolean;
  onEdit?: (faculty: FacultySummary) => void;
  onDelete?: (facultyId: string) => void;
  onAddCourse?: (facultyId: string) => void;
  onEditCourse?: (course: Course) => void;
  onDeleteCourse?: (courseId: string) => void;
  onViewCourseDetails?: (courseId: string) => void;
}

export default function FacultyCard({
  faculty,
  expanded,
  onToggle,
  canEdit,
  onEdit,
  onDelete,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onViewCourseDetails,
}: FacultyCardProps) {
  const coursesCount = faculty.courses?.length || 0;
  const membersCount = faculty._count?.members || 0;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(faculty);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(faculty.id);
  };

  return (
    <Card className="border border-gray-200 rounded-lg">
      <Collapsible open={expanded} onOpenChange={onToggle}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              {/* Faculty Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-md flex items-center justify-center text-white font-semibold text-sm">
                {faculty.name.charAt(0).toUpperCase()}
              </div>

              {/* Faculty Info */}
              <div className="text-left">
                <h4 className="font-medium">{faculty.name}</h4>
                <p className="text-sm text-gray-600">
                  {faculty.description || 'No description available'}
                </p>

                {/* Stats Badges */}
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    <BookOpen className="size-3 mr-1" />
                    {coursesCount} Courses
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Users2 className="size-3 mr-1" />
                    {membersCount} Members
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
                      Edit Faculty
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-red-600"
                    >
                      <Icons.trash className="size-4 mr-2" />
                      Delete Faculty
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Expansion Indicator */}
              <Icons.chevronDown
                className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''
                  }`}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4">
            {faculty?.courses && faculty.courses.length > 0 ? (
              <div className="space-y-2 pl-4 border-l border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-700">Courses</h5>
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddCourse?.(faculty.id)}
                    >
                      <Icons.add className="size-3 mr-1" />
                      Add Course
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {faculty.courses.map((course) => (
                    <CourseItem
                      key={course.id}
                      course={course}
                      canEdit={canEdit}
                      onEdit={onEditCourse}
                      onDelete={onDeleteCourse}
                      onViewDetails={onViewCourseDetails}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <BookOpen className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No courses in this faculty yet</p>
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => onAddCourse?.(faculty.id)}
                  >
                    <Icons.add className="size-4 mr-2" />
                    Add Course
                  </Button>
                )}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}