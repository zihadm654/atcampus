import { ResearchData } from "@/types/types";

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
import { useDeleteResearchMutation } from "./mutations";

interface DeleteResearchDialogProps {
  research: ResearchData;
  open: boolean;
  onClose: () => void;
}

export default function DeleteResearchDialog({
  research,
  open,
  onClose,
}: DeleteResearchDialogProps) {
  const mutation = useDeleteResearchMutation();

  function handleOpenChange(open: boolean) {
    if (!open || !mutation.isPending) {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete research?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this research? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <LoadingButton
            variant="destructive"
            onClick={() => mutation.mutate(research.id, { onSuccess: onClose })}
            loading={mutation.isPending}
          >
            Delete
          </LoadingButton>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
