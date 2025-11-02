import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/lib/auth-client";
import type { UserSkillData } from "@/types/types";
import { addSkill, deleteSkill, updateSkill } from "./actions";

// Enhanced hook for skill management with optimistic updates
export const useSkills = (userId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Fetch user skills
  const {
    data: skills,
    isLoading,
    error,
  } = useQuery<UserSkillData[]>({
    queryKey: ["user-skills", userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/skills`);
      if (!response.ok) {
        throw new Error("Failed to fetch skills");
      }
      return response.json();
    },
    enabled: !!userId,
  });

  // Add skill mutation with optimistic update
  const addSkillMutation = useMutation({
    mutationFn: addSkill,
    onMutate: async (newSkill) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["user-skills", userId] });

      // Snapshot the previous value
      const previousSkills = queryClient.getQueryData<UserSkillData[]>([
        "user-skills",
        userId,
      ]);

      // Optimistically update to the new value
      const optimisticSkill: UserSkillData = {
        id: `optimistic-${Date.now()}`,
        skillId: `temp-${newSkill.name}`,
        skill: {
          name: newSkill.name,
          category: newSkill.category || null,
          yearsOfExperience: newSkill.yearsOfExperience || 0,
          difficulty: newSkill.difficulty || "BEGINNER",
        },
        _count: {
          endorsements: 0,
        },
      };

      queryClient.setQueryData<UserSkillData[]>(
        ["user-skills", userId],
        (old) => (old ? [...old, optimisticSkill] : [optimisticSkill])
      );

      // Return a context object with the snapshotted value
      return { previousSkills };
    },
    onError: (_err, _newSkill, context) => {
      // Rollback to the previous value
      queryClient.setQueryData(
        ["user-skills", userId],
        context?.previousSkills
      );

      toast({
        title: "Error",
        description: "Failed to add skill. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      // Update with the actual data from the server
      queryClient.setQueryData<UserSkillData[]>(
        ["user-skills", userId],
        (old) => {
          if (!old) return [data];

          // Replace the optimistic update with the actual data
          return old.map((skill) =>
            skill.id.startsWith("optimistic-") ? data : skill
          );
        }
      );

      toast({
        title: "Success",
        description: `"${data.skill?.name}" has been added to your profile.`,
      });
    },
    onSettled: () => {
      // Refetch skills after mutation
      queryClient.invalidateQueries({ queryKey: ["user-skills", userId] });
    },
  });

  // Update skill mutation with optimistic update
  const updateSkillMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) =>
      updateSkill(id, values),
    onMutate: async ({ id, values }) => {
      await queryClient.cancelQueries({ queryKey: ["user-skills", userId] });

      const previousSkills = queryClient.getQueryData<UserSkillData[]>([
        "user-skills",
        userId,
      ]);

      queryClient.setQueryData<UserSkillData[]>(
        ["user-skills", userId],
        (old) => {
          if (!old) return [];

          return old.map((skill) =>
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
        }
      );

      return { previousSkills };
    },
    onError: (_err, _values, context) => {
      queryClient.setQueryData(
        ["user-skills", userId],
        context?.previousSkills
      );

      toast({
        title: "Error",
        description: "Failed to update skill. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `"${data.skill?.name}" has been updated successfully.`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user-skills", userId] });
    },
  });

  // Delete skill mutation with optimistic update
  const deleteSkillMutation = useMutation({
    mutationFn: deleteSkill,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["user-skills", userId] });

      const previousSkills = queryClient.getQueryData<UserSkillData[]>([
        "user-skills",
        userId,
      ]);

      queryClient.setQueryData<UserSkillData[]>(
        ["user-skills", userId],
        (old) => {
          if (!old) return [];
          return old.filter((skill) => skill.id !== id);
        }
      );

      return { previousSkills };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(
        ["user-skills", userId],
        context?.previousSkills
      );

      toast({
        title: "Error",
        description: "Failed to delete skill. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `"${data.title}" has been removed from your profile.`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user-skills", userId] });
    },
  });

  // Check if current user can edit skills
  const canEdit = currentUserId === userId;

  return {
    skills: skills || [],
    isLoading,
    error,
    canEdit,
    addSkill: addSkillMutation.mutateAsync,
    updateSkill: updateSkillMutation.mutateAsync,
    deleteSkill: deleteSkillMutation.mutateAsync,
    isAdding: addSkillMutation.isPending,
    isUpdating: updateSkillMutation.isPending,
    isDeleting: deleteSkillMutation.isPending,
  };
};
