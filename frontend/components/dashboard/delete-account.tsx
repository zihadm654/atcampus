"use client";

import { useState } from "react";
import { deleteUserAction } from "@/actions/delete-user.action";
import { toast } from "sonner";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { SectionColumns } from "@/components/dashboard/section-columns";
import { useDeleteAccountModal } from "@/components/modals/delete-account-modal";
import { Icons } from "@/components/shared/icons";

interface DeleteUserButtonProps {
  userId: string;
}

export function DeleteAccountSection({ userId }: DeleteUserButtonProps) {
  const { setShowDeleteAccountModal, DeleteAccountModal } =
    useDeleteAccountModal();
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
    <>
      <DeleteAccountModal />
      <SectionColumns
        title="Delete Account"
        description="This is a danger zone - Be careful !"
      >
        <div className="flex flex-col gap-4 rounded-xl border border-red-400 p-4 dark:border-red-900">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-medium">Are you sure ?</span>
            </div>
            <div className="text-muted-foreground text-sm text-balance">
              Permanently delete your {siteConfig.name} account
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="destructive"
              onClick={() => setShowDeleteAccountModal(true)}
              disabled={isPending}
            >
              <Icons.trash className="mr-2 size-4" />
              <span>Delete Account</span>
            </Button>
          </div>
        </div>
      </SectionColumns>
    </>
  );
}
