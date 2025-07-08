import {
  type InfiniteData,
  type QueryFilters,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import type { PostsPage } from '@/types/types';

import { submitPost } from './actions';

export function useSubmitPostMutation() {
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const user = session?.user;
  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      const queryFilter = {
        queryKey: ['post-feed'],
        predicate(query) {
          return (
            query.queryKey.includes('for-you') ||
            (query.queryKey.includes('user-posts') &&
              query.queryKey.includes(user?.id as string))
          );
        },
      } satisfies QueryFilters;

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        }
      );

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return queryFilter.predicate(query) && !query.state.data;
        },
      });

      toast.success('Post created');
    },
    onError(error) {
      console.error(error);
      toast('Failed to post. Please try again.');
    },
  });

  return mutation;
}
