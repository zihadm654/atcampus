import { usePathname, useRouter } from "next/navigation";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ResearchesPage } from "@/types/types";

import { deleteResearch } from "./actions";

export function useDeleteResearchMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: deleteResearch,
    onSuccess: async (deletedResearch) => {
      const queryFilter: QueryFilters = { queryKey: ["research-feed"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<ResearchesPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              researches: page.researches.filter(
                (r) => r.id !== deletedResearch.id,
              ),
            })),
          };
        },
      );

      toast.success("Research deleted");

      if (pathname === `/researches/${deletedResearch.id}`) {
        router.push(`/${deletedResearch.user.username}`);
      }
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to delete post. Please try again.");
    },
  });

  return mutation;
}
