import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { BookOpen, GraduationCap } from "lucide-react";
import type React from "react";
import { Icons } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  canEdit,
  onEdit,
  onDelete,
}: SchoolCardProps) {
  const facultiesCount = school.faculties?.length || 0;
  const coursesCount =
    school.faculties?.reduce(
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
      <Collapsible onOpenChange={onToggle} open={expanded}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between py-4 transition-colors hover:bg-gray-50">
            <div className="flex items-center gap-4">
              {/* School Avatar */}
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-lg text-white">
                {school.name.charAt(0).toUpperCase()}
              </div>

              {/* School Info */}
              <div className="text-left">
                <CardTitle className="font-semibold text-lg">
                  {school.name}
                </CardTitle>
                <p className="mt-1 text-gray-600 text-sm">
                  {school.description || "No description available"}
                </p>

                {/* Stats Badges */}
                <div className="mt-2 flex items-center gap-4">
                  <Badge className="text-xs" variant="outline">
                    <GraduationCap className="mr-1 size-3" />
                    {facultiesCount} Faculties
                  </Badge>
                  <Badge className="text-xs" variant="outline">
                    <BookOpen className="mr-1 size-3" />
                    {coursesCount} Courses
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
                      Edit School
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={handleDelete}
                    >
                      <Icons.trash className="mr-2 size-4" />
                      Delete School
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Expansion Indicator */}
              <Icons.chevronDown
                className={`size-5 transition-transform ${
                  expanded ? "rotate-180" : ""
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
