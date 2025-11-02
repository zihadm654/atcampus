"use client";

import { useState } from "react";
import { SectionColumns } from "@/components/dashboard/section-columns";
import { useDeleteAccountModal } from "@/components/modals/delete-account-modal";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

interface DeleteUserButtonProps {
  userId: string;
}

export function DeleteAccountSection({ userId }: DeleteUserButtonProps) {
  const { setShowDeleteAccountModal, DeleteAccountModal } =
    useDeleteAccountModal();
  const [isPending, _setIsPending] = useState(false);

  // async function handleClick() {
  //   setIsPending(true);
  //   const res = await deleteUserAction({ userId });

  //   if (res.error) {
  //     toast.error(res.error);
  //   } else {
  //     toast.success("User deleted successfully");
  //   }
  //   setIsPending(false);
  // }
  return (
    <>
      <DeleteAccountModal />
      <SectionColumns
        description="This is a danger zone - Be careful !"
        title="Delete Account"
      >
        <div className="flex flex-col gap-4 rounded-xl border border-red-400 p-4 dark:border-red-900">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[15px]">Are you sure ?</span>
            </div>
            <div className="text-balance text-muted-foreground text-sm">
              Permanently delete your {siteConfig.name} account
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              disabled={isPending}
              onClick={() => setShowDeleteAccountModal(true)}
              type="submit"
              variant="destructive"
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
