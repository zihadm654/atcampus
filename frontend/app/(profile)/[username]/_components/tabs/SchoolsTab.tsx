"use client";
import React, { useMemo } from "react";
import { EllipsisVertical, Ellipsis } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserData } from "@/types/types";
import type { ProfilePermissions } from "@/types/profile-types";
import AddSchoolDialog from "./AddSchoolDialog";
import EditSchoolDialog from "./EditSchoolDialog";
import {
  useDeleteSchoolMutation,
  useDeleteFacultyMutation
} from "@/app/(profile)/[username]/_components/schoolMutations";
import AddFacultyDialog from "./AddFacultyDialog";
import EditFacultyDialog from "./EditFacultyDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/validations/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export interface Faculty {
  id: string;
  name: string;
  schoolId: string; // Add schoolId to the Faculty interface
}

export interface School {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  website?: string | null;
  faculties: Faculty[];
}

interface SchoolsTabProps {
  user: UserData;
  isCurrentUser: boolean;
  permissions?: ProfilePermissions;
}

const SchoolManagement = ({ school, user, permissions }: { school: School; user: any; permissions?: ProfilePermissions }) => {
  const router = useRouter();
  const deleteSchoolMutation = useDeleteSchoolMutation();
  const deleteFacultyMutation = useDeleteFacultyMutation();

  // Use permissions for more granular control
  const canManageAcademic = permissions?.canManageAcademic || (user.id === user.userId && user.role === UserRole.INSTITUTION);

  const handleDeleteSchool = () => {
    toast.promise(
      deleteSchoolMutation.mutateAsync(school.id),
      {
        loading: "Deleting school...",
        success: "School deleted successfully",
        error: "Failed to delete school"
      }
    );
  };

  const handleDeleteFaculty = (facultyId: string) => {
    toast.promise(
      deleteFacultyMutation.mutateAsync(facultyId),
      {
        loading: "Deleting faculty...",
        success: "Faculty deleted successfully",
        error: "Failed to delete faculty"
      }
    );
  };

  return (
    <Card className="my-2">
      <CardHeader>
        <CardTitle
          className="text-xl hover:cursor-pointer"
          onClick={() => router.push(`/${user.username}/${school.id}`)}
        >
          {school.name}
        </CardTitle>
        {canManageAcademic && (
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center">
                <EllipsisVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <EditSchoolDialog school={school} />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-500 hover:text-red-600"
                    onClick={handleDeleteSchool}
                    disabled={deleteSchoolMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleteSchoolMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <AddFacultyDialog schoolId={school.id} />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {school.faculties.map((faculty) => (
          <div className="flex items-center justify-between" key={faculty.id}>
            <h4>{faculty.name}</h4>
            {canManageAcademic && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Ellipsis className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <EditFacultyDialog faculty={{ ...faculty, schoolId: school.id }} />
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteFaculty(faculty.id)}
                      disabled={deleteFacultyMutation.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deleteFacultyMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <AddFacultyDialog schoolId={school.id} />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default function SchoolsTab({ user, isCurrentUser, permissions }: SchoolsTabProps) {
  const router = useRouter();
  const canManage = useMemo(() => {
    return isCurrentUser && user.role === UserRole.INSTITUTION;
  }, [isCurrentUser, user.role]);

  // Use permissions for more granular control
  const canManageAcademic = permissions?.canManageAcademic || canManage;

  // For institutions, show created schools
  if (user.role === UserRole.INSTITUTION) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Academic Structure</CardTitle>
            {canManageAcademic && <AddSchoolDialog />}
          </div>
        </CardHeader>
        <CardContent className="grid lg:grid-cols-2 gap-2">
          {user.schools && user.schools.length > 0 ? (
            user.schools.map((school) => (
              <SchoolManagement
                key={school.id}
                school={{
                  ...school,
                  description: school.description ?? undefined,
                  website: school.website ?? undefined
                }}
                user={user}
                permissions={permissions}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No schools created yet.</p>
              <p className="text-sm text-gray-400 mt-2">Create your first school to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // For other roles (ADMIN), show a different view
  if (user.role === UserRole.ADMIN) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Institution Schools</CardTitle>
        </CardHeader>
        <CardContent>
          {user.schools && user.schools.length > 0 ? (
            <div className="grid lg:grid-cols-2 gap-2">
              {user.schools.map((school) => (
                <div key={school.id} className="border p-4 rounded-lg">
                  <h3 className="font-semibold">{school.name}</h3>
                  <p className="text-sm text-gray-500">
                    {school.faculties.length} faculties
                  </p>
                  {permissions?.canEdit && (
                    <div className="mt-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/${user.username}/${school.id}`)}>
                        View Details
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No schools available.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // For other roles, show a generic message
  return (
    <div className="p-4 text-center text-gray-500">
      School information is not applicable for this user role.
    </div>
  );
}