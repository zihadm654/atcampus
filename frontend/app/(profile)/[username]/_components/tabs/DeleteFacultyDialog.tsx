"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteFacultyMutation } from "@/app/(profile)/[username]/_components/schoolMutations";
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
import { Button } from "@/components/ui/button";

interface DeleteFacultyDialogProps {
  facultyId: string;
}

export default function DeleteFacultyDialog({
  facultyId,
}: DeleteFacultyDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteFacultyMutation = useDeleteFacultyMutation();

  const handleDelete = () => {
    toast.promise(deleteFacultyMutation.mutateAsync(facultyId), {
      loading: "Deleting faculty...",
      success: "Faculty deleted successfully",
      error: "Failed to delete faculty",
    });

    // Close dialog on success
    if (!deleteFacultyMutation.isError) {
      setOpen(false);
    }
  };

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full justify-start text-red-500 hover:text-red-600"
          size="sm"
          variant="ghost"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            faculty and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteFacultyMutation.isPending}
            onClick={handleDelete}
          >
            {deleteFacultyMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
