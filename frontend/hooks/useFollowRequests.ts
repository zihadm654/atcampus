import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

export interface FollowRequest {
  id: string;
  requesterId: string;
  targetId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  message?: string;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
  requester: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    headline?: string;
  };
  target?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    headline?: string;
  };
}

export interface FollowRequestsResponse {
  followRequests: FollowRequest[];
}

export function useFollowRequests(userId: string) {
  return useQuery<FollowRequestsResponse>({
    queryKey: ["follow-requests", userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/follow-requests`);
      if (!response.ok) {
        throw new Error("Failed to fetch follow requests");
      }
      return response.json();
    },
    enabled: !!userId,
  });
}

export function useAcceptFollowRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, targetUserId }: { userId: string; targetUserId: string }) => {
      const response = await fetch(`/api/users/${targetUserId}/follow-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "accept", userId }),
      });
      if (!response.ok) {
        throw new Error("Failed to accept follow request");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Follow request accepted",
      });
      queryClient.invalidateQueries({ queryKey: ["follow-requests"] });
      queryClient.invalidateQueries({ queryKey: ["follower-info"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept follow request",
      });
    },
  });
}

export function useRejectFollowRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, targetUserId }: { userId: string; targetUserId: string }) => {
      const response = await fetch(`/api/users/${targetUserId}/follow-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reject", userId }),
      });
      if (!response.ok) {
        throw new Error("Failed to reject follow request");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Follow request rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["follow-requests"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject follow request",
      });
    },
  });
}

export function useCancelFollowRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, targetUserId }: { userId: string; targetUserId: string }) => {
      const response = await fetch(`/api/users/${userId}/follow-requests/${targetUserId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to cancel follow request");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Follow request cancelled",
      });
      queryClient.invalidateQueries({ queryKey: ["follow-requests"] });
      queryClient.invalidateQueries({ queryKey: ["follower-info"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel follow request",
      });
    },
  });
}