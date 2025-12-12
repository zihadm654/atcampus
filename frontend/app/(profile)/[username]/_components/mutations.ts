import {
  type InfiniteData,
  type QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import type { UpdateUserProfileValues } from "@/lib/validations/validation";
import type { PostsPage } from "@/types/types";

import { updateUserProfile } from "./actions";

export function useUpdateProfileMutation() {
  const { toast } = useToast();

  const router = useRouter();

  const queryClient = useQueryClient();

  const { startUpload: startAvatarUpload, isUploading: isAvatarUploading } =
    useUploadThing("avatar");
  const { startUpload: startCoverUpload, isUploading: isCoverUploading } =
    useUploadThing("coverImage");

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
      // First update the user profile data
      const updatedUser = await updateUserProfile(values);

      // Then handle file uploads
      let avatarUploadResult: any;
      let coverUploadResult: any;

      try {
        if (avatar) {
          const avatarResult = await startAvatarUpload([avatar]);
          if (avatarResult && avatarResult.length > 0) {
            avatarUploadResult = avatarResult;
          }
        }
        if (coverImage) {
          const coverResult = await startCoverUpload([coverImage]);
          if (coverResult && coverResult.length > 0) {
            coverUploadResult = coverResult;
          }
        }
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        // We don't throw here to allow the profile update to succeed even if image upload fails
        // The user will see a toast notification about the failed upload
      }

      return [updatedUser, avatarUploadResult, coverUploadResult];
    },
    onSuccess: async ([updatedUser, avatarUploadResult, coverUploadResult]) => {
      // console.log("Profile update success", {
      //   userId: updatedUser?.id,
      //   hasAvatarResult: !!avatarUploadResult,
      //   hasCoverResult: !!coverUploadResult,
      // });

      // Check if any uploads failed
      const avatarUploadFailed = avatarUploadResult === undefined;
      const coverUploadFailed = coverUploadResult === undefined;

      let newAvatarUrl = updatedUser.image;
      let newCoverUrl = updatedUser.coverImage;

      // Only update URLs if uploads were successful
      if (avatarUploadResult?.[0]?.serverData?.avatarUrl) {
        newAvatarUrl = avatarUploadResult[0].serverData.avatarUrl;
        console.log("Avatar URL updated", { newAvatarUrl });
      }

      if (coverUploadResult?.[0]?.serverData?.coverImageUrl) {
        newCoverUrl = coverUploadResult[0].serverData.coverImageUrl;
        console.log("Cover URL updated", { newCoverUrl });
      }

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
                      avatarUrl: newAvatarUrl,
                      coverImage: newCoverUrl,
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
