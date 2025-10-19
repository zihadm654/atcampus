import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import {
  endorseSkill,
  getSkillEndorsements,
  removeEndorsement,
} from "./endorsement.actions";

/**
 * Hook for endorsing a skill
 */
export function useEndorseSkillMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userSkillId,
      skillId,
    }: {
      userSkillId: string;
      skillId: string;
    }) => endorseSkill(userSkillId, skillId),
    onSuccess: (_, variables) => {
      // Invalidate the endorsements query to refetch
      queryClient.invalidateQueries({
        queryKey: ["skillEndorsements", variables.userSkillId],
      });

      toast({
        description: "Skill endorsed successfully!",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "Failed to endorse skill",
      });
    },
  });
}

/**
 * Hook for removing a skill endorsement
 */
export function useRemoveEndorsementMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userSkillId: string) => removeEndorsement(userSkillId),
    onSuccess: (_, userSkillId) => {
      // Invalidate the endorsements query to refetch
      queryClient.invalidateQueries({
        queryKey: ["skillEndorsements", userSkillId],
      });

      toast({
        description: "Endorsement removed successfully!",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove endorsement",
      });
    },
  });
}

/**
 * Hook for fetching skill endorsements
 */
export function useSkillEndorsements(userSkillId: string) {
  return useQuery({
    queryKey: ["skillEndorsements", userSkillId],
    queryFn: () => getSkillEndorsements(userSkillId),
    enabled: !!userSkillId,
  });
}
