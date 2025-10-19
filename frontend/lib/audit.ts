import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

interface AuditLogData {
  action: string;
  entityType: string;
  entityId: string;
  previousData?: any;
  newData?: any;
  changes?: string[];
  reason?: string;
  source?: string;
  metadata?: any;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    const currentUser = await getCurrentUser();

    await prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: currentUser?.id || null,
        previousData: data.previousData
          ? JSON.stringify(data.previousData)
          : null,
        newData: data.newData ? JSON.stringify(data.newData) : null,
        changes: data.changes ? JSON.stringify(data.changes) : null,
        reason: data.reason,
        source: data.source || "API",
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        sessionId: data.sessionId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw error to avoid breaking main operations
  }
}

export async function auditCourseAction(
  action:
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "SUBMIT_APPROVAL"
    | "APPROVE"
    | "REJECT"
    | "REQUEST_REVISION",
  courseId: string,
  previousData?: any,
  newData?: any,
  reason?: string,
  metadata?: any
) {
  await createAuditLog({
    action,
    entityType: "Course",
    entityId: courseId,
    previousData,
    newData,
    reason,
    metadata,
  });
}

export async function auditInvitationAction(
  action: "CREATE" | "UPDATE" | "ACCEPT" | "DECLINE" | "CANCEL" | "EXPIRE",
  invitationId: string,
  previousData?: any,
  newData?: any,
  reason?: string,
  metadata?: any
) {
  await createAuditLog({
    action,
    entityType: "Invitation",
    entityId: invitationId,
    previousData,
    newData,
    reason,
    metadata,
  });
}

export async function auditUserAction(
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "ROLE_CHANGE",
  userId: string,
  previousData?: any,
  newData?: any,
  reason?: string,
  metadata?: any
) {
  await createAuditLog({
    action,
    entityType: "User",
    entityId: userId,
    previousData,
    newData,
    reason,
    metadata,
  });
}

export async function auditMemberAction(
  action: "CREATE" | "UPDATE" | "DELETE" | "ASSIGN" | "REMOVE",
  memberId: string,
  previousData?: any,
  newData?: any,
  reason?: string,
  metadata?: any
) {
  await createAuditLog({
    action,
    entityType: "Member",
    entityId: memberId,
    previousData,
    newData,
    reason,
    metadata,
  });
}
