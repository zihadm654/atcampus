import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import type { FollowerInfo } from "@/types/types";

export default function useFollowerInfo(
  userId: string,
  initialState: FollowerInfo
) {
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () =>
      kyInstance.get(`/api/users/${userId}/followers`).json<FollowerInfo>(),
    initialData: initialState,
    staleTime: Number.POSITIVE_INFINITY,
  });

  return query;
}
