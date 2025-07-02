import { useRouter } from "next/navigation";
import {
  InfiniteData,
  QueryFilters,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { SkillPage } from "@/types/types";
import { TUserSkillSchema } from "@/lib/validations/validation";
import { useToast } from "@/components/ui/use-toast";
import { addSkill } from "@/components/skill/actions";

export function useSkillMutation() {
  const { toast } = useToast();

  const router = useRouter();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addSkill,
    // },
    onSuccess: async (newSkill) => {
      // Invalidate the 'user' query to refetch user data including skills.
      // This is a robust way to ensure the UI is updated with the latest data.
      await queryClient.invalidateQueries({
        queryKey: ["user"],
      });
      toast({
        description: "Skill updated successfully!",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to update profile. Please try again.",
      });
    },
  });

  return mutation;
}
function startAvatarUpload(arg0: File[]): any {
  throw new Error("Function not implemented.");
}
