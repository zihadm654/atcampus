import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { formatDate } from "date-fns";
import { GraduationCap, MapPin, Users2 } from "lucide-react";
import type React from "react";
import { Icons } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface CourseItemProps {
  course: Course;
  canEdit: boolean;
  onEdit?: (course: Course) => void;
  onDelete?: (courseId: string) => void;
  onViewDetails?: (courseId: string) => void;
}

export default function CourseItem({
  course,
  canEdit,
  onEdit,
  onDelete,
  onViewDetails,
}: CourseItemProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(course);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(course.id);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "draft":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "archived":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="group rounded-lg border bg-gray-50 p-3 transition-colors hover:bg-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Course Header */}
          <div className="mb-1 flex items-center gap-2">
            <h6
              className="cursor-pointer font-medium text-sm transition-colors hover:text-blue-600"
              onClick={() => onViewDetails?.(course.id)}
            >
              {course.title}
            </h6>
            <Badge className="text-xs" variant="outline">
              {course.code}
            </Badge>
          </div>

          {/* Course Description */}
          {course.description && (
            <p className="mt-1 line-clamp-2 text-gray-600 text-xs">
              {course.description}
            </p>
          )}

          {/* Course Metadata */}
          <div className="mt-2 flex items-center gap-4 text-gray-500 text-xs">
            <span className="flex items-center">
              <Users2 className="mr-1 inline size-3" />
              Instructor: {course.instructor.name}
            </span>
            <span className="flex items-center">
              <GraduationCap className="mr-1 inline size-3" />
              {course._count?.enrollments || 0} Students
            </span>
            <span>{course.credits || 3} Credits</span>
          </div>

          {/* Status and Date */}
          <div className="mt-2 flex items-center gap-2">
            <Badge
              className={`border text-xs ${getStatusColor(course.status)}`}
              variant="outline"
            >
              {course.status.toLowerCase()}
            </Badge>
            {course.startDate && (
              <span className="flex items-center text-gray-500 text-xs">
                <MapPin className="mr-1 inline size-3" />
                {formatDate(new Date(course.startDate), "MMM yyyy")}
                {course.endDate && (
                  <span>
                    {" "}
                    - {formatDate(new Date(course.endDate), "MMM yyyy")}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="opacity-0 transition-opacity group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-6 w-6 p-0" size="sm" variant="ghost">
                  <DotsHorizontalIcon className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails?.(course.id)}>
                  <Icons.eye className="mr-2 size-3" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Icons.pencil className="mr-2 size-3" />
                  Edit Course
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={handleDelete}
                >
                  <Icons.trash className="mr-2 size-3" />
                  Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
