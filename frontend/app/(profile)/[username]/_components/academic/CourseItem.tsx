import React from 'react';
import { formatDate } from "date-fns";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Users2, GraduationCap, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";

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
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'archived':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 border hover:bg-gray-100 transition-colors group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Course Header */}
          <div className="flex items-center gap-2 mb-1">
            <h6 
              className="font-medium text-sm cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => onViewDetails?.(course.id)}
            >
              {course.title}
            </h6>
            <Badge variant="outline" className="text-xs">
              {course.code}
            </Badge>
          </div>
          
          {/* Course Description */}
          {course.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {course.description}
            </p>
          )}
          
          {/* Course Metadata */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center">
              <Users2 className="size-3 inline mr-1" />
              Instructor: {course.instructor.name}
            </span>
            <span className="flex items-center">
              <GraduationCap className="size-3 inline mr-1" />
              {course._count?.enrollments || 0} Students
            </span>
            <span>
              {course.credits || 3} Credits
            </span>
          </div>
          
          {/* Status and Date */}
          <div className="flex items-center gap-2 mt-2">
            <Badge
              className={`text-xs border ${getStatusColor(course.status)}`}
              variant="outline"
            >
              {course.status.toLowerCase()}
            </Badge>
            {course.startDate && (
              <span className="text-xs text-gray-500 flex items-center">
                <MapPin className="size-3 inline mr-1" />
                {formatDate(new Date(course.startDate), 'MMM yyyy')}
                {course.endDate && (
                  <span> - {formatDate(new Date(course.endDate), 'MMM yyyy')}</span>
                )}
              </span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        {canEdit && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <DotsHorizontalIcon className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails?.(course.id)}>
                  <Icons.eye className="size-3 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Icons.pencil className="size-3 mr-2" />
                  Edit Course
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Icons.trash className="size-3 mr-2" />
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