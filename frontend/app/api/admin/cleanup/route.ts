import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cleanupExpiredDeleted } from "@/lib/soft-delete";
import { createAuditLog } from "@/lib/audit";

// POST /api/admin/cleanup - Run cleanup tasks (should be called by cron job)
export async function POST(req: NextRequest) {
    try {
        // Verify admin access
        const authHeader = req.headers.get('authorization');
        const expectedToken = process.env.ADMIN_CLEANUP_TOKEN;

        if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const results = {
            expiredInvitations: 0,
            cleanedSoftDeleted: 0,
            oldAuditLogs: 0,
        };

        // 1. Mark expired invitations as EXPIRED
        const expiredInvitations = await prisma.invitation.updateMany({
            where: {
                status: "PENDING",
                expiresAt: {
                    lt: new Date(),
                },
                isDeleted: false,
            },
            data: {
                status: "EXPIRED",
            },
        });

        results.expiredInvitations = expiredInvitations.count;

        // 2. Clean up soft deleted records older than 90 days
        try {
            const courseCleanup = await cleanupExpiredDeleted(prisma.course, 90);
            const invitationCleanup = await cleanupExpiredDeleted(prisma.invitation, 90);

            results.cleanedSoftDeleted = courseCleanup.deletedCount + invitationCleanup.deletedCount;
        } catch (error) {
            console.warn("Soft delete cleanup failed:", error);
        }

        // 3. Archive old audit logs (older than 1 year)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const oldAuditLogs = await prisma.auditLog.deleteMany({
            where: {
                timestamp: {
                    lt: oneYearAgo,
                },
                action: {
                    notIn: ["CREATE", "DELETE"], // Keep important actions longer
                },
            },
        });

        results.oldAuditLogs = oldAuditLogs.count;

        // 4. Clean up old notifications (older than 6 months for read notifications)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        await prisma.notification.deleteMany({
            where: {
                read: true,
                createdAt: {
                    lt: sixMonthsAgo,
                },
            },
        });

        // 5. Update invitation reminder counts and send reminders
        const pendingInvitations = await prisma.invitation.findMany({
            where: {
                status: "PENDING",
                expiresAt: {
                    gt: new Date(),
                    lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires within 7 days
                },
                lastReminder: {
                    lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last reminded more than 1 day ago
                },
                reminderCount: {
                    lt: 3, // Max 3 reminders
                },
                isDeleted: false,
            },
            include: {
                inviter: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                organization: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        // Update reminder count and timestamp
        for (const invitation of pendingInvitations) {
            await prisma.invitation.update({
                where: { id: invitation.id },
                data: {
                    lastReminder: new Date(),
                    reminderCount: { increment: 1 },
                },
            });

            // TODO: Send reminder email
            // await sendInvitationReminder(invitation);
        }

        // Create audit log for cleanup job
        await createAuditLog({
            action: "CLEANUP_JOB",
            entityType: "System",
            entityId: "cleanup",
            reason: "Scheduled cleanup job execution",
            metadata: results,
        });

        return NextResponse.json({
            message: "Cleanup completed successfully",
            results,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error("Cleanup job failed:", error);

        // Log the failure
        try {
            await createAuditLog({
                action: "CLEANUP_JOB_FAILED",
                entityType: "System",
                entityId: "cleanup",
                reason: "Cleanup job failed",
                metadata: { error: String(error) },
            });
        } catch (auditError) {
            console.error("Failed to log cleanup failure:", auditError);
        }

        return NextResponse.json(
            { error: "Cleanup job failed" },
            { status: 500 }
        );
    }
}

// GET /api/admin/cleanup - Get cleanup status and statistics
export async function GET(req: NextRequest) {
    try {
        // Verify admin access
        const authHeader = req.headers.get('authorization');
        const expectedToken = process.env.ADMIN_CLEANUP_TOKEN;

        if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const stats = {
            pendingInvitations: await prisma.invitation.count({
                where: {
                    status: "PENDING",
                    isDeleted: false,
                },
            }),
            expiredInvitations: await prisma.invitation.count({
                where: {
                    status: "PENDING",
                    expiresAt: { lt: new Date() },
                    isDeleted: false,
                },
            }),
            softDeletedCourses: await prisma.course.count({
                where: { isDeleted: true },
            }),
            softDeletedInvitations: await prisma.invitation.count({
                where: { isDeleted: true },
            }),
            totalAuditLogs: await prisma.auditLog.count(),
            oldAuditLogs: await prisma.auditLog.count({
                where: {
                    timestamp: {
                        lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Older than 1 year
                    },
                },
            }),
            unreadNotifications: await prisma.notification.count({
                where: { read: false },
            }),
            lastCleanupJob: await prisma.auditLog.findFirst({
                where: {
                    action: "CLEANUP_JOB",
                    entityType: "System",
                },
                orderBy: { timestamp: 'desc' },
            }),
        };

        return NextResponse.json({
            stats,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error("Failed to get cleanup stats:", error);
        return NextResponse.json(
            { error: "Failed to get cleanup statistics" },
            { status: 500 }
        );
    }
}
