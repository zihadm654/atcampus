import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let institutionId: string;

        if (user.role === "PROFESSOR") {
            const professor = await prisma.member.findFirst({
                where: {
                    userId: user.id,
                    role: "member", // Assuming this is the role for professors in faculty
                },
                include: {
                    organization: {
                        include: {
                            members: {
                                where: {
                                    role: "owner",
                                },
                                select: {
                                    userId: true,
                                },
                            },
                        },
                    },
                    faculty: {
                        include: {
                            school: {
                                include: {
                                    institution: true,
                                }
                            },
                        },
                    },
                },
            });

            if (!professor || !professor.faculty?.school?.institution.id) {
                return NextResponse.json({ error: "Professor is not assigned to any institution" }, { status: 404 });
            }
            console.log(professor, "professor")
            institutionId = professor.organization.members[0].userId;
        } else if (user.role === "INSTITUTION" || user.role === "ORGANIZATION") { // Handling both as per potential typo
            institutionId = user.id;
        } else {
            return NextResponse.json({ error: "User role not supported" }, { status: 403 });
        }
        console.log(institutionId, "id");
        // Fetch schools with their faculties
        const schools = await prisma.school.findMany({
            where: {
                institutionId: institutionId,
            },
            include: {
                faculties: {
                    select: {
                        id: true,
                        name: true,
                        shortName: true,
                        slug: true,
                        description: true,
                        isActive: true,
                    },
                    orderBy: {
                        name: "asc",
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(schools);
    } catch (error) {
        console.error("Error fetching user schools and faculties:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}