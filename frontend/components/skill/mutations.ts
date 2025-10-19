import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSkill, deleteSkill, updateSkill } from "@/components/skill/actions";
import { useToast } from "@/components/ui/use-toast";
import type { TUserSkillSchema } from "@/lib/validations/validation";
import type { UserSkillData } from "@/types/types";

export function useSkillMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, values }: { id?: string; values: TUserSkillSchema }) => {
      if (id) {
        return updateSkill(id, values);
      }
      return addSkill(values);
    },
    onSuccess: async (updatedSkill) => {
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      await queryClient.invalidateQueries({ queryKey: ["skills"] });

      // Optimistically update the cache
      queryClient.setQueryData(["user"], (oldData: any) => {
        if (!oldData?.userSkills) return oldData;

        const updatedSkills = oldData.userSkills.map((skill: UserSkillData) =>
          skill.id === updatedSkill.id ? updatedSkill : skill
        );

        // If it's a new skill, add it to the list
        if (
          !updatedSkills.find((s: UserSkillData) => s.id === updatedSkill.id)
        ) {
          updatedSkills.unshift(updatedSkill);
        }

        return { ...oldData, userSkills: updatedSkills };
      });
    },
    onError(error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        description: error.message || "Failed to save skill. Please try again.",
      });
    },
  });

  return mutation;
}

export function useDeleteSkillMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteSkill,
    onSuccess: async (deletedSkill) => {
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      await queryClient.invalidateQueries({ queryKey: ["skills"] });

      // Optimistically remove from cache
      queryClient.setQueryData(["user"], (oldData: any) => {
        if (!oldData?.userSkills) return oldData;

        const updatedSkills = oldData.userSkills.filter(
          (skill: UserSkillData) => skill.id !== deletedSkill.id
        );

        return { ...oldData, userSkills: updatedSkills };
      });

      toast({
        description: `"${deletedSkill.title}" has been deleted successfully.`,
      });
    },
    onError(error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        description:
          error.message || "Failed to delete skill. Please try again.",
      });
    },
  });

  return mutation;
}
