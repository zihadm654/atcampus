import { prisma } from "@/lib/prisma";
import type { Notification } from "@prisma/client";
import { NotificationType } from "@prisma/client";

export interface CreateNotificationData {
  type: NotificationType;
  recipientId: string;
  issuerId: string;
  postId?: string;
  jobId?: string;
  courseId?: string;
  researchId?: string;
  invitationId?: string;
  title?: string;
  message?: string;
}

export async function createNotification(
  data: CreateNotificationData,
): Promise<Notification> {
  return await prisma.notification.create({
    data: {
      type: data.type,
      recipientId: data.recipientId,
      issuerId: data.issuerId,
      postId: data.postId,
      jobId: data.jobId,
      courseId: data.courseId,
      researchId: data.researchId,
      invitationId: data.invitationId,
      title: data.title,
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
      post: data.postId
        ? {
            select: {
              id: true,
              content: true,
            },
          }
        : false,
      job: data.jobId
        ? {
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
          }
        : false,
      course: data.courseId
        ? {
            select: {
              id: true,
              title: true,
              code: true,
            },
          }
        : false,
      research: data.researchId
        ? {
            select: {
              id: true,
              title: true,
            },
          }
        : false,
      invitation: data.invitationId
        ? {
            select: {
              id: true,
              email: true,
            },
          }
        : false,
    },
  });
}

export async function createBulkNotifications(
  data: CreateNotificationData[],
): Promise<Notification[]> {
  const notifications = await Promise.all(
    data.map((item) => createNotification(item)),
  );
  return notifications;
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<Notification> {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead(
  userId: string,
): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: {
      recipientId: userId,
      read: false,
    },
    data: { read: true },
  });
  return result.count;
}

export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  return await prisma.notification.count({
    where: {
      recipientId: userId,
      read: false,
    },
  });
}

export async function getUserNotifications(
  userId: string,
  limit = 20,
  cursor?: string,
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
      research: {
        select: {
          id: true,
          title: true,
        },
      },
      invitation: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
  });

  const nextCursor =
    notifications.length > limit ? notifications[limit].id : null;
  const data =
    notifications.length > limit
      ? notifications.slice(0, limit)
      : notifications;

  return {
    notifications: data,
    nextCursor,
  };
}

// Specific notification creators for different actions

// Course enrollment notification
export async function notifyCourseEnrollment(
  courseId: string,
  studentId: string,
  instructorId: string,
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      title: true,
      code: true,
    },
  });

  if (!course) return;

  await createNotification({
    type: NotificationType.COURSE_ENROLLMENT,
    recipientId: instructorId,
    issuerId: studentId,
    courseId,
    title: "New Course Enrollment",
    message: `A student has enrolled in your course "${course.title}" (${course.code})`,
  });
}

// Job application notification
export async function notifyJobApplication(
  jobId: string,
  applicantId: string,
  employerId: string,
) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      title: true,
    },
  });

  if (!job) return;

  await createNotification({
    type: NotificationType.JOB_APPLICATION,
    recipientId: employerId,
    issuerId: applicantId,
    jobId,
    title: "New Job Application",
    message: `You have a new application for "${job.title}"`,
  });
}

// Research collaboration request notification
export async function notifyResearchCollaboration(
  researchId: string,
  requesterId: string,
  recipientId: string,
) {
  const research = await prisma.research.findUnique({
    where: { id: researchId },
    select: {
      title: true,
    },
  });

  if (!research) return;

  await createNotification({
    type: NotificationType.RESEARCH_COLLABORATION,
    recipientId,
    issuerId: requesterId,
    researchId,
    title: "Research Collaboration Request",
    message: `Someone wants to collaborate with you on "${research.title}"`,
  });
}

// Course approval request notification
export async function notifyCourseApprovalRequest(
  courseId: string,
  instructorId: string,
  reviewerId: string,
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      title: true,
      code: true,
    },
  });

  const instructor = await prisma.user.findUnique({
    where: { id: instructorId },
    select: {
      name: true,
    },
  });

  if (!(course && instructor)) return;

  await createNotification({
    type: NotificationType.COURSE_APPROVAL_REQUEST,
    recipientId: reviewerId,
    issuerId: instructorId,
    courseId,
    title: "Course Approval Request",
    message: `${instructor.name} has submitted "${course.title}" (${course.code}) for approval`,
  });
}

// Course approval result notification
export async function notifyCourseApprovalResult(
  courseId: string,
  instructorId: string,
  reviewerId: string,
  decision: string,
  comments?: string,
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      title: true,
      code: true,
    },
  });

  const reviewer = await prisma.user.findUnique({
    where: { id: reviewerId },
    select: {
      name: true,
    },
  });

  if (!(course && reviewer)) return;

  await createNotification({
    type: NotificationType.COURSE_APPROVAL_RESULT,
    recipientId: instructorId,
    issuerId: reviewerId,
    courseId,
    title: `Course ${decision}`,
    message: `${reviewer.name} has ${decision.toLowerCase()} your course "${course.title}" (${course.code})${comments ? `. Comments: ${comments}` : ""}`,
  });
}

