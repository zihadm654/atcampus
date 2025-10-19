"use client";
import {
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import kyInstance from "@/lib/ky";
import { cn } from "@/lib/utils";
import type { SaveJobInfo } from "@/types/types";
import { Button } from "../ui/button";

interface BookmarkButtonProps {
  jobId: string;
  initialState: SaveJobInfo;
}

export default function SaveJobButton({
  jobId,
  initialState,
}: BookmarkButtonProps) {
  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["saveJob-info", jobId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/jobs/${jobId}/saveJob`).json<SaveJobInfo>(),
    initialData: initialState,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isSaveJobByUser
        ? kyInstance.delete(`/api/jobs/${jobId}/saveJob`)
        : kyInstance.post(`/api/jobs/${jobId}/saveJob`),
    onMutate: async () => {
      toast(`Job ${data.isSaveJobByUser ? "un" : ""}saved`);

      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<SaveJobInfo>(queryKey);

      queryClient.setQueryData<SaveJobInfo>(queryKey, () => ({
        isSaveJobByUser: !previousState?.isSaveJobByUser,
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    },
  });

  return (
    <Button
      className="flex items-center gap-2"
      onClick={() => mutate()}
      variant="outline"
    >
      <Bookmark
        className={cn(
          "size-5",
          data.isSaveJobByUser && "fill-primary text-primary"
        )}
      />
      Later
    </Button>
  );
}
