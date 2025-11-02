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
    onMutate: async ({
      id,
      values,
    }: {
      id?: string;
      values: TUserSkillSchema;
    }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["user-skills"] });
      await queryClient.cancelQueries({ queryKey: ["user"] });
      await queryClient.cancelQueries({ queryKey: ["skills"] });

      // Snapshot the previous values
      const previousUserSkills = queryClient.getQueryData(["user"]);
      const previousSkills = queryClient.getQueryData<UserSkillData[]>([
        "user-skills",
      ]);

      if (id) {
        // Updating an existing skill - optimistically update in cache
        queryClient.setQueryData<UserSkillData[]>(["user-skills"], (old = []) =>
          old.map((skill) =>
            skill.id === id
              ? {
                  ...skill,
                  skill: {
                    ...skill.skill,
                    name: values.name,
                    category: values.category || null,
                  },
                }
              : skill
          )
        );

        // Update user cache
        queryClient.setQueryData(["user"], (oldData: any) => {
          if (!oldData?.userSkills) return oldData;

          const updatedSkills = oldData.userSkills.map(
            (skill: UserSkillData) =>
              skill.id === id
                ? {
                    ...skill,
                    skill: {
                      ...skill.skill,
                      name: values.name,
                      category: values.category || null,
                    },
                  }
                : skill
          );

          return { ...oldData, userSkills: updatedSkills };
        });
      } else {
        // Adding a new skill - optimistically add to cache
        const optimisticSkill: UserSkillData = {
          id: `optimistic-${Date.now()}`,
          skillId: `temp-${values.name}`,
          skill: {
            name: values.name,
            category: values.category || null,
            yearsOfExperience: values.yearsOfExperience || 0,
            difficulty: values.difficulty || "BEGINNER",
          },
          _count: {
            endorsements: 0,
          },
        };

        // Update user skills cache
        queryClient.setQueryData<UserSkillData[]>(
          ["user-skills"],
          (old = []) => [optimisticSkill, ...old]
        );

        // Update user cache
        queryClient.setQueryData(["user"], (oldData: any) => {
          if (!oldData?.userSkills) return oldData;

          return {
            ...oldData,
            userSkills: [optimisticSkill, ...oldData.userSkills],
          };
        });
      }

      // Return a context object with the snapshotted values
      return { previousUserSkills, previousSkills };
    },
    onSuccess: async (updatedSkill) => {
      // Update with the actual data from the server
      queryClient.setQueryData<UserSkillData[]>(["user-skills"], (old = []) => {
        if (!old) return [updatedSkill];

        // Replace the optimistic update with the actual data
        return old.map((skill) =>
          skill.id.startsWith("optimistic-") ? updatedSkill : skill
        );
      });

      // Update user cache with actual data
      queryClient.setQueryData(["user"], (oldData: any) => {
        if (!oldData?.userSkills) return oldData;

        const updatedSkills = oldData.userSkills.map((skill: UserSkillData) =>
          skill.id === updatedSkill.id || skill.id.startsWith("optimistic-")
            ? updatedSkill
            : skill
        );

        // If it's a new skill and wasn't found, add it to the list
        if (
          !updatedSkills.some((s: UserSkillData) => s.id === updatedSkill.id)
        ) {
          updatedSkills.unshift(updatedSkill);
        }

        return { ...oldData, userSkills: updatedSkills };
      });

      // Invalidate relevant queries to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      await queryClient.invalidateQueries({ queryKey: ["skills"] });
      await queryClient.invalidateQueries({ queryKey: ["user-skills"] });
    },
    onError: (error: any, variables: any, context: any) => {
      // Rollback to the previous values
      if (context?.previousUserSkills) {
        queryClient.setQueryData(["user"], context.previousUserSkills);
      }
      if (context?.previousSkills) {
        queryClient.setQueryData(["user-skills"], context.previousSkills);
      }

      toast({
        variant: "destructive",
        description: error.message || "Failed to save skill. Please try again.",
      });
    },
    onSettled: async () => {
      // Refetch to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      await queryClient.invalidateQueries({ queryKey: ["skills"] });
      await queryClient.invalidateQueries({ queryKey: ["user-skills"] });
    },
  });

  return mutation;
}

export function useDeleteSkillMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteSkill,
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["user-skills"] });
      await queryClient.cancelQueries({ queryKey: ["user"] });
      await queryClient.cancelQueries({ queryKey: ["skills"] });

      // Snapshot the previous values
      const previousUserSkills = queryClient.getQueryData(["user"]);
      const previousSkills = queryClient.getQueryData<UserSkillData[]>([
        "user-skills",
      ]);

      // Optimistically remove from cache
      queryClient.setQueryData<UserSkillData[]>(["user-skills"], (old = []) =>
        old.filter((skill) => skill.id !== id)
      );

      // Update user cache
      queryClient.setQueryData(["user"], (oldData: any) => {
        if (!oldData?.userSkills) return oldData;

        const updatedSkills = oldData.userSkills.filter(
          (skill: UserSkillData) => skill.id !== id
        );

        return { ...oldData, userSkills: updatedSkills };
      });

      // Return a context object with the snapshotted values
      return { previousUserSkills, previousSkills };
    },
    onSuccess: async (deletedSkill) => {
      toast({
        description: `"${deletedSkill.title}" has been deleted successfully.`,
      });

      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      await queryClient.invalidateQueries({ queryKey: ["skills"] });
      await queryClient.invalidateQueries({ queryKey: ["user-skills"] });
    },
    onError: (error: any, variables: any, context: any) => {
      // Rollback to the previous values
      if (context?.previousUserSkills) {
        queryClient.setQueryData(["user"], context.previousUserSkills);
      }
      if (context?.previousSkills) {
        queryClient.setQueryData(["user-skills"], context.previousSkills);
      }

      toast({
        variant: "destructive",
        description:
          error.message || "Failed to delete skill. Please try again.",
      });
    },
    onSettled: async () => {
      // Refetch to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      await queryClient.invalidateQueries({ queryKey: ["skills"] });
      await queryClient.invalidateQueries({ queryKey: ["user-skills"] });
    },
  });

  return mutation;
}
