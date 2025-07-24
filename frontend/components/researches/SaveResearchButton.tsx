import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark } from "lucide-react";

import { SaveResearchInfo } from "@/types/types";
import kyInstance from "@/lib/ky";
import { cn } from "@/lib/utils";

import { useToast } from "../ui/use-toast";

interface BookmarkButtonProps {
  researchId: string;
  initialState: SaveResearchInfo;
}

export default function SaveResearchButton({
  researchId,
  initialState,
}: BookmarkButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["saveResearch-info", researchId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance
        .get(`/api/researches/${researchId}/saveResearch`)
        .json<SaveResearchInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isSaveResearchByUser
        ? kyInstance.delete(`/api/researches/${researchId}/saveResearch`)
        : kyInstance.post(`/api/researches/${researchId}/saveResearch`),
    onMutate: async () => {
      toast({
        description: `Research ${data.isSaveResearchByUser ? "un" : ""}saved`,
      });

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
          data.isSaveResearchByUser && "fill-primary text-primary",
        )}
      />
    </button>
  );
}
