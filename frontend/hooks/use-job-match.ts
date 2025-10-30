import { useQuery } from "@tanstack/react-query";
import { getJobMatch } from "@/actions/job-matches";

export function useJobMatch(jobId: string) {
  return useQuery({
    queryKey: ["job-match", jobId],
    queryFn: () => getJobMatch(jobId),
    enabled: !!jobId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
