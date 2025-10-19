import { redirect } from "next/navigation";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { deleteUserAction } from "@/actions/delete-user.action";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useSession } from "@/lib/auth-client";

function DeleteAccountModal({
  showDeleteAccountModal,
  setShowDeleteAccountModal,
}: {
  showDeleteAccountModal: boolean;
  setShowDeleteAccountModal: Dispatch<SetStateAction<boolean>>;
}) {
  const { data: session } = useSession();
  if (!session) return redirect("/login");
  const userId = session.user.id;
  const [deleting, setDeleting] = useState(false);

  async function deleteAccount() {
    setDeleting(true);
    const res = await deleteUserAction({ userId });

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("User deleted successfully");
    }
    setDeleting(false);
  }

  return (
    <Modal
      className="gap-0"
      setShowModal={setShowDeleteAccountModal}
      showModal={showDeleteAccountModal}
    >
      <div className="flex flex-col items-center justify-center space-y-3 border-b p-4 pt-8 sm:px-16">
        <UserAvatar
          user={{
            name: session?.user?.name as string,
            username: session?.user?.username || null,
            image: session?.user?.image || null,
          }}
        />
        <h3 className="font-semibold text-lg">Delete Account</h3>
        <p className="text-center text-muted-foreground text-sm">
          <b>Warning:</b> This will permanently delete your account and your
          active subscription!
        </p>

        {/* TODO: Use getUserSubscriptionPlan(session.user.id) to display the user's subscription if he have a paid plan */}
      </div>

      <form
        className="flex flex-col space-y-6 bg-accent px-4 py-8 text-left sm:px-16"
        onSubmit={async (e) => {
          e.preventDefault();
          toast.promise(deleteAccount(), {
            loading: "Deleting account...",
            success: "Account deleted successfully!",
            error: (err) => err,
          });
        }}
      >
        <div>
          <label className="block text-sm" htmlFor="verification">
            To verify, type{" "}
            <span className="font-semibold text-black dark:text-white">
              confirm delete account
            </span>{" "}
            below
          </label>
          <Input
            autoComplete="off"
            autoFocus={false}
            className="mt-1 w-full border bg-background"
            id="verification"
            name="verification"
            pattern="confirm delete account"
            required
            type="text"
          />
        </div>

        <Button disabled={deleting} variant={"destructive"}>
          Confirm delete account
        </Button>
      </form>
    </Modal>
  );
}

export function useDeleteAccountModal() {
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const DeleteAccountModalCallback = useCallback(
    () => (
      <DeleteAccountModal
        setShowDeleteAccountModal={setShowDeleteAccountModal}
        showDeleteAccountModal={showDeleteAccountModal}
      />
    ),
    [showDeleteAccountModal, setShowDeleteAccountModal]
  );

  return useMemo(
    () => ({
      setShowDeleteAccountModal,
      DeleteAccountModal: DeleteAccountModalCallback,
    }),
    [setShowDeleteAccountModal, DeleteAccountModalCallback]
  );
}
