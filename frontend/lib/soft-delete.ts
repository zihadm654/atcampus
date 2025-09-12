import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

interface SoftDeleteOptions {
    reason?: string;
    userId?: string;
    metadata?: any;
}

// Generic soft delete function
export async function softDelete(
    model: any,
    id: string,
    options: SoftDeleteOptions = {}
) {
    const { reason, userId, metadata } = options;

    // Get the current record for audit trail
    const currentRecord = await model.findUnique({ where: { id } });

    if (!currentRecord) {
        throw new Error("Record not found");
    }

    if (currentRecord.isDeleted) {
        throw new Error("Record is already deleted");
    }

    // Perform soft delete
    const updatedRecord = await model.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });

    // Create audit log
    await createAuditLog({
        action: 'SOFT_DELETE',
        entityType: model.name || 'Unknown',
        entityId: id,
        previousData: currentRecord,
        newData: updatedRecord,
        reason: reason || 'No reason provided',
        metadata,
    });

    return updatedRecord;
}

// Restore soft deleted record
export async function restoreSoftDeleted(
    model: any,
    id: string,
    options: SoftDeleteOptions = {}
) {
    const { reason, userId, metadata } = options;

    const currentRecord = await model.findUnique({ where: { id } });

    if (!currentRecord) {
        throw new Error("Record not found");
    }

    if (!currentRecord.isDeleted) {
        throw new Error("Record is not deleted");
    }

    const updatedRecord = await model.update({
        where: { id },
        data: {
            isDeleted: false,
            deletedAt: null,
        },
    });

    await createAuditLog({
        action: 'RESTORE',
        entityType: model.name || 'Unknown',
        entityId: id,
        previousData: currentRecord,
        newData: updatedRecord,
        reason: reason || 'Restored from soft delete',
        metadata,
    });

    return updatedRecord;
}

// Get all records including soft deleted
export function includeDeleted(whereClause: any = {}) {
    return whereClause;
}

// Get only active (non-deleted) records
export function excludeDeleted(whereClause: any = {}) {
    return {
        ...whereClause,
        isDeleted: false,
    };
}

// Get only soft deleted records
export function onlyDeleted(whereClause: any = {}) {
    return {
        ...whereClause,
        isDeleted: true,
    };
}

// Course-specific soft delete functions
export async function softDeleteCourse(courseId: string, reason?: string) {
    return await softDelete(prisma.course, courseId, { reason });
}

export async function restoreCourse(courseId: string, reason?: string) {
    return await restoreSoftDeleted(prisma.course, courseId, { reason });
}

// Invitation-specific soft delete functions
export async function softDeleteInvitation(invitationId: string, reason?: string) {
    return await softDelete(prisma.invitation, invitationId, { reason });
}

export async function restoreInvitation(invitationId: string, reason?: string) {
    return await restoreSoftDeleted(prisma.invitation, invitationId, { reason });
}

// Bulk soft delete with transaction
export async function bulkSoftDelete(
    modelName: string,
    ids: string[],
    reason?: string
) {
    return await prisma.$transaction(async (tx) => {
        const results: any[] = [];

        for (const id of ids) {
            // Dynamically access the model based on modelName
            const modelInstance = (tx as any)[modelName];

            const currentRecord = await modelInstance.findUnique({
                where: { id }
            });

            if (currentRecord && !currentRecord.isDeleted) {
                const updated = await modelInstance.update({
                    where: { id },
                    data: {
                        isDeleted: true,
                        deletedAt: new Date(),
                    },
                });

                results.push(updated);

                await createAuditLog({
                    action: 'BULK_SOFT_DELETE',
                    entityType: modelName,
                    entityId: id,
                    previousData: currentRecord,
                    newData: updated,
                    reason: reason || 'Bulk deletion',
                });
            }
        }

        return results;
    });
}

// Cleanup expired soft deleted records (hard delete after retention period)
export async function cleanupExpiredDeleted(
    model: any,
    retentionDays: number = 90
) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const expiredRecords = await model.findMany({
        where: {
            isDeleted: true,
            deletedAt: {
                lt: cutoffDate,
            },
        },
    });

    for (const record of expiredRecords) {
        await createAuditLog({
            action: 'HARD_DELETE',
            entityType: model.name,
            entityId: record.id,
            previousData: record,
            reason: `Automatic cleanup after ${retentionDays} days retention period`,
        });
    }

    const deleteResult = await model.deleteMany({
        where: {
            isDeleted: true,
            deletedAt: {
                lt: cutoffDate,
            },
        },
    });

    return {
        deletedCount: deleteResult.count,
        expiredRecords,
    };
}
