import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark } from "lucide-react";

import { SaveJobInfo } from "@/types/types";
import kyInstance from "@/lib/ky";
import { cn } from "@/lib/utils";

import { useToast } from "../ui/use-toast";

interface BookmarkButtonProps {
  jobId: string;
  initialState: SaveJobInfo;
}

export default function SaveJobButton({
  jobId,
  initialState,
}: BookmarkButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["saveJob-info", jobId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/jobs/${jobId}/saveJob`).json<SaveJobInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isSaveJobByUser
        ? kyInstance.delete(`/api/jobs/${jobId}/saveJob`)
        : kyInstance.post(`/api/jobs/${jobId}/saveJob`),
    onMutate: async () => {
      toast({
        description: `Job ${data.isSaveJobByUser ? "un" : ""}saved`,
      });

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
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Bookmark
        className={cn(
          "size-5",
          data.isSaveJobByUser && "fill-primary text-primary",
        )}
      />
    </button>
  );
}
