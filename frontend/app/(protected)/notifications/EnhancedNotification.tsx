import type { NotificationType } from "@prisma/client";
import {
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Heart,
  MessageCircle,
  User2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import type { NotificationData } from "@/types/types";

interface NotificationProps {
  notification: NotificationData;
}

export default function EnhancedNotification({
  notification,
}: NotificationProps) {
  const notificationTypeMap: Record<
    NotificationType,
    {
      message: string;
      icon: JSX.Element;
      href: string;
      color?: string;
      title: string;
    }
  > = {
    FOLLOW: {
      title: notification.title || "New Follower",
      message:
        notification.message ||
        `${notification.issuer.displayUsername} followed you`,
      icon: <User2 className="size-7 text-primary" />,
      href: `/${notification.issuer.username}`,
      color: "text-blue-500",
    },
    COMMENT: {
      title: notification.title || "New Comment",
      message:
        notification.message ||
        `${notification.issuer.displayUsername} commented on your post`,
      icon: <MessageCircle className="size-7 fill-primary text-primary" />,
      href: `/posts/${notification.postId}`,
      color: "text-green-500",
    },
    LIKE: {
      title: notification.title || "New Like",
      message:
        notification.message ||
        `${notification.issuer.displayUsername} liked your post`,
      icon: <Heart className="size-7 fill-red-500 text-red-500" />,
      href: `/posts/${notification.postId}`,
      color: "text-red-500",
    },
    POST: {
      title: notification.title || "Mention",
      message:
        notification.message ||
        `${notification.issuer.displayUsername} mentioned you in a post`,
      icon: <Bell className="size-7 fill-purple-500 text-purple-500" />,
      href: `/posts/${notification.postId}`,
      color: "text-purple-500",
    },
    JOB_APPLICATION: {
      title: notification.title || "Job Application",
      message:
        notification.message ||
        `${notification.issuer.displayUsername} applied to your job posting`,
      icon: <Briefcase className="size-7 fill-blue-500 text-blue-500" />,
      href: `/jobs/${notification.jobId}`,
      color: "text-blue-500",
    },
    COURSE_ENROLLMENT: {
      title: notification.title || "Course Enrollment",
      message:
        notification.message ||
        `${notification.issuer.displayUsername} enrolled in your course`,
      icon: <BookOpen className="size-7 fill-green-500 text-green-500" />,
      href: `/courses/${notification.courseId}`,
      color: "text-green-500",
    },
    RESEARCH_COLLABORATION: {
      title: notification.title || "Research Collaboration",
      message:
        notification.message ||
        `${notification.issuer.displayUsername} wants to collaborate on research`,
      icon: <Award className="size-7 fill-yellow-500 text-yellow-500" />,
      href: `/researches/${notification.researchId}`,
      color: "text-yellow-500",
    },
    SYSTEM_ANNOUNCEMENT: {
      title: notification.title || "System Announcement",
      message: notification.message || "System announcement",
      icon: <Bell className="size-7 fill-orange-500 text-orange-500" />,
      href: "/notifications/system",
      color: "text-orange-500",
    },
    PROFESSOR_INVITATION: {
      title: notification.title || "Professor Invitation",
      message:
        notification.message || "You have been invited to join as a professor",
      icon: <Award className="size-7 fill-purple-500 text-purple-500" />,
      href: "/profile/invitations",
      color: "text-purple-500",
    },
    COURSE_APPROVAL_REQUEST: {
      title: notification.title || "Course Approval Request",
      message: notification.message || "Course approval request pending",
      icon: <BookOpen className="size-7 fill-orange-500 text-orange-500" />,
      href: "/dashboard/admin/courses",
      color: "text-orange-500",
    },
    COURSE_APPROVAL_RESULT: {
      title: notification.title || "Course Approval Result",
      message: notification.message || "Course approval result available",
      icon: <Award className="size-7 fill-green-500 text-green-500" />,
      href: "/courses/my-courses",
      color: "text-green-500",
    },
    FOLLOW_REQUEST: {
      title: notification.title || "Follow Request",
      message: notification.message || `${notification.issuer.displayUsername} sent you a follow request`,
      icon: <UserPlus className="size-7 text-blue-500" />,
      href: "/connections",
      color: "text-blue-500",
    },
    FOLLOW_REQUEST_ACCEPTED: {
      title: notification.title || "Follow Request Accepted",
      message: notification.message || `${notification.issuer.displayUsername} accepted your follow request`,
      icon: <UserCheck className="size-7 text-green-500" />,
      href: `/${notification.issuer.username}`,
      color: "text-green-500",
    },
  };

  const { title, message, icon, href, color } =
    notificationTypeMap[notification.type];

  return (
    <Link className="block" href={href}>
      <article
        className={cn(
          "relative flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
          !notification.read && "border-primary border-l-4 bg-primary/5"
        )}
      >
        {!notification.read && (
          <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
        )}

        <div className="shrink-0">
          <UserAvatar avatarUrl={notification.issuer.image} size={36} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <div className={cn("shrink-0", color)}>{icon}</div>
            <span className="truncate font-bold text-sm">
              {notification.issuer.displayUsername}
            </span>
          </div>

          <h3 className="font-semibold text-md">{title}</h3>
          <p className="mb-2 text-muted-foreground text-sm">{message}</p>

          {notification.post && (
            <div className="line-clamp-2 whitespace-pre-line rounded-lg bg-muted/50 p-3 text-muted-foreground text-sm">
              {notification.post.content}
            </div>
          )}

          {notification.job && (
            <div className="rounded-lg bg-muted/50 p-3 text-muted-foreground text-sm">
              <p className="font-medium">{notification.job.title}</p>
            </div>
          )}

          {notification.course && (
            <div className="rounded-lg bg-muted/50 p-3 text-muted-foreground text-sm">
              <p className="font-medium">
                {notification.course.title} ({notification.course.code})
              </p>
            </div>
          )}

          {notification.research && (
            <div className="rounded-lg bg-muted/50 p-3 text-muted-foreground text-sm">
              <p className="font-medium">{notification.research.title}</p>
            </div>
          )}

          <div className="mt-2 text-muted-foreground text-xs">
            {new Date(notification.createdAt).toLocaleString()}
          </div>
        </div>
      </article>
    </Link>
  );
}