// Professor invitation notification
export async function notifyProfessorInvitation(
  invitationId: string,
  senderId: string,
  recipientEmail: string,
) {
  await createNotification({
    type: NotificationType.PROFESSOR_INVITATION,
    recipientId: recipientEmail, // This might need to be handled differently
    issuerId: senderId,
    invitationId,
    title: "Professor Invitation",
    message: "You have been invited to join as a professor",
  });
}

// Comment notification
export async function notifyComment(
  postId: string,
  commenterId: string,
  postOwnerId: string,
) {
  // Don't notify if user is commenting on their own post
  if (commenterId === postOwnerId) return;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      content: true,
    },
  });

  if (!post) return;

  await createNotification({
    type: NotificationType.COMMENT,
    recipientId: postOwnerId,
    issuerId: commenterId,
    postId,
    title: "New Comment",
    message: "Someone commented on your post",
  });
}

// Like notification
export async function notifyLike(
  postId: string,
  likerId: string,
  postOwnerId: string,
) {
  // Don't notify if user is liking their own post
  if (likerId === postOwnerId) return;

  await createNotification({
    type: NotificationType.LIKE,
    recipientId: postOwnerId,
    issuerId: likerId,
    postId,
    title: "New Like",
    message: "Someone liked your post",
  });
}

// Follow notification
export async function notifyFollow(followerId: string, followingId: string) {
  const follower = await prisma.user.findUnique({
    where: { id: followerId },
    select: {
      name: true,
    },
  });

  if (!follower) return;

  await createNotification({
    type: NotificationType.FOLLOW,
    recipientId: followingId,
    issuerId: followerId,
    title: "New Follower",
    message: `${follower.name} is now following you`,
  });
}

// Follow request notification
export async function notifyFollowRequest(
  requesterId: string,
  targetId: string,
) {
  const requester = await prisma.user.findUnique({
    where: { id: requesterId },
    select: {
      name: true,
      username: true,
    },
  });

  if (!requester) return;

  await createNotification({
    type: NotificationType.FOLLOW_REQUEST,
    recipientId: targetId,
    issuerId: requesterId,
    title: "New Follow Request",
    message: `${requester.name} sent you a follow request`,
  });
}

// Follow request accepted notification
export async function notifyFollowRequestAccepted(
  targetId: string,
  requesterId: string,
) {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: {
      name: true,
      username: true,
    },
  });

  if (!target) return;

  await createNotification({
    type: NotificationType.FOLLOW_REQUEST_ACCEPTED,
    recipientId: requesterId,
    issuerId: targetId,
    title: "Follow Request Accepted",
    message: `${target.name} accepted your follow request`,
  });
}

// Club-specific notification helpers
export async function notifyClubMemberJoined(clubId: string, userId: string) {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      name: true,
      members: { where: { role: "ADVISOR" }, select: { userId: true } },
    },
  });

  if (!club) return;

  // Notify club advisors
  const advisorNotifications = club.members.map((advisor: any) =>
    createNotification({
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      recipientId: advisor.userId,
      issuerId: userId,
      title: "New Club Member",
      message: `New member joined ${club.name}`,
    }),
  );

  await Promise.all(advisorNotifications);
}

export async function notifyClubEventCreated(
  clubId: string,
  eventId: string,
  userId: string,
) {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      name: true,
      members: {
        where: { isActive: true },
        select: { userId: true },
      },
    },
  });

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { name: true },
  });

  if (!(club && event)) return;

  // Notify all club members
  const memberNotifications = club.members.map((member: any) =>
    createNotification({
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      recipientId: member.userId,
      issuerId: userId,
      title: "New Club Event",
      message: `New event "${event.name}" created in ${club.name}`,
    }),
  );

  await Promise.all(memberNotifications);
}

// Event-specific notification helpers
export async function notifyEventReminder(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { name: true, startDate: true, creatorId: true },
  });

  if (!event) return;

  await createNotification({
    type: NotificationType.SYSTEM_ANNOUNCEMENT,
    recipientId: userId,
    issuerId: event.creatorId || "system",
    title: "Event Reminder",
    message: `Reminder: ${event.name} starts soon`,
  });
}

export async function notifyEventCapacityReached(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { name: true, creatorId: true, maxAttendees: true },
  });

  if (!event?.creatorId) return;

  await createNotification({
    type: NotificationType.SYSTEM_ANNOUNCEMENT,
    recipientId: event.creatorId,
    issuerId: "system",
    title: "Event Capacity Reached",
    message: `Event "${event.name}" has reached maximum capacity`,
  });
}
