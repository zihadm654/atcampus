import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { auditInvitationAction, auditMemberAction } from "@/lib/audit";
import { excludeDeleted, softDeleteInvitation } from "@/lib/soft-delete";

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

const acceptInvitationSchema = z.object({
    token: z.string().min(1, "Invitation token is required"),
});

const declineInvitationSchema = z.object({
    token: z.string().min(1, "Invitation token is required"),
    reason: z.string().max(500).optional(),
});

// GET /api/invitations/[id] - Get invitation details by ID or token
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const url = new URL(req.url);
        const token = url.searchParams.get("token");

        let whereClause: any;

        if (token) {
            // Public access via token (for invitation acceptance page)
            whereClause = excludeDeleted({
                invitationToken: token,
                status: "PENDING",
                expiresAt: {
                    gt: new Date(),
                },
            });
        } else {
            // Authenticated access via ID
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            whereClause = excludeDeleted({
                id,
                inviterId: currentUser.id,
            });
        }

        const invitation = await prisma.invitation.findFirst({
            where: whereClause,
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true,
                        description: true,
                    },
                },
                faculty: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                school: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                inviter: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        if (!invitation) {
            return NextResponse.json(
                { error: "Invitation not found or expired" },
                { status: 404 }
            );
        }

        // Don't expose sensitive data in public token access
        const responseData = token ? {
            ...invitation,
            invitationToken: undefined,
            ipAddress: undefined,
            userAgent: undefined,
        } : invitation;

        return NextResponse.json({ invitation: responseData });
    } catch (error) {
        console.error("Error fetching invitation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/invitations/[id]/accept - Accept invitation
export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { token } = acceptInvitationSchema.parse(body);

        // Find invitation by token
        const invitation = await prisma.invitation.findFirst({
            where: excludeDeleted({
                invitationToken: token,
                status: "PENDING",
                expiresAt: {
                    gt: new Date(),
                },
            }),
            include: {
                organization: true,
                faculty: true,
                school: true,
            },
        });

        if (!invitation) {
            return NextResponse.json(
                { error: "Invalid or expired invitation" },
                { status: 404 }
            );
        }

        // Check if user already exists with this email
        let user = await prisma.user.findUnique({
            where: { email: invitation.email },
        });

        if (!user) {
            return NextResponse.json(
                {
                    error: "User account not found. Please create an account first.",
                    requiresRegistration: true,
                    email: invitation.email,
                },
                { status: 422 }
            );
        }

        // Check if user is already a member of this organization
        const existingMember = await prisma.member.findFirst({
            where: {
                userId: user.id,
                organizationId: invitation.organizationId,
                isActive: true,
            },
        });

        if (existingMember) {
            return NextResponse.json(
                { error: "User is already a member of this organization" },
                { status: 409 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            // Update invitation status
            const updatedInvitation = await tx.invitation.update({
                where: { id: invitation.id },
                data: {
                    status: "ACCEPTED",
                    respondedAt: new Date(),
                    acceptedAt: new Date(),
                },
            });

            // Create member record
            const newMember = await tx.member.create({
                data: {
                    userId: user!.id,
                    organizationId: invitation.organizationId,
                    facultyId: invitation.facultyId,
                    role: invitation.role,
                    isActive: true,
                    joinedAt: new Date(),
                    academicTitle: invitation.proposedTitle,
                    department: invitation.department,
                    employmentType: invitation.contractType,
                    contractStartDate: invitation.startDate,
                    assignedAt: invitation.type === "PROFESSOR_APPOINTMENT" ? new Date() : null,
                },
            });

            // Create notification for inviter
            await tx.notification.create({
                data: {
                    recipientId: invitation.inviterId,
                    issuerId: user!.id,
                    type: "PROFESSOR_INVITATION",
                    title: "Invitation Accepted",
                    message: `${user!.name} has accepted your invitation to join ${invitation.organization.name}`,
                    invitationId: invitation.id,
                },
            });

            return { updatedInvitation, newMember };
        });

        // Create audit logs
        await Promise.all([
            auditInvitationAction(
                "ACCEPT",
                invitation.id,
                { status: "PENDING" },
                { status: "ACCEPTED" },
                "Invitation accepted by recipient",
                { userId: user.id, organizationId: invitation.organizationId }
            ),
            auditMemberAction(
                "CREATE",
                result.newMember.id,
                null,
                result.newMember,
                "Member created from accepted invitation",
                { invitationId: invitation.id, role: invitation.role }
            ),
        ]);

        return NextResponse.json({
            message: "Invitation accepted successfully",
            member: result.newMember,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error accepting invitation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/invitations/[id] - Cancel/decline invitation
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const currentUser = await getCurrentUser();
        const url = new URL(req.url);
        const token = url.searchParams.get("token");
        const body = await req.json().catch(() => ({}));

        let invitation;

        if (token) {
            // Public decline via token
            const { reason } = body.reason ? declineInvitationSchema.parse(body) : { reason: undefined };

            invitation = await prisma.invitation.findFirst({
                where: excludeDeleted({
                    invitationToken: token,
                    status: "PENDING",
                }),
            });

            if (!invitation) {
                return NextResponse.json(
                    { error: "Invalid invitation token" },
                    { status: 404 }
                );
            }

            // Update to declined status
            await prisma.invitation.update({
                where: { id: invitation.id },
                data: {
                    status: "DECLINED",
                    respondedAt: new Date(),
                    declinedAt: new Date(),
                },
            });

            // Create audit log
            await auditInvitationAction(
                "DECLINE",
                invitation.id,
                { status: "PENDING" },
                { status: "DECLINED" },
                reason || "Invitation declined by recipient"
            );

            return NextResponse.json({ message: "Invitation declined successfully" });

        } else {
            // Cancel by inviter
            if (!currentUser) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            invitation = await prisma.invitation.findFirst({
                where: excludeDeleted({
                    id,
                    inviterId: currentUser.id,
                }),
            });

            if (!invitation) {
                return NextResponse.json(
                    { error: "Invitation not found" },
                    { status: 404 }
                );
            }

            if (invitation.status !== "PENDING") {
                return NextResponse.json(
                    { error: "Cannot cancel non-pending invitation" },
                    { status: 409 }
                );
            }

            // Cancel invitation (soft delete)
            await softDeleteInvitation(invitation.id, "Cancelled by inviter");

            // Update status
            await prisma.invitation.update({
                where: { id: invitation.id },
                data: {
                    status: "CANCELLED",
                    cancelledAt: new Date(),
                },
            });

            return NextResponse.json({ message: "Invitation cancelled successfully" });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error processing invitation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}