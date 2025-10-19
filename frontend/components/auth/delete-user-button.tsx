"use client";

import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteUserAction } from "@/actions/delete-user.action";

import { Button } from "@/components/ui/button";

interface DeleteUserButtonProps {
  userId: string;
}

export const DeleteUserButton = ({ userId }: DeleteUserButtonProps) => {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    const res = await deleteUserAction({ userId });

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("User deleted successfully");
    }
    setIsPending(false);
  }

  return (
    <Button
      className="size-7 rounded-sm"
      disabled={isPending}
      onClick={handleClick}
      size="icon"
      type="submit"
      variant="destructive"
    >
      <span className="sr-only">Delete User</span>
      <TrashIcon />
    </Button>
  );
};

export const PlaceholderDeleteUserButton = () => (
  <Button
    className="size-7 rounded-sm"
    disabled
    size="icon"
    variant="destructive"
  >
    <span className="sr-only">Delete User</span>
    <TrashIcon />
  </Button>
);
