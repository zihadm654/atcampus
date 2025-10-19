"use client";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";

import type { CourseData } from "@/types/types";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import DeleteCourseDialog from "./DeleteCourseDialog";

interface CourseMoreButtonProps {
  course: CourseData;
  className?: string;
}

export default function CourseMoreButton({
  course,
  className,
}: CourseMoreButtonProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={className} size="icon" variant="ghost">
            <MoreHorizontal className="size-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <span className="flex items-center gap-3 text-destructive">
              <Trash2 className="size-4" />
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteCourseDialog
        course={course}
        onClose={() => setShowDeleteDialog(false)}
        open={showDeleteDialog}
      />
    </>
  );
}
