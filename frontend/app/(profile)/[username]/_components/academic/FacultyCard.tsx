import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { BookOpen, Users2 } from "lucide-react";
import type React from "react";
import { Icons } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
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
    <Card className="rounded-lg border border-gray-200">
      <Collapsible onOpenChange={onToggle} open={expanded}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50">
            <div className="flex items-center gap-3">
              {/* Faculty Avatar */}
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-green-500 to-blue-500 font-semibold text-sm text-white">
                {faculty.name.charAt(0).toUpperCase()}
              </div>

              {/* Faculty Info */}
              <div className="text-left">
                <h4 className="font-medium">{faculty.name}</h4>
                <p className="text-gray-600 text-sm">
                  {faculty.description || "No description available"}
                </p>

                {/* Stats Badges */}
                <div className="mt-1 flex items-center gap-3">
                  <Badge className="text-xs" variant="secondary">
                    <BookOpen className="mr-1 size-3" />
                    {coursesCount} Courses
                  </Badge>
                  <Badge className="text-xs" variant="secondary">
                    <Users2 className="mr-1 size-3" />
                    {membersCount} Members
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button className="h-8 w-8 p-0" size="sm" variant="ghost">
                      <DotsHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Icons.pencil className="mr-2 size-4" />
                      Edit Faculty
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={handleDelete}
                    >
                      <Icons.trash className="mr-2 size-4" />
                      Delete Faculty
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Expansion Indicator */}
              <Icons.chevronDown
                className={`size-4 transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4">
            {faculty?.courses && faculty.courses.length > 0 ? (
              <div className="space-y-2 border-gray-200 border-l pl-4">
                <div className="mb-2 flex items-center justify-between">
                  <h5 className="font-medium text-gray-700 text-sm">Courses</h5>
                  {canEdit && (
                    <Button
                      onClick={() => onAddCourse?.(faculty.id)}
                      size="sm"
                      variant="outline"
                    >
                      <Icons.add className="mr-1 size-3" />
                      Add Course
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {faculty.courses.map((course) => (
                    <CourseItem
                      canEdit={canEdit}
                      course={course}
                      key={course.id}
                      onDelete={onDeleteCourse}
                      onEdit={onEditCourse}
                      onViewDetails={onViewCourseDetails}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">
                <BookOpen className="mx-auto mb-2 size-8 opacity-50" />
                <p className="text-sm">No courses in this faculty yet</p>
                {canEdit && (
                  <Button
                    className="mt-3"
                    onClick={() => onAddCourse?.(faculty.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Icons.add className="mr-2 size-4" />
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
