import { prisma } from "@/lib/db";
import { NotificationType, Notification } from "@prisma/client";

export interface CreateNotificationData {
  type: NotificationType;
  recipientId: string;
  issuerId: string;
  postId?: string;
  jobId?: string;
  courseId?: string;
  researchId?: string;
  message?: string;
}

export async function createNotification(data: CreateNotificationData): Promise<Notification> {
  return await prisma.notification.create({
    data: {
      type: data.type,
      recipientId: data.recipientId,
      issuerId: data.issuerId,
      postId: data.postId,
      jobId: data.jobId,
      courseId: data.courseId,
      researchId: data.researchId,
      message: data.message,
      read: false,
    },
    include: {
      issuer: {
        select: {
          id: true,
          username: true,
          displayUsername: true,
          image: true,
        },
      },
      post: data.postId ? {
        select: {
          id: true,
          content: true,
        },
      } : false,
      job: data.jobId ? {
        select: {
          id: true,
          title: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      } : false,
      course: data.courseId ? {
        select: {
          id: true,
          title: true,
          code: true,
        },
      } : false,
    },
  });
}

export async function createBulkNotifications(data: CreateNotificationData[]): Promise<Notification[]> {
  const notifications = await Promise.all(
    data.map(item => createNotification(item))
  );
  return notifications;
}

export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { 
      recipientId: userId,
      read: false 
    },
    data: { read: true },
  });
  return result.count;
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return await prisma.notification.count({
    where: { 
      recipientId: userId,
      read: false 
    },
  });
}

export async function getUserNotifications(
  userId: string, 
  limit: number = 20, 
  cursor?: string
) {
  const notifications = await prisma.notification.findMany({
    where: { recipientId: userId },
    include: {
      issuer: {
        select: {
          id: true,
          username: true,
          displayUsername: true,
          image: true,
        },
      },
      post: {
        select: {
          id: true,
          content: true,
        },
      },
      job: {
        select: {
          id: true,
          title: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          code: true,
        },
      },
      // Note: club and event relations are not available in Notification model
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
  });

  const nextCursor = notifications.length > limit ? notifications[limit].id : null;
  const data = notifications.length > limit ? notifications.slice(0, limit) : notifications;

  return {
    notifications: data,
    nextCursor,
  };
}

// Club-specific notification helpers
export async function notifyClubMemberJoined(clubId: string, memberId: string, userId: string) {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { name: true, members: { where: { role: "ADVISOR" }, select: { userId: true } } }
  });

  if (!club) return;

  // Notify club advisors
  const advisorNotifications = club.members.map(advisor => 
    createNotification({
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      recipientId: advisor.userId,
      issuerId: userId,
      message: `New member joined ${club.name}`,
    })
  );

  await Promise.all(advisorNotifications);
}

export async function notifyClubEventCreated(clubId: string, eventId: string, userId: string) {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { 
      name: true, 
      members: { 
        where: { isActive: true }, 
        select: { userId: true } 
      } 
    }
  });

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { name: true }
  });

  if (!club || !event) return;

  // Notify all club members
  const memberNotifications = club.members.map(member => 
    createNotification({
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      recipientId: member.userId,
      issuerId: userId,
      message: `New event "${event.name}" created in ${club.name}`,
    })
  );

  await Promise.all(memberNotifications);
}

// Event-specific notification helpers
export async function notifyEventReminder(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { name: true, startDate: true, creatorId: true }
  });

  if (!event) return;

  await createNotification({
    type: NotificationType.SYSTEM_ANNOUNCEMENT,
    recipientId: userId,
    issuerId: event.creatorId || "system",
    message: `Reminder: ${event.name} starts soon`,
  });
}

export async function notifyEventCapacityReached(eventId: string, name: string, newAttendeeCount: number, maxAttendees: number) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { name: true, creatorId: true, maxAttendees: true }
  });

  if (!event || !event.creatorId) return;

  await createNotification({
    type: NotificationType.SYSTEM_ANNOUNCEMENT,
    recipientId: event.creatorId,
    issuerId: "system",
    message: `Event "${event.name}" has reached maximum capacity`,
  });
}