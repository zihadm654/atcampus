"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

// Define the type for our assignment function
interface AssignFacultyParams {
  memberId: string;
  facultyId: string | null;
  organizationId: string;
}

// Action function to assign faculty to member
export async function assignFacultyToMember({
  memberId,
  facultyId,
  organizationId,
}: AssignFacultyParams) {
  const response = await fetch(`/api/members/${memberId}/faculty`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ facultyId }),
  });

  if (!response.ok) {
    throw new Error("Failed to assign faculty");
  }

  return response.json();
}

// Mutation hook for assigning faculty to member
export function useAssignFacultyToMemberMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: assignFacultyToMember,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["organization"] });

      // Snapshot the previous value
      const previousOrg = queryClient.getQueryData(["organization"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["organization"], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          members: old.members.map((member: any) =>
            member.id === variables.memberId
              ? { ...member, facultyId: variables.facultyId }
              : member
          ),
        };
      });

      // Return a context object with the snapshotted value
      return { previousOrg };
    },
    onSuccess: (updatedMember) => {
      toast({ description: "Faculty assigned successfully" });
    },
    onError: (err, variables, context) => {
      // Rollback to the previous value
      if (context?.previousOrg) {
        queryClient.setQueryData(["organization"], context.previousOrg);
      }
      toast({
        variant: "destructive",
        description: "Failed to assign faculty",
      });
    },
    onSettled: () => {
      // Refetch organization data
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });

  return mutation;
}
