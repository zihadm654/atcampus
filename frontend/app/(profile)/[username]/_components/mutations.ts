import { useRouter } from "next/navigation";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { PostsPage } from "@/types/types";
import { useUploadThing } from "@/lib/uploadthing";
import { UpdateUserProfileValues } from "@/lib/validations/validation";
import { useToast } from "@/components/ui/use-toast";

import { updateUserProfile } from "./actions";

export function useUpdateProfileMutation() {
  const { toast } = useToast();

  const router = useRouter();

  const queryClient = useQueryClient();

  const { startUpload: startAvatarUpload } = useUploadThing("avatar");
  const { startUpload: startCoverUpload } = useUploadThing("coverImage");

  const mutation = useMutation({
    mutationFn: async ({
      values,
      avatar,
      coverImage,
    }: {
      values: UpdateUserProfileValues;
      avatar?: File;
      coverImage?: File;
    }) => {
      return Promise.all([
        updateUserProfile(values),
        avatar && startAvatarUpload([avatar]),
        coverImage && startCoverUpload([coverImage]),
      ]);
    },
    onSuccess: async ([updatedUser, avatarUploadResult, coverUploadResult]) => {
      const newAvatarUrl = avatarUploadResult?.[0]?.serverData?.avatarUrl;
      const newCoverUrl = coverUploadResult?.[0]?.serverData?.coverImageUrl;

      const queryFilter: QueryFilters = {
        queryKey: ["post-feed"],
      };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                if (post.user.id === updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser,
                      avatarUrl: newAvatarUrl || updatedUser.image,
                      coverImage: newCoverUrl || updatedUser.coverImage,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        },
      );

      router.refresh();

      toast({
        description: "Profile updated",
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
