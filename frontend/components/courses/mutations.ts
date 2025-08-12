import { usePathname, useRouter } from "next/navigation";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { CoursesPage } from "@/types/types";
import { deleteCourse } from "./actions";


export function useDeleteCourseMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: async (deletedCourse) => {
      const queryFilter: QueryFilters = { queryKey: ["course-feed"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<CoursesPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              courses: page.courses.filter((j) => j.id !== deletedCourse.id),
            })),
          };
        },
      );

      toast.success("Course deleted");

      if (pathname === `/courses/${deletedCourse.id}`) {
        router.push(`/${deletedCourse.instructor.username}`);
      }
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to delete post. Please try again.");
    },
  });

  return mutation;
}
