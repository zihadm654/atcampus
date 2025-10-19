import type { JobData } from "@/types/types";

import LoadingButton from "../feed/LoadingButton";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useDeleteJobMutation } from "./mutations";

interface DeleteJobDialogProps {
  job: JobData;
  open: boolean;
  onClose: () => void;
}

export default function DeleteJobDialog({
  job,
  open,
  onClose,
}: DeleteJobDialogProps) {
  const mutation = useDeleteJobMutation();

  function handleOpenChange(open: boolean) {
    if (!(open && mutation.isPending)) {
      onClose();
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete job?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this job? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <LoadingButton
            loading={mutation.isPending}
            onClick={() => mutation.mutate(job.id, { onSuccess: onClose })}
            variant="destructive"
          >
            Delete
          </LoadingButton>
          <Button
            disabled={mutation.isPending}
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
