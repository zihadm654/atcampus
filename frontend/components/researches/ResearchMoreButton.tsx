"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";

import { ResearchData } from "@/types/types";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import DeleteResearchDialog from "./DeleteResearchDialog";

interface ResearchMoreButtonProps {
  research: ResearchData;
  className?: string;
}

export default function ResearchMoreButton({
  research,
  className,
}: ResearchMoreButtonProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className={className}>
            <MoreHorizontal className="text-muted-foreground size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <span className="text-destructive flex items-center gap-3">
              <Trash2 className="size-4" />
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteResearchDialog
        research={research}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
