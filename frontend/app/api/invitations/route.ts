import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { auditInvitationAction } from "@/lib/audit";
import { excludeDeleted } from "@/lib/soft-delete";
import { invitationSchema } from "@/lib/validations/enhanced-validations";

// Helper function to generate secure invitation token
function generateInvitationToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// Helper function to get client IP and User Agent
function getClientInfo(req: NextRequest) {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    return { ipAddress, userAgent };
}

// GET /api/invitations - List invitations with advanced filtering
export async function GET(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const status = url.searchParams.get("status");
        const type = url.searchParams.get("type");
        const organizationId = url.searchParams.get("organizationId");
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 100);
        const includeExpired = url.searchParams.get("includeExpired") === "true";

        // Build where clause
        let whereClause: any = excludeDeleted({
            inviterId: currentUser.id,
        });

        if (status) {
            // Convert status to uppercase to match Prisma enum
            const upperCaseStatus = status.toUpperCase();
            // Validate that the status is a valid InvitationStatus
            const validStatuses = ["PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "CANCELLED"];
            if (validStatuses.includes(upperCaseStatus)) {
                whereClause.status = upperCaseStatus;
            }
        }

        if (type) {
            // Convert type to uppercase to match Prisma enum
            const upperCaseType = type.toUpperCase();
            // Validate that the type is a valid InvitationType
            const validTypes = ["ORGANIZATION_MEMBER", "PROFESSOR_APPOINTMENT", "FACULTY_ASSIGNMENT"];
            if (validTypes.includes(upperCaseType)) {
                whereClause.type = upperCaseType;
            }
        }

        if (organizationId) {
            whereClause.organizationId = organizationId;
        }

        if (!includeExpired) {
            whereClause.expiresAt = {
                gt: new Date(),
            };
        }

        const skip = (page - 1) * limit;

        const [invitations, total] = await Promise.all([
            prisma.invitation.findMany({
                where: whereClause,
                include: {
                    organization: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                    faculty: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    school: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    inviter: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: [
                    { status: 'asc' },
                    { createdAt: 'desc' },
                ],
                skip,
                take: limit,
            }),
            prisma.invitation.count({ where: whereClause })
        ]);

        return NextResponse.json({
            invitations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching invitations:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/invitations - Create new invitation with enhanced security
export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { ipAddress, userAgent } = getClientInfo(req);

        // Add default expiration if not provided (30 days)
        if (!body.expiresAt) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            body.expiresAt = expiryDate.toISOString();
        }

        const validatedData = invitationSchema.parse(body);

        // Check for existing invitation with same email and organization
        const existingInvitation = await prisma.invitation.findFirst({
            where: excludeDeleted({
                email: validatedData.email,
                organizationId: validatedData.organizationId,
                status: {
                    in: ["PENDING", "ACCEPTED"],
                },
            }),
        });

        if (existingInvitation) {
            return NextResponse.json(
                { error: "An active invitation already exists for this email in this organization" },
                { status: 409 }
            );
        }

        // Verify user has permission to invite to this organization
        const userMembership = await prisma.member.findFirst({
            where: {
                userId: currentUser.id,
                organizationId: validatedData.organizationId,
                isActive: true,
                role: {
                    in: ["FACULTY_ADMIN", "SCHOOL_ADMIN", "ORGANIZATION_ADMIN", "SUPER_ADMIN", "ADMIN", "owner"],
                },
            },
        });

        if (!userMembership) {
            return NextResponse.json(
                { error: "You don't have permission to invite members to this organization" },
                { status: 403 }
            );
        }

        // Generate secure invitation token
        const invitationToken = generateInvitationToken();

        const invitation = await prisma.invitation.create({
            data: {
                ...validatedData,
                inviterId: currentUser.id,
                expiresAt: new Date(validatedData.expiresAt),
                startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
                invitationToken,
                ipAddress,
                userAgent,
                sentAt: new Date(),
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                faculty: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                school: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Create audit log
        await auditInvitationAction(
            "CREATE",
            invitation.id,
            null,
            invitation,
            `Invitation sent to ${validatedData.email}`,
            {
                organizationId: validatedData.organizationId,
                role: validatedData.role,
                type: validatedData.type,
                ipAddress,
                userAgent,
            }
        );

        // TODO: Send invitation email with secure token link
        // await sendInvitationEmail(invitation);

        return NextResponse.json(
            {
                message: "Invitation sent successfully",
                invitation: {
                    ...invitation,
                    invitationToken: undefined, // Don't expose token in response
                },
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid invitation data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error creating invitation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}