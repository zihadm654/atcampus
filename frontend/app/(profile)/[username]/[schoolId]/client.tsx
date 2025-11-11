"use client";

import type { Faculty } from "@prisma/client";
import {
  GraduationCap,
  MoreHorizontalIcon,
  PlusIcon,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import AddFacultyDialog from "../_components/AddFacultyDialog";
import EditFacultyDialog from "../_components/EditFacultyDialog";
import { FacultyCard } from "../_components/FacultyCard";
import { useDeleteFacultyMutation } from "../_components/schoolMutations";
// Client component for Faculty Card with Actions
export function FacultyCardWithActions({
  faculty,
  schoolId,
  showActions,
  username,
  school,
}: {
  faculty: any;
  schoolId: string;
  showActions: boolean;
  username: string;
  school: any;
}) {
  // Add check for undefined faculty
  if (!faculty) {
    return null;
  }
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEditFaculty, setShowEditFaculty] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const deleteFacultyMutation = useDeleteFacultyMutation();

  const handleDeleteFaculty = () => {
    // Add check for faculty.id
    if (!faculty.id) {
      toast.error("Faculty ID is missing");
      return;
    }

    toast.promise(deleteFacultyMutation.mutateAsync(faculty.id), {
      loading: "Deleting faculty...",
      success: "Faculty deleted successfully",
      error: "Failed to delete faculty",
    });
  };

  return (
    <div className="relative">
      <FacultyCard
        faculty={faculty}
        schoolId={schoolId}
        showActions={false}
        username={username}
      />
      {showActions && faculty.id && (
        <div className="absolute top-2 right-2">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Open menu" size="icon-sm" variant="outline">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
                  Edit School
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button
                    className="w-full justify-start text-red-500 hover:text-red-600"
                    disabled={deleteFacultyMutation.isPending}
                    onClick={handleDeleteFaculty}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleteFacultyMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      {/* Move the Dialog outside the map loop and use selectedFaculty */}
      <Dialog onOpenChange={setShowEditFaculty} open={showEditFaculty}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Faculty</DialogTitle>
            <DialogDescription>Edit Faculty Information</DialogDescription>
          </DialogHeader>
          {selectedFaculty && (
            <EditFacultyDialog
              faculty={{
                ...selectedFaculty,
                schoolId: school.id,
                logo: selectedFaculty.logo || undefined,
                coverPhoto: selectedFaculty.coverPhoto || undefined,
                description: selectedFaculty.description || undefined,
              }}
              setOpen={setShowEditFaculty}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
// Client component for the Add Faculty Dialog
function AddFacultyDialogButton({
  schoolId,
  schoolName,
}: {
  schoolId: string;
  schoolName: string;
}) {
  // Add checks for required props
  if (!(schoolId && schoolName)) {
    return null;
  }

  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Faculty
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Faculty</DialogTitle>
          <DialogDescription>
            Provide a name for your new faculty. Click create when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <AddFacultyDialog
          schoolId={schoolId}
          schoolName={schoolName}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
}

const Client = ({ school, canManage, canManageSchool, username }: any) => {
  // Add fallback for when school is undefined
  if (!school) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-3xl">Faculties</h2>
          <div className="flex items-center gap-2">
            <Badge className="text-sm" variant="secondary">
              0 Faculties
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-lg">
                No School Data Available
              </h3>
              <p className="max-w-md text-muted-foreground text-sm">
                School information could not be loaded. Please try refreshing
                the page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-3xl">Faculties</h2>
        <div className="flex items-center gap-2">
          <Badge className="text-sm" variant="secondary">
            {school?.faculties.length || 0}{" "}
            {school?.faculties?.length === 1 ? "Faculty" : "Faculties"}
          </Badge>
          {canManageSchool && school?.id && school?.name && (
            <AddFacultyDialogButton
              schoolId={school.id}
              schoolName={school.name}
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {school?.faculties && school.faculties.length > 0 ? (
          school.faculties.map((faculty: any) =>
            faculty ? (
              <FacultyCardWithActions
                faculty={faculty}
                key={faculty.id}
                school={school}
                schoolId={school.id}
                showActions={!!(canManageSchool && school.id)}
                username={username}
              />
            ) : null,
          )
        ) : (
          <Card className="col-span-full border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-lg">No Faculties Found</h3>
              <p className="max-w-md text-muted-foreground text-sm">
                This school doesn't have any faculties yet. Faculties will
                appear here once they are added.
              </p>
              {canManageSchool && school?.id && school?.name && (
                <AddFacultyDialogButton
                  schoolId={school.id}
                  schoolName={school.name}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Client;
