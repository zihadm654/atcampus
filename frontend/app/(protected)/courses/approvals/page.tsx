import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { ApprovalDashboard } from "./_components/ApprovalDashboard";

export const metadata = constructMetadata({
    title: "Course Approvals - AtCampus",
    description: "Review and approve course submissions.",
});

export default async function CourseApprovalsPage() {
    const user = await getCurrentUser();

    if (!user) {
        return redirect("/login");
    }

    // Check if user has any approval permissions
    const memberRoles = await prisma.member.findMany({
        where: {
            userId: user.id,
            isActive: true,
            role: {
                in: ["FACULTY_ADMIN", "SCHOOL_ADMIN"]
            }
        },
        include: {
            organization: true,
            faculty: {
                include: {
                    school: true,
                },
            },
        },
    });

    const hasInstitutionRole = user.role === "INSTITUTION";
    const hasApprovalPermissions = memberRoles.length > 0 || hasInstitutionRole;

    if (!hasApprovalPermissions) {
        return (
            <div className="flex w-full flex-col gap-6">
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                    <p className="text-muted-foreground">
                        You don't have permission to review course approvals.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex items-center justify-between gap-2 p-2">
                <div>
                    <h1 className="text-3xl max-md:text-xl font-bold">Course Approvals</h1>
                    <p className="text-muted-foreground max-md:text-sm">
                        Review and approve course submissions
                    </p>
                </div>
            </div>
            <ApprovalDashboard user={user} memberRoles={memberRoles as any} />
        </div>
    );
}