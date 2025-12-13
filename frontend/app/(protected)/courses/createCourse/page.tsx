import { redirect } from "next/navigation";
import { CreateCourseForm } from "@/components/forms/create-course";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { type Course } from "@prisma/client";

// Define the type for course with included relations
type CourseWithRelations = Course & {
  instructor: any;
  faculty: any;
  school: any;
};

interface PostCoursePageProps {
  searchParams: { edit?: string };
}

export async function generateMetadata({ searchParams }: PostCoursePageProps) {
  const isEdit = !!searchParams.edit;
  return constructMetadata({
    title: isEdit ? "Edit Course - AtCampus" : "Create Course - AtCampus",
    description: isEdit ? "Edit course information." : "Create a new course.",
  });
}

const PostCoursePage = async ({ searchParams }: PostCoursePageProps) => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/login");
  }

  const courseId = searchParams.edit;
  let course: CourseWithRelations | null = null;
  if (courseId) {
    course = (await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: true,
        faculty: true,
        school: true,
      },
    })) as CourseWithRelations | null;

    if (!course) {
      return redirect("/courses");
    }

    // Check if user is the instructor or has permission to edit
    if (course.instructorId !== user.id && user.role !== "INSTITUTION") {
      return redirect("/courses");
    }
  }

  return (
    <div className="mt-5 w-full">
      <CreateCourseForm user={user} course={course} />
    </div>
  );
};

export default PostCoursePage;
