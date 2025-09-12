import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { CourseReviewForm } from "@/app/(protected)/courses/approvals/[id]/_components/CourseReviewForm";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export const metadata = constructMetadata({
    title: "Review Course - AtCampus",
    description: "Review and make approval decision on course submission.",
});

export default async function CourseReviewPage({ params }: PageProps) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
        return redirect("/login");
    }

    const approval = await prisma.courseApproval.findUnique({
        where: { id },
        include: {
            course: {
                include: {
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                    faculty: {
                        include: {
                            school: {
                                include: {
                                    organization: true,
                                },
                            },
                        },
                    },
                    approvals: true,
                },
            },
            reviewer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });

    if (!approval) {
        return notFound();
    }

    // Check access permissions
    const hasAccess =
        approval.reviewerId === user.id || // Reviewer can view
        approval.course.instructorId === user.id; // Course creator can view

    if (!hasAccess) {
        return (
            <div className="flex w-full flex-col gap-6">
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                    <p className="text-muted-foreground">
                        You don't have permission to view this course approval.
                    </p>
                </div>
            </div>
        );
    }

    const canReview = approval.reviewerId === user.id && approval.status === "PENDING";

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex items-center justify-between gap-2 p-2">
                <div>
                    <h1 className="text-3xl max-md:text-xl font-bold">Course Review</h1>
                    <p className="text-muted-foreground max-md:text-sm">
                        {canReview ? "Review and make approval decision" : "View course approval details"}
                    </p>
                </div>
            </div>
            <CourseReviewForm approval={approval as any} canReview={canReview} />
        </div>
    );
}