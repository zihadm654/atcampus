"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";


export async function getOrganizations() {
    const user = await getCurrentUser();

    const members = await prisma.member.findMany({
        where: {
            userId: user?.id
        },
    });

    const organizations = await prisma.organization.findMany({
        where: {
            id: {
                in: members.map((member) => member.organizationId)
            }
        }
    },
    );

    return organizations;
}

export async function getActiveOrganization(userId: string) {
    const memberUser = await prisma.member.findFirst({
        where: { id: userId },
    });

    if (!memberUser) {
        return null;
    }

    const activeOrganization = await prisma.organization.findFirst({
        where: { id: memberUser.organizationId },
    });

    return activeOrganization;
}

export async function getOrganizationBySlug(slug: string) {
    try {
        const organizationBySlug = await prisma.organization.findFirst({
            where: { slug: slug },
            include: {
                members: {
                    select: {
                        user: true
                    }
                },
            },
        });

        return organizationBySlug;
    } catch (error) {
        console.error(error);
        return null;
    }
}