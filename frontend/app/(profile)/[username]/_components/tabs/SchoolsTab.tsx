"use client";

import { MoreHorizontalIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@/lib/validations/auth";
import type { ProfilePermissions } from "@/types/profile-types";
import type { UserData } from "@/types/types";
import AddFacultyDialog from "../AddFacultyDialog";
import AddSchoolDialog from "../AddSchoolDialog";
import EditFacultyDialog from "../EditFacultyDialog";
import EditSchoolDialog from "../EditSchoolDialog";
import {
  useDeleteFacultyMutation,
  useDeleteSchoolMutation,
} from "../schoolMutations";

export interface Faculty {
  id: string;
  name: string;
  schoolId: string; // Add schoolId to the Faculty interface
  description?: string | null;
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

const SchoolManagement = ({
  school,
  user,
  permissions,
  isCurrentUser,
}: {
  school: School;
  user: UserData;
  permissions?: ProfilePermissions;
  isCurrentUser: boolean;
}) => {
  const router = useRouter();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEditFaculty, setShowEditFaculty] = useState(false);
  const deleteSchoolMutation = useDeleteSchoolMutation();
  const deleteFacultyMutation = useDeleteFacultyMutation();

  // Use permissions for more granular control
  const canManageAcademic =
    permissions?.canManageAcademic ||
    (isCurrentUser && user.role === UserRole.INSTITUTION);

  const handleDeleteSchool = () => {
    toast.promise(deleteSchoolMutation.mutateAsync(school.id), {
      loading: "Deleting school...",
      success: "School deleted successfully",
      error: "Failed to delete school",
    });
  };

  const handleDeleteFaculty = (facultyId: string) => {
    toast.promise(deleteFacultyMutation.mutateAsync(facultyId), {
      loading: "Deleting faculty...",
      success: "Faculty deleted successfully",
      error: "Failed to delete faculty",
    });
  };

  return (
    <Card className="my-2">
      <CardHeader>
        <CardTitle
          className="text-lg hover:cursor-pointer"
          onClick={() => router.push(`/${user.username}/${school.id}`)}
        >
          {school.name}
        </CardTitle>
        {canManageAcademic && (
          <CardAction>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button aria-label="Open menu" size="icon-sm" variant="outline">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
                    Edit School
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setShowNewDialog(true)}>
                    Add Faculty
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Button
                      className="w-full justify-start text-red-500 hover:text-red-600"
                      disabled={deleteSchoolMutation.isPending}
                      onClick={handleDeleteSchool}
                      size="sm"
                      variant="outline"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deleteSchoolMutation.isPending
                        ? "Deleting..."
                        : "Delete"}
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog onOpenChange={setShowNewDialog} open={showNewDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Faculty</DialogTitle>
                  <DialogDescription>
                    Provide a name for your new faculty. Click create when
                    you&apos;re done.
                  </DialogDescription>
                </DialogHeader>
                <AddFacultyDialog
                  schoolId={school.id}
                  schoolName={school.name}
                />
              </DialogContent>
            </Dialog>
            <Dialog onOpenChange={setShowEditDialog} open={showEditDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit School</DialogTitle>
                  <DialogDescription>Edit School Information</DialogDescription>
                </DialogHeader>
                <EditSchoolDialog school={school} />
              </DialogContent>
            </Dialog>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 max-md:px-4">
        {school.faculties.map((faculty) => (
          <>
            <div
              className="flex items-center justify-between gap-1"
              key={faculty.id}
            >
              <h4>{faculty.name}</h4>
              {canManageAcademic && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-label="Open menu"
                      size="icon-sm"
                      variant="outline"
                    >
                      <MoreHorizontalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onSelect={() => setShowEditFaculty(true)}
                      >
                        Edit Faculty
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Button
                          className="w-full justify-start text-red-500 hover:text-red-600"
                          disabled={deleteFacultyMutation.isPending}
                          onClick={() => handleDeleteFaculty(faculty.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deleteFacultyMutation.isPending
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="text-gray-500">{faculty.description}</p>
            <Dialog onOpenChange={setShowEditFaculty} open={showEditFaculty}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Faculty</DialogTitle>
                  <DialogDescription>
                    Edit Faculty Information
                  </DialogDescription>
                </DialogHeader>
                <EditFacultyDialog
                  faculty={{
                    ...faculty,
                    schoolId: school.id,
                    description: faculty.description || undefined,
                  }}
                />
              </DialogContent>
            </Dialog>
          </>
        ))}
      </CardContent>
    </Card>
  );
};

export default function SchoolsTab({
  user,
  isCurrentUser,
  permissions,
}: SchoolsTabProps) {
  const router = useRouter();
  const canManage = useMemo(
    () => isCurrentUser && user.role === UserRole.INSTITUTION,
    [isCurrentUser, user.role]
  );

  // Use permissions for more granular control
  const canManageAcademic = permissions?.canManageAcademic || canManage;

  // For institutions, show created schools
  if (user.role === UserRole.INSTITUTION) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Academic Structure</CardTitle>
            {canManageAcademic && <AddSchoolDialog />}
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 max-md:px-3 lg:grid-cols-2">
          {user.schools && user.schools.length > 0 ? (
            user.schools.map((school) => (
              <SchoolManagement
                isCurrentUser={isCurrentUser}
                key={school.id}
                permissions={permissions}
                school={{
                  ...school,
                  description: school.description ?? undefined,
                  website: school.website ?? undefined,
                }}
                user={user}
              />
            ))
          ) : (
            <div className="col-span-full py-8 text-center">
              <p className="text-gray-500">No schools created yet.</p>
              <p className="mt-2 text-gray-400 text-sm">
                Create your first school to get started.
              </p>
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
            <div className="grid gap-2 lg:grid-cols-2">
              {user.schools.map((school) => (
                <div className="rounded-lg border p-4" key={school.id}>
                  <h3 className="font-semibold">{school.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {school.faculties.length} faculties
                  </p>
                  {permissions?.canEdit && (
                    <div className="mt-2">
                      <Button
                        onClick={() =>
                          router.push(`/${user.username}/${school.id}`)
                        }
                        size="sm"
                        variant="outline"
                      >
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
