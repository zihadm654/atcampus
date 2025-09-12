import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { getInstructorCourses } from "@/components/courses/actions";
import { MyCoursesList } from "./_components/MyCoursesList";

export const metadata = constructMetadata({
    title: "My Courses - AtCampus",
    description: "Manage your courses and view approval status.",
});

export default async function MyCoursesPage() {
    const user = await getCurrentUser();

    if (!user) {
        return redirect("/login");
    }

    const courses = await getInstructorCourses();

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex items-center justify-between gap-2 p-2">
                <div>
                    <h1 className="text-3xl max-md:text-xl font-bold">My Courses</h1>
                    <p className="text-muted-foreground max-md:text-sm">
                        Manage your courses and track approval status
                    </p>
                </div>
            </div>
            <MyCoursesList courses={courses} />
        </div>
    );
}