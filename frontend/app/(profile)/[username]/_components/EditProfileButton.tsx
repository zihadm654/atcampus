"use client";

import { useState } from "react";

import { UserData } from "@/types/types";
import { Button } from "@/components/ui/button";

import EditProfileDialog from "./EditProfileDialog";
import { Icons } from "@/components/shared/icons";

interface EditProfileButtonProps {
  user: UserData;
}

export default function EditProfileButton({ user }: EditProfileButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        <span className="hidden lg:block">
          Edit profile
        </span>
        <Icons.pencil className="size-4" />
      </Button>
      <EditProfileDialog
        user={user}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}
