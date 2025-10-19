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
import type { SaveResearchInfo } from "@/types/types";

interface BookmarkButtonProps {
  researchId: string;
  initialState: SaveResearchInfo;
}

export default function SaveResearchButton({
  researchId,
  initialState,
}: BookmarkButtonProps) {
  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["saveResearch-info", researchId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance
        .get(`/api/researches/${researchId}/saveResearch`)
        .json<SaveResearchInfo>(),
    initialData: initialState,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isSaveResearchByUser
        ? kyInstance.delete(`/api/researches/${researchId}/saveResearch`)
        : kyInstance.post(`/api/researches/${researchId}/saveResearch`),
    onMutate: async () => {
      toast.success(`Research ${data.isSaveResearchByUser ? "un" : ""}saved`);

      await queryClient.cancelQueries({ queryKey });

      const previousState =
        queryClient.getQueryData<SaveResearchInfo>(queryKey);

      queryClient.setQueryData<SaveResearchInfo>(queryKey, () => ({
        isSaveResearchByUser: !previousState?.isSaveResearchByUser,
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
    <button
      className="flex items-center gap-2"
      onClick={() => mutate()}
      type="button"
    >
      <Bookmark
        className={cn(
          "size-5",
          data.isSaveResearchByUser && "fill-primary text-primary"
        )}
      />
    </button>
  );
}
