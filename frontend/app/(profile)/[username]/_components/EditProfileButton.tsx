"use client";

import { useState } from "react";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import type { UserData } from "@/types/types";
import EditProfileDialog from "./EditProfileDialog";

interface EditProfileButtonProps {
  user: UserData;
}

export default function EditProfileButton({ user }: EditProfileButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button onClick={() => setShowDialog(true)} variant="outline">
        <span className="hidden lg:block">Edit profile</span>
        <Icons.pencil className="hidden size-4 max-md:block" />
      </Button>
      <EditProfileDialog
        onOpenChange={setShowDialog}
        open={showDialog}
        user={user}
      />
    </>
  );
}
