"use client";

import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useDeleteSchoolMutation } from "@/app/(profile)/[username]/_components/schoolMutations";

interface DeleteSchoolDialogProps {
  schoolId: string;
}

export default function DeleteSchoolDialog({
  schoolId,
}: DeleteSchoolDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteSchoolMutation = useDeleteSchoolMutation();

  const handleDelete = () => {
    toast.promise(
      deleteSchoolMutation.mutateAsync(schoolId),
      {
        loading: "Deleting school...",
        success: "School deleted successfully",
        error: "Failed to delete school"
      }
    );

    // Close dialog on success
    if (!deleteSchoolMutation.isError) {
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            school and all associated faculties and courses.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteSchoolMutation.isPending}>
            {deleteSchoolMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}