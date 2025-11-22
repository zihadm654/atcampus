"use client";

import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import useFollowerInfo from "@/hooks/useFollowerInfo";
import kyInstance from "@/lib/ky";
import type { FollowerInfo } from "@/types/types";
import { useUser } from "@/hooks/useUser";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowButton({
  userId,
  initialState,
}: FollowButtonProps) {
  const { toast } = useToast();
  const { user: currentUser } = useUser();

  const queryClient = useQueryClient();

  const { data } = useFollowerInfo(userId, initialState);
  const queryKey: QueryKey = ["follower-info", userId];

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      // Wait for data to be loaded
      if (!data) {
        throw new Error("User data not loaded");
      }

      // Handle different states
      if (data.followRequestStatus === "PENDING") {
        // Cancel pending follow request
        // The current user is the requester, userId is the target
        return kyInstance.delete(`/api/users/${currentUser?.id}/follow-requests/${data.followRequestId}`);
      } else if (data.isFollowedByUser) {
        // Unfollow user
        return kyInstance.delete(`/api/users/${userId}/followers`);
      } else {
        // Send follow request or follow directly
        return kyInstance.post(`/api/users/${userId}/followers`);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);

      // Optimistic update based on current state
      let newState: FollowerInfo;

      if (previousState?.followRequestStatus === "PENDING") {
        // Cancelling pending request
        newState = {
          ...previousState,
          followRequestStatus: null,
          hasPendingFollowRequest: false,
        };
      } else if (previousState?.isFollowedByUser) {
        // Unfollowing
        newState = {
          ...previousState,
          followers: Math.max(0, (previousState.followers || 1) - 1),
          isFollowedByUser: false,
        };
      } else {
        // Following or sending request
        if (previousState?.isPrivateAccount) {
          // Private account - send request
          newState = {
            ...previousState,
            followRequestStatus: "PENDING",
            hasPendingFollowRequest: true,
          };
        } else {
          // Public account - follow directly
          newState = {
            ...previousState,
            followers: (previousState?.followers || 0) + 1,
            isFollowedByUser: true,
          };
        }
      }

      queryClient.setQueryData<FollowerInfo>(queryKey, newState);

      return { previousState };
    },
    onError(error, _variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    },
    onSuccess: (response, _variables, _context) => {
      // Handle success responses
      if (response && typeof response === 'object') {
        // Check if it's a follow request response
        if ('message' in response) {
          const message = response.message as string;
          if (message.toLowerCase().includes('request')) {
            toast({
              description: message,
            });
          } else {
            toast({
              description: message,
            });
          }
        }
      }
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["follower-info", userId] });
      queryClient.invalidateQueries({ queryKey: ["follow-requests", userId] });
    },
  });

  // Determine button text and variant based on state
  const getButtonText = () => {
    if (data.followRequestStatus === "PENDING") {
      return "Request Pending";
    } else if (data.isFollowedByUser) {
      return "Unfollow";
    } else if (data.isPrivateAccount) {
      return "Send Request";
    } else {
      return "Follow";
    }
  };

  const getButtonVariant = () => {
    if (data.followRequestStatus === "PENDING") {
      return "secondary";
    } else if (data.isFollowedByUser) {
      return "secondary";
    } else {
      return "default";
    }
  };

  return (
    <Button
      onClick={() => mutate()}
      variant={getButtonVariant()}
      disabled={isPending || !data}
      size="sm"
    >
      {getButtonText()}
    </Button>
  );
}