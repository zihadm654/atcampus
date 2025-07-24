import { usePathname, useRouter } from "next/navigation";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { JobsPage } from "@/types/types";

import { deleteJob } from "./actions";

export function useDeleteJobMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: async (deletedJob) => {
      const queryFilter: QueryFilters = { queryKey: ["job-feed"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<JobsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              jobs: page.jobs.filter((j) => j.id !== deletedJob.id),
            })),
          };
        },
      );

      toast.success("Job deleted");

      if (pathname === `/jobs/${deletedJob.id}`) {
        router.push(`/${deletedJob.user.username}`);
      }
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to delete post. Please try again.");
    },
  });

  return mutation;
}
