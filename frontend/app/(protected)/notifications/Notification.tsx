import type { NotificationType } from "@prisma/client";
import { Heart, MessageCircle, User2 } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import type { NotificationData } from "@/types/types";

interface NotificationProps {
  notification: NotificationData;
}

export default function Notification({ notification }: NotificationProps) {
  const notificationTypeMap: Record<
    NotificationType,
    { message: string; icon: JSX.Element; href: string }
  > = {
    FOLLOW: {
      message: `${notification.issuer.displayUsername} followed you`,
      icon: <User2 className="size-7 text-primary" />,
      href: `/${notification.issuer.username}`,
    },
    COMMENT: {
      message: `${notification.issuer.displayUsername} commented on your post`,
      icon: <MessageCircle className="size-7 fill-primary text-primary" />,
      href: `/posts/${notification.postId}`,
    },
    LIKE: {
      message: `${notification.issuer.displayUsername} liked your post`,
      icon: <Heart className="size-7 fill-red-500 text-red-500" />,
      href: `/posts/${notification.postId}`,
    },
    POST: {
      message: `${notification.issuer.displayUsername} liked your post`,
      icon: <Heart className="size-7 fill-red-500 text-red-500" />,
      href: `/posts/${notification.postId}`,
    },
    JOB_APPLICATION: {
      message: `${notification.issuer.displayUsername} applied job`,
      icon: <Heart className="size-7 fill-red-500 text-red-500" />,
      href: `/jobs/${notification.jobId}`,
    },
    COURSE_ENROLLMENT: {
      message: `${notification.issuer.displayUsername} enrolled course`,
      icon: <Heart className="size-7 fill-red-500 text-red-500" />,
      href: `/courses/${notification.jobId}`,
    },
    RESEARCH_COLLABORATION: {
      message: "",
      icon: <Heart className="size-7 fill-current text-current" />,
      href: "",
    },
    SYSTEM_ANNOUNCEMENT: {
      message: "",
      icon: <Heart className="size-7 fill-current text-current" />,
      href: "",
    },
    PROFESSOR_INVITATION: {
      message: "",
      icon: <Heart className="size-7 fill-current text-current" />,
      href: "",
    },
    COURSE_APPROVAL_REQUEST: {
      message: "",
      icon: <Heart className="size-7 fill-current text-current" />,
      href: "",
    },
    COURSE_APPROVAL_RESULT: {
      message: "",
      icon: <Heart className="size-7 fill-current text-current" />,
      href: "",
    },
  };

  const { message, icon, href } = notificationTypeMap[notification.type];

  return (
    <Link className="block" href={href}>
      <article
        className={cn(
          "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
          !notification.read && "bg-primary/10"
        )}
      >
        <div className="my-1">{icon}</div>
        <div className="space-y-3">
          <UserAvatar avatarUrl={notification.issuer.image} size={36} />
          <div>
            <span className="font-bold">
              {notification.issuer.displayUsername}
            </span>{" "}
            <span>{message}</span>
          </div>
          {notification.post && (
            <div className="line-clamp-3 whitespace-pre-line text-muted-foreground">
              {notification.post.content}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
